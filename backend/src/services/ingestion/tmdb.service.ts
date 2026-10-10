import { PrismaClient, ContentType, ExternalSource } from '@prisma/client';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';

const TMDB_GENRES: Record<number, string> = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familiar',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia Ficción',
  10770: 'Película de TV',
  53: 'Suspense',
  10752: 'Bélica',
  37: 'Western',
  10759: 'Acción & Aventura',
  10765: 'Sci-Fi & Fantasy',
};

interface TMDBMovie {
  id: number;
  title?: string;
  name?: string; // para series de TV
  overview: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
}

export class TMDBIngestionService {
  private apiKey: string | undefined;

  constructor(private prisma: PrismaClient) {
    this.apiKey = process.env.TMDB_API_KEY;
  }

  /**
   * Obtiene la key del trailer de YouTube para una película o serie
   */
  private async getYoutubeTrailer(type: 'movie' | 'tv', id: number): Promise<string | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${this.apiKey}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { results?: Array<{ site: string; type: string; key: string }> };
      const trailer = data.results?.find(
        (v) => v.site.toLowerCase() === 'youtube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch {
      return null;
    }
  }

  /**
   * Ingesta películas populares o top rated de TMDB
   */
  async ingestMovies(page = 1): Promise<number> {
    if (!this.apiKey || this.apiKey.includes('tu_') || this.apiKey === 'your_api_key') {
      console.warn('ℹ️ [TMDB] Configura una TMDB_API_KEY real en backend/.env para importar películas.');
      return 0;
    }

    console.log(`[TMDB] Obteniendo página ${page} de películas top...`);
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/movie/top_rated?api_key=${this.apiKey}&language=es-ES&page=${page}`
      );
      if (res.status === 401) {
        console.warn('⚠️ [TMDB] La clave TMDB_API_KEY proporcionada no es válida (401 Unauthorized).');
        return 0;
      }
      if (!res.ok) {
        throw new Error(`Error en TMDB: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as { results: TMDBMovie[] };
      return this.saveBatch(data.results, ContentType.movie, 'movie');
    } catch (err) {
      console.warn('⚠️ [TMDB] No se pudieron sincronizar películas:', (err as Error).message);
      return 0;
    }
  }

  /**
   * Ingesta series populares o top rated de TMDB
   */
  async ingestSeries(page = 1): Promise<number> {
    if (!this.apiKey || this.apiKey.includes('tu_') || this.apiKey === 'your_api_key') {
      console.warn('ℹ️ [TMDB] Configura una TMDB_API_KEY real en backend/.env para importar series.');
      return 0;
    }

    console.log(`[TMDB] Obteniendo página ${page} de series top...`);
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/tv/top_rated?api_key=${this.apiKey}&language=es-ES&page=${page}`
      );
      if (res.status === 401) {
        console.warn('⚠️ [TMDB] La clave TMDB_API_KEY proporcionada no es válida (401 Unauthorized).');
        return 0;
      }
      if (!res.ok) {
        throw new Error(`Error en TMDB: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as { results: TMDBMovie[] };
      return this.saveBatch(data.results, ContentType.series, 'tv');
    } catch (err) {
      console.warn('⚠️ [TMDB] No se pudieron sincronizar series:', (err as Error).message);
      return 0;
    }
  }

  private async saveBatch(
    items: TMDBMovie[],
    contentType: ContentType,
    tmdbType: 'movie' | 'tv'
  ): Promise<number> {
    let savedCount = 0;

    for (const item of items) {
      const title = item.title || item.name || 'Sin título';
      const synopsis = item.overview || 'Sin sinopsis disponible.';
      const cover_url = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null;
      const critic_rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : null;
      const popularity_score = Math.min(100, Number(item.popularity.toFixed(1)));
      const is_mainstream = item.vote_average >= 8.2 || item.popularity > 50;

      const trailer_url = await this.getYoutubeTrailer(tmdbType, item.id);

      const saved = await this.prisma.contentItem.upsert({
        where: {
          external_source_external_id: {
            external_source: ExternalSource.tmdb,
            external_id: String(item.id),
          },
        },
        update: {
          title,
          synopsis,
          cover_url,
          critic_rating,
          popularity_score,
          is_mainstream,
          trailer_url,
        },
        create: {
          type: contentType,
          title,
          synopsis,
          cover_url,
          critic_rating,
          popularity_score,
          is_mainstream,
          trailer_url,
          external_source: ExternalSource.tmdb,
          external_id: String(item.id),
        },
      });

      // Vincular géneros
      if (item.genre_ids && item.genre_ids.length > 0) {
        for (const gid of item.genre_ids.slice(0, 3)) {
          const genreName = TMDB_GENRES[gid];
          if (!genreName) continue;

          const genre = await this.prisma.genre.upsert({
            where: {
              name_applies_to: {
                name: genreName,
                applies_to: contentType,
              },
            },
            update: {},
            create: {
              name: genreName,
              applies_to: contentType,
            },
          });

          await this.prisma.contentGenre.upsert({
            where: {
              content_id_genre_id: {
                content_id: saved.id,
                genre_id: genre.id,
              },
            },
            update: {},
            create: {
              content_id: saved.id,
              genre_id: genre.id,
            },
          });
        }
      }

      savedCount++;
    }

    return savedCount;
  }
}

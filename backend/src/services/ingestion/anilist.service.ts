import { PrismaClient, ContentType, ExternalSource } from '@prisma/client';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const MEDIA_QUERY = `
query ($page: Int, $perPage: Int, $type: MediaType, $format_in: [MediaFormat], $countryOfOrigin: CountryCode) {
  Page(page: $page, perPage: $perPage) {
    media(type: $type, format_in: $format_in, countryOfOrigin: $countryOfOrigin, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      coverImage {
        extraLarge
        large
      }
      averageScore
      popularity
      genres
      trailer {
        id
        site
      }
    }
  }
}
`;

interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    extraLarge: string | null;
    large: string | null;
  };
  averageScore: number | null;
  popularity: number;
  genres: string[];
  trailer: {
    id: string;
    site: string;
  } | null;
}

export class AniListIngestionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Limpia tags HTML residuales en descripciones de AniList
   */
  private cleanDescription(text: string | null): string {
    if (!text) return 'Sin descripción disponible.';
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Ingesta anime popular
   */
  async ingestAnime(perPage = 10): Promise<number> {
    console.log(`[AniList] Obteniendo ${perPage} animes populares...`);
    const items = await this.fetchAniList({
      page: 1,
      perPage,
      type: 'ANIME',
      format_in: ['TV', 'MOVIE'],
    });
    return this.saveMediaBatch(items, ContentType.anime);
  }

  /**
   * Ingesta manhwa popular (Manga de Corea del Sur)
   */
  async ingestManhwa(perPage = 10): Promise<number> {
    console.log(`[AniList] Obteniendo ${perPage} manhwas populares...`);
    const items = await this.fetchAniList({
      page: 1,
      perPage,
      type: 'MANGA',
      countryOfOrigin: 'KR',
    });
    return this.saveMediaBatch(items, ContentType.manhwa);
  }

  /**
   * Ingesta manga popular tradicional
   */
  async ingestManga(perPage = 10): Promise<number> {
    console.log(`[AniList] Obteniendo ${perPage} mangas populares...`);
    const items = await this.fetchAniList({
      page: 1,
      perPage,
      type: 'MANGA',
      countryOfOrigin: 'JP',
    });
    return this.saveMediaBatch(items, ContentType.manga);
  }

  private async fetchAniList(variables: Record<string, any>): Promise<AniListMedia[]> {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'HiddenDiscoveryApp/1.0',
      },
      body: JSON.stringify({
        query: MEDIA_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en API AniList: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as {
      data?: { Page?: { media?: AniListMedia[] } };
      errors?: Array<{ message: string }>;
    };

    if (json.errors && json.errors.length > 0) {
      throw new Error(`AniList GraphQL Error: ${json.errors[0].message}`);
    }

    return json.data?.Page?.media ?? [];
  }

  private async saveMediaBatch(items: AniListMedia[], contentType: ContentType): Promise<number> {
    let savedCount = 0;

    for (const item of items) {
      const title = item.title.english || item.title.romaji || item.title.native || 'Sin título';
      const synopsis = this.cleanDescription(item.description);
      const cover_url = item.coverImage.extraLarge || item.coverImage.large || null;
      const critic_rating = item.averageScore ? Number((item.averageScore / 10).toFixed(1)) : null;
      const popularity_score = Math.min(100, Number((item.popularity / 1500).toFixed(1)));
      const is_mainstream = item.popularity > 90000;

      let trailer_url: string | null = null;
      if (item.trailer?.site?.toLowerCase() === 'youtube' && item.trailer.id) {
        trailer_url = `https://www.youtube.com/watch?v=${item.trailer.id}`;
      }

      // Upsert en ContentItem
      const saved = await this.prisma.contentItem.upsert({
        where: {
          external_source_external_id: {
            external_source: ExternalSource.anilist,
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
          external_source: ExternalSource.anilist,
          external_id: String(item.id),
        },
      });

      // Vincular géneros
      if (item.genres && item.genres.length > 0) {
        for (const genreName of item.genres.slice(0, 3)) {
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

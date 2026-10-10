import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { AniListIngestionService } from '../services/ingestion/anilist.service';
import { TMDBIngestionService } from '../services/ingestion/tmdb.service';

const prisma = new PrismaClient();

async function runIngestion() {
  console.log('🚀 Iniciando pipeline de ingesta automatizada...');

  const anilistService = new AniListIngestionService(prisma);
  const tmdbService = new TMDBIngestionService(prisma);

  try {
    // 1. AniList (No requiere API key pública)
    console.log('\n--- Ingestando AniList (Anime & Manhwa) ---');
    const animeCount = await anilistService.ingestAnime(15);
    console.log(`✅ Ingestados ${animeCount} animes.`);

    const manhwaCount = await anilistService.ingestManhwa(15);
    console.log(`✅ Ingestados ${manhwaCount} manhwas.`);

    const mangaCount = await anilistService.ingestManga(10);
    console.log(`✅ Ingestados ${mangaCount} mangas.`);

    // 2. TMDB (Películas y Series)
    console.log('\n--- Ingestando TMDB (Películas & Series) ---');
    if (process.env.TMDB_API_KEY) {
      const movieCount = await tmdbService.ingestMovies(1);
      console.log(`✅ Ingestadas ${movieCount} películas.`);

      const seriesCount = await tmdbService.ingestSeries(1);
      console.log(`✅ Ingestadas ${seriesCount} series.`);
    } else {
      console.log('ℹ️ Para sincronizar cientos de películas y series automáticamente:');
      console.log('  1. Consigue una API Key gratis en https://themoviedb.org');
      console.log('  2. Añade TMDB_API_KEY="tu_clave" en backend/.env');
      console.log('  3. Vuelve a ejecutar este comando ("npm run ingest").');
    }

    const total = await prisma.contentItem.count();
    console.log(`\n🎉 Pipeline completado con éxito. Total contenidos en base de datos: ${total}`);
  } catch (err) {
    console.error('❌ Error durante la ingesta:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIngestion();

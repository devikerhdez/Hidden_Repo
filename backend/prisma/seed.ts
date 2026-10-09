import { PrismaClient, ContentType, ExternalSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando proceso de seed...');

  const password_hash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@hidden.app' },
    update: {},
    create: {
      email: 'test@hidden.app',
      username: 'testuser',
      password_hash,
      coins: 50,
    },
  });

  const genresData = [
    { name: 'Acción', applies_to: ContentType.movie },
    { name: 'Ciencia Ficción', applies_to: ContentType.movie },
    { name: 'Drama', applies_to: ContentType.movie },
    { name: 'Terror', applies_to: ContentType.movie },
    { name: 'Comedia', applies_to: ContentType.movie },
    { name: 'Thriller', applies_to: ContentType.series },
    { name: 'Drama', applies_to: ContentType.series },
    { name: 'Misterio', applies_to: ContentType.series },
    { name: 'Sci-Fi', applies_to: ContentType.series },
    { name: 'Shounen', applies_to: ContentType.anime },
    { name: 'Seinen', applies_to: ContentType.anime },
    { name: 'Psicológico', applies_to: ContentType.anime },
    { name: 'Fantasía', applies_to: ContentType.anime },
    { name: 'Acción', applies_to: ContentType.manhwa },
    { name: 'Fantasía', applies_to: ContentType.manhwa },
    { name: 'Sobrenatural', applies_to: ContentType.manhwa },
    { name: 'Seinen', applies_to: ContentType.manga },
    { name: 'Terror', applies_to: ContentType.manga },
    { name: 'Metroidvania', applies_to: ContentType.videogame },
    { name: 'Aventura', applies_to: ContentType.videogame },
    { name: 'RPG', applies_to: ContentType.videogame },
    { name: 'Indie', applies_to: ContentType.videogame },
    { name: 'Exploración', applies_to: ContentType.videogame },
  ];

  const genreMap = new Map<string, string>();

  for (const g of genresData) {
    const created = await prisma.genre.upsert({
      where: { name_applies_to: { name: g.name, applies_to: g.applies_to } },
      update: {},
      create: g,
    });
    genreMap.set(`${g.applies_to}:${g.name}`, created.id);
  }

  const sampleContent = [
    // --- PELÍCULAS ---
    {
      type: ContentType.movie,
      title: 'Inception',
      synopsis: 'Dom Cobb es un ladrón capaz de adentrarse en los sueños de la gente y hacerse con sus secretos empresariales más valiosos.',
      cover_url: 'https://image.tmdb.org/t/p/w780/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      critic_rating: 8.8,
      popularity_score: 95.0,
      is_mainstream: true,
      external_source: ExternalSource.tmdb,
      external_id: '27205',
      genres: ['Acción', 'Ciencia Ficción'],
    },
    {
      type: ContentType.movie,
      title: 'Parasite',
      synopsis: 'Tanto Gi-taek como su familia están sin trabajo. Cuando su hijo mayor empieza a dar clases particulares en la adinerada casa de los Park, las dos familias se entrecruzan.',
      cover_url: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=5xH0RaqPUgk',
      critic_rating: 8.9,
      popularity_score: 91.5,
      is_mainstream: true,
      external_source: ExternalSource.tmdb,
      external_id: '496243',
      genres: ['Drama', 'Comedia'],
    },
    {
      type: ContentType.movie,
      title: 'Coherence',
      synopsis: 'Durante el paso de un cometa, un grupo de amigos cena y empiezan a ocurrir desconcertantes fenómenos cuánticos que fragmentan la realidad.',
      cover_url: 'https://image.tmdb.org/t/p/w780/a9a08wA2fBbh2i3l2x3fT5Q9b8U.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=sPE3rO2jE2k',
      critic_rating: 8.2,
      popularity_score: 58.0,
      is_mainstream: false,
      external_source: ExternalSource.tmdb,
      external_id: '220289',
      genres: ['Ciencia Ficción', 'Terror'],
    },

    // --- SERIES ---
    {
      type: ContentType.series,
      title: 'Dark',
      synopsis: 'La misteriosa desaparición de dos niños en un pueblo alemán expone las dobles vidas y fracturas temporales de cuatro familias a lo largo de tres generaciones.',
      cover_url: 'https://image.tmdb.org/t/p/w780/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=rrwycJ08PSA',
      critic_rating: 8.7,
      popularity_score: 84.0,
      is_mainstream: true,
      external_source: ExternalSource.tmdb,
      external_id: '70523',
      genres: ['Misterio', 'Sci-Fi'],
    },
    {
      type: ContentType.series,
      title: 'Severance',
      synopsis: 'Mark lidera un equipo cuyos empleados se han sometido a un procedimiento quirúrgico que separa sus recuerdos laborales de sus recuerdos personales.',
      cover_url: 'https://image.tmdb.org/t/p/w780/b02ybaflff9NzyV0a67jA9qTphB.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=xEQP4VVuyrY',
      critic_rating: 8.8,
      popularity_score: 72.0,
      is_mainstream: false,
      external_source: ExternalSource.tmdb,
      external_id: '93740',
      genres: ['Thriller', 'Sci-Fi'],
    },

    // --- ANIME ---
    {
      type: ContentType.anime,
      title: 'Steins;Gate',
      synopsis: 'Un autoproclamado científico loco inventa accidentalmente un microondas capaz de enviar mensajes al pasado, desatando una conspiración global.',
      cover_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-7pdcVzQSkpKq.png',
      trailer_url: 'https://www.youtube.com/watch?v=27OZcZohVG8',
      critic_rating: 9.1,
      popularity_score: 89.0,
      is_mainstream: true,
      external_source: ExternalSource.anilist,
      external_id: '9253',
      genres: ['Psicológico', 'Seinen'],
    },
    {
      type: ContentType.anime,
      title: 'Made in Abyss',
      synopsis: 'Una huérfana y un robot descienden a las profundidades de un abismo colosal repleto de criaturas milagrosas y una maldición letal.',
      cover_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97986-5yvJ6mHn5U4m.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=AQ4v0yU0i0s',
      critic_rating: 8.7,
      popularity_score: 76.0,
      is_mainstream: false,
      external_source: ExternalSource.anilist,
      external_id: '97986',
      genres: ['Fantasía', 'Seinen'],
    },
    {
      type: ContentType.anime,
      title: 'Chainsaw Man',
      synopsis: 'Denji vive en la miseria pagando deudas de su padre cazando demonios junto a Pochita, hasta que renace como el Demonio Motosierra.',
      cover_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FloXNypnTCmr.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=jk7QSGwupPA',
      critic_rating: 8.6,
      popularity_score: 96.0,
      is_mainstream: true,
      external_source: ExternalSource.anilist,
      external_id: '127230',
      genres: ['Shounen'],
    },

    // --- MANHWA ---
    {
      type: ContentType.manhwa,
      title: 'Solo Leveling',
      synopsis: 'Sung Jin-woo, el cazador más débil de la humanidad, despierta con una interfaz secreta que le permite subir de nivel y convertirse en el Monarca de las Sombras.',
      cover_url: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b67abDMx3B6Z.png',
      trailer_url: 'https://www.youtube.com/watch?v=91b_O4mGq7k',
      critic_rating: 8.9,
      popularity_score: 94.0,
      is_mainstream: true,
      external_source: ExternalSource.anilist,
      external_id: '105398',
      genres: ['Acción', 'Fantasía'],
    },
    {
      type: ContentType.manhwa,
      title: 'Omniscient Reader',
      synopsis: 'Kim Dokja es el único lector que completó una interminable novela web apocalíptica. Un día, el mundo real se transforma exactamente en la trama de esa novela.',
      cover_url: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-I0d57wG5YIuK.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=f2nE1_jL1Q0',
      critic_rating: 8.8,
      popularity_score: 82.0,
      is_mainstream: false,
      external_source: ExternalSource.anilist,
      external_id: '119257',
      genres: ['Acción', 'Sobrenatural'],
    },

    // --- MANGA ---
    {
      type: ContentType.manga,
      title: 'Berserk',
      synopsis: 'Guts, el Espadachín Negro, empuña su gigantesca espada Matadragones mientras busca venganza contra su antiguo hermano de armas Griffith.',
      cover_url: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-77tH7X5d6G0Q.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=ocQ6Pvn4YRE',
      critic_rating: 9.4,
      popularity_score: 93.0,
      is_mainstream: true,
      external_source: ExternalSource.anilist,
      external_id: '30002',
      genres: ['Seinen', 'Terror'],
    },

    // --- VIDEOJUEGOS ---
    {
      type: ContentType.videogame,
      title: 'Hollow Knight',
      synopsis: 'Desciende a Hallownest, un reino subterráneo en ruinas lleno de insectos guerreros, hechizos oscuros y secretos olvidados.',
      cover_url: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg',
      gameplay_url: 'https://www.youtube.com/watch?v=UAO2urG23S4',
      critic_rating: 9.0,
      popularity_score: 89.0,
      is_mainstream: true,
      external_source: ExternalSource.rawg,
      external_id: 'hollow-knight',
      genres: ['Metroidvania', 'Indie'],
    },
    {
      type: ContentType.videogame,
      title: 'Outer Wilds',
      synopsis: 'Eres el miembro más nuevo de Outer Wilds Ventures en un sistema solar atrapado en un bucle temporal infinito de 22 minutos.',
      cover_url: 'https://media.rawg.io/media/games/9dd/9dd8687a412c2957fba30438318e87e1.jpg',
      gameplay_url: 'https://www.youtube.com/watch?v=d6LGnVCL1_A',
      critic_rating: 9.3,
      popularity_score: 75.0,
      is_mainstream: false,
      external_source: ExternalSource.rawg,
      external_id: 'outer-wilds',
      genres: ['Exploración', 'Indie'],
    },
    {
      type: ContentType.videogame,
      title: 'Elden Ring',
      synopsis: 'Alzate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden y convertirte en el Señor del Círculo en las Tierras Intermedias.',
      cover_url: 'https://media.rawg.io/media/games/b29/b2960ad1e9347514a4073d8ab5808779.jpg',
      gameplay_url: 'https://www.youtube.com/watch?v=E3Huy2cdih0',
      critic_rating: 9.5,
      popularity_score: 97.0,
      is_mainstream: true,
      external_source: ExternalSource.rawg,
      external_id: 'elden-ring',
      genres: ['RPG', 'Aventura'],
    },
    {
      type: ContentType.videogame,
      title: 'Celeste',
      synopsis: 'Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje a la cima de la montaña Celeste en este desafiante plataformas de precisión.',
      cover_url: 'https://media.rawg.io/media/games/5eb/5eb0072b2260f8ab88265aebbb3c6130.jpg',
      gameplay_url: 'https://www.youtube.com/watch?v=70d9irlxiB4',
      critic_rating: 9.1,
      popularity_score: 80.0,
      is_mainstream: false,
      external_source: ExternalSource.rawg,
      external_id: 'celeste',
      genres: ['Indie', 'Aventura'],
    },
  ];

  for (const item of sampleContent) {
    const { genres, ...contentFields } = item;

    const upserted = await prisma.contentItem.upsert({
      where: {
        external_source_external_id: {
          external_source: contentFields.external_source,
          external_id: contentFields.external_id,
        },
      },
      update: {
        ...contentFields,
      },
      create: {
        ...contentFields,
      },
    });

    // Vincular géneros en ContentGenre
    if (genres && genres.length > 0) {
      for (const genreName of genres) {
        const genreId = genreMap.get(`${item.type}:${genreName}`);
        if (genreId) {
          await prisma.contentGenre.upsert({
            where: {
              content_id_genre_id: {
                content_id: upserted.id,
                genre_id: genreId,
              },
            },
            update: {},
            create: {
              content_id: upserted.id,
              genre_id: genreId,
            },
          });
        }
      }
    }
  }

  console.log(`✅ Seed completado con éxito:`);
  console.log(`- ${genresData.length} géneros procesados.`);
  console.log(`- ${sampleContent.length} contenidos dados de alta con portadas, notas y trailers.`);
  console.log(`- Usuario de prueba: test@hidden.app / password123`);
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

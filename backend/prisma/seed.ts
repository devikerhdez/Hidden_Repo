import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@hidden.app' },
    update: {},
    create: {
      email: 'test@hidden.app',
      username: 'testuser',
      password_hash,
      coins: 0,
    },
  });

  const genres = [
    { name: 'Acción', applies_to: 'movie' },
    { name: 'Comedia', applies_to: 'movie' },
    { name: 'Drama', applies_to: 'movie' },
    { name: 'Terror', applies_to: 'movie' },
    { name: 'Sci-Fi', applies_to: 'movie' },
    { name: 'Acción', applies_to: 'anime' },
    { name: 'Comedia', applies_to: 'anime' },
    { name: 'Shounen', applies_to: 'anime' },
    { name: 'Seinen', applies_to: 'anime' },
    { name: 'Isekai', applies_to: 'anime' },
    { name: 'Acción', applies_to: 'videogame' },
    { name: 'Aventura', applies_to: 'videogame' },
    { name: 'RPG', applies_to: 'videogame' },
    { name: 'FPS', applies_to: 'videogame' },
    { name: 'Indie', applies_to: 'videogame' },
    { name: 'Shounen', applies_to: 'manhwa' },
    { name: 'Romance', applies_to: 'manhwa' },
    { name: 'Fantasia', applies_to: 'manhwa' },
    { name: 'Shounen', applies_to: 'manga' },
    { name: 'Seinen', applies_to: 'manga' },
    { name: 'Drama', applies_to: 'series' },
    { name: 'Comedia', applies_to: 'series' },
    { name: 'Thriller', applies_to: 'series' },
  ];

  for (const g of genres) {
    await prisma.genre.upsert({
      where: { name_applies_to: { name: g.name, applies_to: g.applies_to as any } },
      update: {},
      create: g as any,
    });
  }

  const sampleContent = [
    {
      type: 'movie',
      title: 'Inception',
      synopsis: 'Un ladrón que roba secretos corporativos mediante el uso de tecnología de sueños compartidos recibe la tarea de implantar una idea en la mente de un CEO.',
      critic_rating: 8.8,
      external_source: 'tmdb',
      external_id: '27205',
      is_mainstream: true,
      popularity_score: 95.5,
    },
    {
      type: 'anime',
      title: 'Steins;Gate',
      synopsis: 'Un grupo de amigos descubre la forma de enviar mensajes al pasado, lo que les permite alterar el presente. Pero sus experimentos desencadenan una conspiración.',
      critic_rating: 9.1,
      external_source: 'anilist',
      external_id: '9253',
      popularity_score: 88.0,
    },
    {
      type: 'videogame',
      title: 'Hollow Knight',
      synopsis: 'Un caballero enmascarado explora un vasto reino subterráneo lleno de insectos y criaturas extrañas en este aclamado metroidvania.',
      critic_rating: 9.0,
      external_source: 'rawg',
      external_id: 'hollow-knight',
      popularity_score: 87.2,
    },
    {
      type: 'series',
      title: 'Dark',
      synopsis: 'La desaparición de dos niños en un pueblo alemán saca a la luz las relaciones fracturadas, las vidas dobles y el pasado oscuro de cuatro familias.',
      critic_rating: 8.7,
      external_source: 'tmdb',
      external_id: '70523',
      popularity_score: 82.0,
    },
    {
      type: 'manhwa',
      title: 'Solo Leveling',
      synopsis: 'En un mundo donde los cazadores luchan contra monstruos, un cazador débil recibe una misteriosa habilidad que le permite subir de nivel sin límites.',
      critic_rating: 8.5,
      external_source: 'anilist',
      external_id: '123456',
      popularity_score: 92.0,
    },
    {
      type: 'movie',
      title: 'Parasite',
      synopsis: 'Una familia pobre se infiltra en la vida de una familia rica. Una brillante sátira sobre la lucha de clases.',
      critic_rating: 8.9,
      external_source: 'tmdb',
      external_id: '496243',
      is_mainstream: true,
      popularity_score: 90.1,
    },
    {
      type: 'anime',
      title: 'Made in Abyss',
      synopsis: 'Una niña y un robot exploran un enorme abismo lleno de criaturas misteriosas y reliquias en busca de la madre desaparecida de la niña.',
      critic_rating: 8.6,
      external_source: 'anilist',
      external_id: '97986',
      popularity_score: 78.5,
    },
    {
      type: 'videogame',
      title: 'Outer Wilds',
      synopsis: 'Explora un sistema solar atrapado en un bucle temporal. Descubre los secretos de una antigua civilización alienígena.',
      critic_rating: 9.3,
      external_source: 'rawg',
      external_id: 'outer-wilds',
      popularity_score: 76.8,
    },
  ];

  for (const content of sampleContent) {
    await prisma.contentItem.upsert({
      where: {
        external_source_external_id: {
          external_source: content.external_source as any,
          external_id: content.external_id,
        },
      },
      update: {},
      create: content as any,
    });
  }

  console.log('Seed completed');
  console.log('Test user: test@hidden.app / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

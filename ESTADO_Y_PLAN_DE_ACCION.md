# 📊 Análisis del Estado del Proyecto Hidden y Guía Maestra de Contenido

> **Documento generado para el proyecto Hidden**  
> **Fecha:** Octubre 2026  
> **Base de referencia:** [`especificacion-app-swipe-recomendaciones.md`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/especificacion-app-swipe-recomendaciones.md)

---

## 📌 1. Resumen Ejecutivo y Diagnóstico

### 1.1. Estado General
El proyecto cuenta con una base arquitectónica sólida y bien encaminada:
- **Backend (Node.js + Express + Prisma + PostgreSQL/Supabase):** Implementado al **~70%**. Los modelos relacionales, la autenticación JWT y las rutas principales del contrato de API están definidas y funcionales.
- **Frontend (React Native + Expo SDK 57 + Zustand):** Implementado al **~65%**. La navegación, pantallas básicas, tema de colores morado/blanco y la interacción de swipe funcionan correctamente.
- **Ingesta de Contenido y Multimedia:** Implementado al **0%**. La carpeta `backend/src/services` está completamente vacía y no existen scripts de integración con TMDB, AniList, RAWG ni Cloudinary.

### 1.2. Diagnóstico: ¿Por qué la aplicación aparece vacía ("Sin contenido")?
Al analizar la base de datos conectada en Supabase, el conteo actual de registros es:
- **Usuarios (`User`):** 2 registrados.
- **Contenidos (`ContentItem`):** **0 registros**.
- **Géneros (`Genre`):** **0 registros**.

El archivo de semilla ([`backend/prisma/seed.ts`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/backend/prisma/seed.ts)) nunca se ha ejecutado contra la base de datos de producción/Supabase. Por tanto, el endpoint `GET /feed` devuelve un array vacío `[]`, provocando que el frontend muestre la vista de *"Sin contenido / No hay más recomendaciones"*. Además, los 8 elementos de muestra que contiene `seed.ts` carecen de `cover_url`, `trailer_url` y `gameplay_url`.

---

## 📋 2. Matriz de Estado: Especificación vs. Código Actual

| Módulo / Funcionalidad | Estado | En Backend | En Frontend | Observaciones / Gaps |
|---|:---:|:---:|:---:|---|
| **Autenticación (JWT + Sesiones)** | ✅ 100% | `POST /auth/register`, `/login`, `/refresh` | `LoginScreen`, `RegisterScreen`, `authStore` | Registro y login 100% operativos con validaciones completas. |
| **Modelo de Datos (Prisma)** | 🟡 90% | `User`, `ContentItem`, `Genre`, `UserSwipe`, `CustomList`, `ListItem`, `Rating`, `CoinTransaction`, `UserExclusion` | Interfaces TypeScript completas en `types/index.ts` | El esquema refleja fielmente la especificación. Falta ajustar la gestión de multimedia. |
| **Feed y Mecánica de Swipe** | 🟡 80% | `GET /feed` (excluye vistos, filtra tipos y mainstream), `POST /swipes` (skip/seen/saved) | `SwipeScreen`, `react-native-deck-swiper`, 3 botones de acción | El swipe registra en BD. Falta paginación infinita y no se renderizan imágenes reales en las cartas. |
| **Cartas de Contenido (`SwipeCard`)** | 🔴 40% | Devuelve `cover_url`, notas, géneros, contadores | Componente `SwipeCard.tsx` | **Placeholder crítico:** Usa un recuadro morado con la letra inicial en lugar de cargar la portada con `expo-image`. |
| **Modal de Valoración y Monedas** | ✅ 90% | `POST /ratings`, recalculación de `community_rating`, `POST /coins` | `RatingModal.tsx`, se abre tras swipe derecha | Otorga 10 monedas por valoración y actualiza el saldo del usuario. |
| **Modal de Detalle / Trailers** | 🔴 35% | `GET /content/:id` con géneros y metadatos | `DetailModal.tsx` | **Placeholder crítico:** Muestra un texto *"▶ Tráiler disponible"* en vez de embeber el vídeo con `react-native-youtube-iframe` o reproductor. |
| **Sistema de Listas** | 🟡 50% | `GET /lists`, `GET /lists/:id`, `POST /lists`, `/items` | `ListsScreen.tsx` | Solo muestra la lista de nombres y contadores. **No permite pulsar en una lista para ver sus elementos**. Falta la lista global "Mejor valorado". |
| **Panel de Filtros** | 🟡 70% | Filtra por tipos, géneros y `is_mainstream` | `FilterPanel.tsx` | Permite toggle de categorías y mainstream. Falta el buscador de exclusión manual ("Lista negra"). |
| **Onboarding** | 🔴 30% | Sin endpoint específico (usa filtros en cliente) | `OnboardingScreen.tsx` | Solo es una pantalla de bienvenida. No incluye el selector de intereses previo al registro/feed. |
| **Perfil de Usuario** | 🟡 60% | `GET /coins/balance`, `GET /coins/history` | `ProfileScreen.tsx` | Muestra avatar, monedas y logout. Falta historial de transacciones y estadísticas de actividad. |
| **Ingesta de Contenido (APIs externas)** | 🔴 0% | No implementado (`services/` vacío) | N/A | No hay sincronización automática con TMDB, AniList ni RAWG/IGDB. |
| **Gestión de Medios (Cloudinary)** | 🔴 0% | No configurado ni instalado | N/A | Pendiente de integración para hospedar posters y clips de gameplay/trailers. |

---

## 🛠️ 3. Dónde y Cómo Añadir Contenido a la Base de Datos

Existen **3 estrategias complementarias** para añadir contenido a la base de datos de Hidden:

```
                            ┌────────────────────────────────────────┐
                            │   ¿Cómo añadir contenido a Hidden?     │
                            └──────────────────┬─────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
   【 Vía 1: Inmediata 】             【 Vía 2: Automatizada 】          【 Vía 3: Manual / Admin 】
      Seed Enriquecido                   Scripts de Ingesta                 Endpoints REST Admin
   (Prisma seed con URLs)             (TMDB, AniList, RAWG)              (Subidas puntuales)
```

---

### 🚀 Vía 1: Solución Inmediata — Seed Enriquecido con Imágenes y Vídeos Reales

**¿Dónde se implementa?** En [`backend/prisma/seed.ts`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/backend/prisma/seed.ts).  
**¿Para qué sirve?** Para que en menos de 5 minutos tengas más de 20-30 elementos reales de todos los tipos (películas, series, anime, manhwa, videojuegos), con sus carátulas, sinopsis completas, géneros asociados y enlaces a trailers de YouTube.

#### Pasos para ejecutarlo:
1. Actualizar `backend/prisma/seed.ts` con una colección representativa de items que incluyan `cover_url` (URLs directas o de Cloudinary) y `trailer_url` (IDs o URLs de YouTube).
2. Ejecutar en la terminal del backend:
   ```powershell
   cd c:\Users\IKER\Desktop\IT\Proyectos\Hidden_Repo\backend
   npm run db:seed
   ```
3. Esto insertará:
   - Los géneros de todos los tipos de contenido en la tabla `Genre`.
   - El usuario de pruebas (`test@hidden.app` / `password123`).
   - Los `ContentItem` vinculados a sus correspondientes `ContentGenre`.

---

### 🔄 Vía 2: Ingesta Automatizada desde APIs Externas (Arquitectura Definitiva)

**¿Dónde se implementa?**  
Debes crear la siguiente estructura dentro de `backend/src/services/` y `backend/src/scripts/`:

```
backend/src/
├── services/
│   ├── ingestion/
│   │   ├── tmdb.service.ts       # Películas y Series (TMDB API)
│   │   ├── anilist.service.ts    # Anime, Manga y Manhwa (AniList GraphQL)
│   │   ├── rawg.service.ts       # Videojuegos (RAWG API)
│   │   └── normalizer.ts         # Mapeo a tipos ContentItem e inferencia de mainstream
│   └── cloudinary.service.ts     # Subida y optimización de assets
└── scripts/
    └── ingest.ts                 # Script ejecutable: "npm run ingest"
```

#### 1. Ingesta de Películas y Series (TMDB)
- **API:** The Movie Database (`https://api.themoviedb.org/3`)
- **Key:** Obtén una API Key gratuita en [themoviedb.org](https://www.themoviedb.org/settings/api).
- **Endpoints a consultar:**
  - `GET /trending/movie/week` y `GET /movie/top_rated`
  - `GET /trending/tv/week` y `GET /tv/top_rated`
  - `GET /movie/{id}/videos` (para obtener la clave del trailer de YouTube: `key` -> `https://www.youtube.com/watch?v=...`)
- **Imágenes:** Las imágenes base vienen en `https://image.tmdb.org/t/p/w780{poster_path}`.

#### 2. Ingesta de Anime, Manga y Manhwa (AniList)
- **API:** AniList GraphQL (`https://graphql.anilist.co`)
- **Key:** **No requiere API Key** para consultas públicas.
- **Consulta GraphQL recomendada:**
  ```graphql
  query ($page: Int, $type: MediaType, $format: MediaFormat) {
    Page(page: $page, perPage: 25) {
      media(type: $type, format: $format, sort: POPULARITY_DESC) {
        id
        title { romaji english native }
        description
        coverImage { extraLarge large }
        averageScore
        popularity
        genres
        trailer { id site }
        countryOfOrigin # Si es 'KR' y format es MANGA => Manhwa
      }
    }
  }
  ```

#### 3. Ingesta de Videojuegos (RAWG)
- **API:** RAWG Video Games Database (`https://api.rawg.io/api`)
- **Key:** Gratuita en [rawg.io/apidocs](https://rawg.io/apidocs).
- **Endpoint a consultar:**
  - `GET /games?key={RAWG_KEY}&ordering=-rating&page_size=30`
  - `GET /games/{id}/movies` (para clips de gameplay en MP4 o trailers).

#### 4. Regla de Deduplicación y Normalización
Cada servicio debe ejecutar un `upsert` en Prisma utilizando la clave única compuesta:
```typescript
await prisma.contentItem.upsert({
  where: {
    external_source_external_id: {
      external_source: 'tmdb',
      external_id: String(movie.id),
    },
  },
  update: { ... },
  create: { ... }
});
```

#### 5. Detección de Contenido Mainstream
De acuerdo con la especificación, se calcula a partir del percentil o puntuación de popularidad:
```typescript
// Si la popularidad en TMDB supera 80 o está en el percentil alto
const is_mainstream = item.popularity_score > 80;
```

---

### ✍️ Vía 3: Endpoints REST para Inserción y Gestión Manual (Admin)

Para permitir crear contenido manualmente o desde un panel web de administración sin tocar código:

**¿Dónde se implementa?** En `backend/src/routes/admin.ts`.

```typescript
// POST /admin/content
adminRouter.post('/content', authenticate, requireAdmin, async (req, res) => {
  const data = contentSchema.parse(req.body);
  const item = await prisma.contentItem.create({ data });
  res.status(201).json(item);
});
```

---

## ☁️ 4. Integración de Cloudinary para Fotos y Vídeos

El usuario indicó que utilizará **Cloudinary** para almacenar fotos y vídeos. Esta es una excelente decisión porque:
1. **Evita enlaces rotos:** Las APIs externas (TMDB, RAWG) a veces cambian las URLs o imponen límites de referer/hotlinking.
2. **Transformación móvil automática:** Cloudinary permite aplicar `f_auto,q_auto,w_800` en las imágenes para que pesen una fracción y la app vuele en conexiones móviles.
3. **Optimización de clips y vídeos:** Permite subir clips cortos de gameplay en MP4 y entregarlos adaptados a la resolución del dispositivo.

### 4.1. Instalación y Dependencias en Backend
```powershell
cd c:\Users\IKER\Desktop\IT\Proyectos\Hidden_Repo\backend
npm install cloudinary
```

### 4.2. Variables de Entorno (`backend/.env`)
Añadir a `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

### 4.3. Servicio de Cloudinary (`backend/src/services/cloudinary.service.ts`)
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryService {
  /**
   * Sube una imagen (desde URL de TMDB/AniList o buffer) a Cloudinary
   */
  static async uploadImage(sourceUrl: string, folder = 'hidden/covers'): Promise<string> {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder,
      transformation: [
        { width: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return result.secure_url;
  }

  /**
   * Sube un clip de vídeo (gameplay o trailer local) a Cloudinary
   */
  static async uploadVideo(videoPathOrUrl: string, folder = 'hidden/videos'): Promise<string> {
    const result = await cloudinary.uploader.upload(videoPathOrUrl, {
      resource_type: 'video',
      folder,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'mp4' },
      ],
    });
    return result.secure_url;
  }
}
```

### 4.4. Flujo Integrado de Ingesta + Cloudinary
Durante el proceso de ingesta o seeding:
1. El script descarga o lee la URL de la portada de la API externa (ej. poster de TMDB).
2. Se envía a `CloudinaryService.uploadImage(tmdbPosterUrl)`.
3. Cloudinary devuelve la URL definitiva:  
   `https://res.cloudinary.com/<tu_cloud>/image/upload/f_auto,q_auto/v1/.../hidden/covers/inception.jpg`.
4. Esa URL de Cloudinary es la que se guarda en el campo `cover_url` de `ContentItem`.

---

## 🎨 5. Mejoras Críticas Pendientes en el Frontend

Para cumplir con la especificación y lograr el efecto visual *premium* estilo Glovo (morados suaves, blancos y fluidez):

### 5.1. Renderizado de Portadas Reales en [`SwipeCard.tsx`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/frontend/src/components/SwipeCard.tsx)
Actualmente hay un contenedor con la inicial del título. Se debe sustituir por:
```tsx
import { Image } from 'expo-image';

// En el JSX:
{item.cover_url ? (
  <Image
    source={{ uri: item.cover_url }}
    style={styles.cardImage}
    contentFit="cover"
    transition={300}
  />
) : (
  <View style={styles.imagePlaceholder}>
    <Text style={styles.imageText}>{item.title.charAt(0)}</Text>
  </View>
)}
```

### 5.2. Reproductor de Trailers y Gameplays en [`DetailModal.tsx`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/frontend/src/components/DetailModal.tsx)
La dependencia `react-native-youtube-iframe` ya está instalada en el `package.json`. Solo falta extraer el ID de YouTube del `trailer_url` e incrustar el reproductor interactivo en lugar del cuadro gris.

### 5.3. Navegación a Items dentro de [`ListsScreen.tsx`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/frontend/src/screens/ListsScreen.tsx)
- Al pulsar una lista (ej. "Pendientes" o "Visto / Jugado"), debe abrirse una vista en cuadrícula (Grid) o detalle mostrando cada tarjeta guardada con su portada, nota y opción para abrir el `DetailModal`.

### 5.4. Onboarding con Selección de Intereses
- En [`OnboardingScreen.tsx`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/frontend/src/screens/OnboardingScreen.tsx), añadir chips seleccionables de las categorías iniciales (Anime, Películas, Videojuegos...) y guardarlas en `useSwipeStore` para que el feed inicial venga directamente filtrado al gusto del usuario.

---

## 🗺️ 6. Plan de Acción Recomendado Paso a Paso

1. **Paso 1 (Inmediato):** Poblar la base de datos ejecutando un **Seed enriquecido** con 20-30 títulos reales, portadas directas y vídeos para que la aplicación muestre contenido de inmediato en móvil.
2. **Paso 2:** Actualizar `SwipeCard.tsx` y `DetailModal.tsx` en el frontend para mostrar las imágenes reales (`expo-image`) y reproducir los trailers (`react-native-youtube-iframe`).
3. **Paso 3:** Implementar la pantalla o modal de detalle de lista en `ListsScreen.tsx` para poder ver los elementos que el usuario envía a *Pendientes* o *Visto*.
4. **Paso 4:** Crear el servicio de Cloudinary en `backend/src/services/cloudinary.service.ts` y configurar las credenciales.
5. **Paso 5:** Construir el pipeline de ingesta automatizada (`backend/src/services/ingestion/`) conectando las APIs de TMDB y AniList.

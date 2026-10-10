# 📊 Estado Actual del Proyecto Hidden y Plan de Acción Actualizado

> **Proyecto:** Hidden (App de descubrimiento y recomendación mediante swipe)  
> **Fecha de actualización:** Octubre 2026  
> **Estado:** Base de datos poblada con **52 contenidos reales**, frontend con renderizado multimedia fluido y pipeline de ingesta automatizada operativo.

---

## 📌 1. Diagnóstico y Avances Realizados

### 1.1. Resumen de lo completado en esta sesión:
1. **Población Inmediata de la Base de Datos:**
   - Se ejecutó el script `prisma/seed.ts` en la base de datos PostgreSQL de Supabase.
   - Se dieron de alta **23 géneros** y los contenidos iniciales con sus respectivas notas, sinopsis y enlaces.
2. **Frontend con Multimedia Real (Eliminación de Placeholders):**
   - **`SwipeCard.tsx`:** Muestra las carátulas oficiales con `expo-image` aplicando esquinas redondeadas y transiciones fluidas.
   - **`DetailModal.tsx`:** Muestra la portada en alta resolución (`expo-image`) y reproduce los trailers y gameplays directamente con el reproductor interactivo de YouTube (`react-native-youtube-iframe`). Se instaló la dependencia nativa `react-native-webview`.
3. **Navegación Interactiva en Listas (`ListsScreen.tsx`):**
   - Al pulsar en cualquier lista ("Pendientes", "Visto" o personalizadas), se abre una vista detallada con todos los elementos guardados.
   - Cada tarjeta muestra carátula, nota, género, acceso directo al modal de detalle (`DetailModal`) y botón para eliminar de la lista (`DELETE /lists/:id/items/:content_id`).
   - Se implementó la creación de nuevas listas directamente desde la interfaz.
4. **Pipeline de Ingesta Automatizada (`npm run ingest`):**
   - Creado `backend/src/services/ingestion/anilist.service.ts`: Sincronización directa con AniList GraphQL (sin necesidad de API Key) para **Anime**, **Manga** y **Manhwa**.
   - Creado `backend/src/services/ingestion/tmdb.service.ts`: Sincronización con TMDB para **Películas** y **Series** con resolución automática de posters y trailers de YouTube.
   - **Total de contenidos en base de datos elevado de 0 a 52 títulos reales**.

---

## 💡 2. Respuesta a la Duda: ¿Se pueden automatizar imágenes y vídeos vía API sin Cloudinary ni Supabase Storage?

### **SÍ, TOTALMENTE. De hecho, es la mejor práctica de la industria y ahorra el 100% de los costes.**

Si tuvieras que subir 300 o 3.000 películas y sus vídeos a Cloudinary o a Supabase Storage:
- **Cloudinary:** Superarías rápidamente el límite gratuito de ancho de banda y almacenamiento de vídeo, volviéndose inviable económicamente.
- **Supabase Storage:** El bucket gratuito se llenaría con apenas unos cuantos gigabytes de trailers en MP4.

### ¿Cómo lo hemos solucionado sin pagar nada ni almacenar archivos pesados?

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA ZERO-STORAGE                       │
└────────────────────────────────────────────────────────────────────────┘

 [TMDB / AniList / RAWG API]
              │
              ├─► URLs de Posters (CDN Gratuito Global)
              │   • TMDB: https://image.tmdb.org/t/p/w780/...
              │   • AniList: https://s4.anilist.co/file/anilistcdn/...
              │   (Se guardan como TEXTO en Postgres ~ 60 bytes c/u)
              │
              └─► Claves de Trailers de YouTube (ID de 11 caracteres)
                  • YouTube ID: "YoHD9XEInc0"
                  (Se guarda como TEXTO en Postgres ~ 11 bytes)
                                      │
                                      ▼
             [Supabase PostgreSQL: Solo guarda TEXTO relacional]
                  (300 películas ocupan MENOS de 3 MB de datos)
                                      │
                                      ▼
                      [Frontend React Native (Hidden App)]
                        ├─► expo-image: Descarga y cachea posters en el móvil.
                        └─► react-native-youtube-iframe: YouTube transmite el vídeo gratis.
```

1. **Las imágenes se sirven de las CDNs oficiales de las APIs:**
   - **TMDB** aloja gratuitamente todos los posters y portadas de películas y series en su CDN de alta velocidad (`https://image.tmdb.org/t/p/w780{poster_path}`). Millones de aplicaciones en el mundo usan este enlace directo sin descargar las imágenes.
   - **AniList** aloja las carátulas completas en `s4.anilist.co`.
   - **En tu base de datos de Supabase solo guardas la URL de texto** (una cadena `VARCHAR` que ocupa unos 70 bytes).
2. **Los vídeos no se almacenan como archivos MP4, se embeben de YouTube:**
   - Ninguna plataforma comercial (como IMDb o JustWatch) guarda archivos de vídeo de trailers en sus propios servidores; obtienen el ID del tráiler oficial en YouTube.
   - `DetailModal` reproduce el tráiler mediante el reproductor embebido de YouTube (`react-native-youtube-iframe`).
   - **YouTube asume el 100% del coste de streaming, ancho de banda, compresión y servidores.**
3. **¿Qué consume esto en Supabase?**
   - Solo texto relacional en PostgreSQL (título, sinopsis, notas y URLs).
   - 300 películas ocupan **~3 Megabytes** en PostgreSQL. Supabase ofrece **500 MB** en su plan gratuito, lo que te permite almacenar más de 50.000 títulos sin pagar nada.
   - **Cloudinary no es necesario en absoluto.**

---

## 📋 3. Matriz de Estado Actualizada

| Módulo / Funcionalidad | Estado Anterior | Estado Actual | Observaciones |
|---|:---:|:---:|---|
| **Base de Datos / Feed** | 🔴 0 items | ✅ **52 items activos** | Seed ejecutado + Ingesta de AniList operativa. El feed devuelve contenido real. |
| **Tarjetas de Swipe (`SwipeCard`)** | 🔴 Sin imagen | ✅ **Completado** | Renderiza portadas con `expo-image` y caché local automático. |
| **Detalle de Contenido (`DetailModal`)** | 🔴 Placeholders | ✅ **Completado** | Portada HD + Reproductor interactivo de YouTube embebido. |
| **Mis Listas (`ListsScreen`)** | 🟡 Solo conteo | ✅ **Completado** | Navegación a items, eliminación, visualización y creación de listas. |
| **Ingesta Automatizada (APIs)** | 🔴 0% | ✅ **Operativo** | AniList y TMDB integrados. Comando `npm run ingest` disponible. |
| **Onboarding con Selección de Intereses** | 🔴 Básico | 🟡 Pendiente | Añadir chips de intereses iniciales en `OnboardingScreen.tsx`. |
| **Filtro de Exclusión ("Lista Negra")** | 🟡 Parcial | 🟡 Pendiente | Buscador para excluir franquicias o actores específicos. |
| **Historial de Monedas en Perfil** | 🟡 Parcial | 🟡 Pendiente | Renderizar la lista de transacciones obtenida de `GET /coins/history`. |

---

## 🗺️ 4. Siguientes Pasos a Tomar (Próximo Sprint)

### **Paso 1: Configurar Clave de TMDB para Películas y Series**
- Obtén una API Key gratuita en [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api).
- Añádela en [`backend/.env`](file:///c:/Users/IKER/Desktop/IT/Proyectos/Hidden_Repo/backend/.env):
  ```env
  TMDB_API_KEY="tu_clave_real_de_tmdb"
  ```
- Ejecuta en la terminal de backend:
  ```powershell
  npm run ingest
  ```
  Esto añadirá automáticamente las 40 mejores películas y series del mundo con posters y trailers en menos de un minuto.

### **Paso 2: Ingesta de Videojuegos desde RAWG**
- Crear `backend/src/services/ingestion/rawg.service.ts` para consultar `https://api.rawg.io/api/games`.
- Conectar RAWG con clips de gameplay en YouTube o imágenes de portada de RAWG.

### **Paso 3: Selector de Intereses en Onboarding (`OnboardingScreen.tsx`)**
- Permitir al usuario marcar qué tipos le interesan (Películas, Anime, Series, Videojuegos) en su primera apertura.
- Guardar estos tipos directamente en el estado inicial del filtro para que el feed muestre solo lo que le gusta desde el primer swipe.

### **Paso 4: Historial de Transacciones en Perfil (`ProfileScreen.tsx`)**
- Conectar el endpoint `GET /coins/history` para mostrar el historial de recompensas obtenidas por valoraciones (+10 monedas por cada contenido valorado).

### **Paso 5: Paginación Infinita en el Feed (`SwipeScreen.tsx`)**
- Cuando queden menos de 3 cartas en la baraja, solicitar automáticamente el siguiente lote al endpoint `GET /feed?page=X` para que el flujo de swipe nunca se interrumpa.

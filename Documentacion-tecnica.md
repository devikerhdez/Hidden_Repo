# 🛠️ Documentación Técnica y Guía de Despliegue — Proyecto Hidden

Este documento contiene la especificación técnica de la arquitectura, configuración de entorno y guía paso a paso para ejecutar y desplegar el proyecto **Hidden** tanto en desarrollo como en producción.

---

## 📋 1. Requisitos Previos

Asegúrate de tener instalado en tu máquina local:
- **Node.js**: v18.x o superior.
- **npm**: v9.x o superior.
- **PostgreSQL**: v14.x o superior (o una instancia en la nube como Supabase, Neon o Render).
- **Expo Go App**: Instalada en tu móvil (iOS o Android) para probar la app cliente en desarrollo local.

---

## ⚙️ 2. Variables de Entorno

### 🟢 Backend (`backend/.env`)

Crea un archivo `.env` dentro de la carpeta `backend/` basándote en la plantilla `.env.example`:

```env
# Base de Datos (PostgreSQL / Supabase)
DATABASE_URL="postgresql://usuario:password@localhost:5432/hidden?schema=public"

# Autenticación JWT
JWT_SECRET="super-secreto-cambiar-en-produccion"
JWT_REFRESH_SECRET="super-secreto-refresh-cambiar-en-produccion"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor Backend
PORT=3000
NODE_ENV=development

# APIs Externas (Ingesta de Contenido)
TMDB_API_KEY="tu-api-key-de-tmdb"
ANILIST_API_URL="https://graphql.anilist.co"
RAWG_API_KEY="tu-api-key-de-rawg"

# Lógica del Sistema
COINS_PER_RATING=10
MAINSTREAM_POPULARITY_THRESHOLD=0.95
```

### 🔵 Frontend (`frontend/.env`)

Crea un archivo `.env` dentro de la carpeta `frontend/`:

```env
# IP local de tu ordenador si pruebas en móvil físico (ej. http://192.168.1.50:3000)
# o localhost si pruebas en simulador/web (http://localhost:3000)
EXPO_PUBLIC_API_URL=http://<TU-IP-LOCAL>:3000/api
```

> ⚠️ **Nota Importante para Móvil Real**: Si usas **Expo Go** en tu dispositivo físico, `localhost` apuntará al propio móvil. Debes colocar la **IP local de tu ordenador** en `EXPO_PUBLIC_API_URL` (puedes consultar tu IP ejecutando `ipconfig` en Windows).

---

## 🚀 3. Ejecución en Desarrollo Local

### 1️⃣ Levantar el Backend (Express + Prisma)

Navega a la carpeta del backend y sigue estos pasos:

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Generar cliente de Prisma
npm run db:generate

# 3. Aplicar migraciones a la Base de Datos
npm run db:migrate

# 4. (Opcional) Poblar la base de datos con datos semilla
npm run db:seed

# 5. Iniciar servidor de desarrollo en modo watch
npm run dev
```
El servidor backend se ejecutará en: `http://localhost:3000`.
Para explorar la base de datos mediante interfaz gráfica, puedes abrir Prisma Studio:
```bash
npm run db:studio
```

---

### 2️⃣ Levantar el Frontend (Expo / React Native)

Abre otra terminal, navega a la carpeta frontend e inicia la aplicación:

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo de Expo
npm run start
```

#### ¿Cómo probar la App?
- **En tu móvil físico (Recomendado):** Abre la app **Expo Go** en tu teléfono y escanea el código QR que aparece en la terminal.
- **En Emulador Android:** Pulsa la tecla `a` en la terminal.
- **En Simulador iOS (Mac):** Pulsa la tecla `i` en la terminal.
- **En Navegador Web:** Pulsa la tecla `w` en la terminal.

---

## 🚢 4. Guía de Despliegue en Producción

### 🗄️ A. Base de Datos (PostgreSQL)
Se recomienda utilizar un proveedor gestionado gratuito o de bajo coste:
- **Supabase** (Recomendado): Crea un proyecto en [Supabase](https://supabase.com/), copia la cadena de conexión PostgreSQL y colócala en la variable `DATABASE_URL`.
- **NeonDB** o **Render PostgreSQL**.

Ejecuta las migraciones de producción:
```bash
npx prisma migrate deploy
```

---

### 🖥️ B. Despliegue del Backend (API REST)

Puedes desplegar el servidor Node.js en plataformas como **Render**, **Railway**, **Fly.io** o **Vercel**.

#### Ejemplo en **Render**:
1. Crea un **Web Service** conectado a tu repositorio Git.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install && npm run db:generate && npm run build`
4. **Start Command**: `npm run start`
5. Configura todas las variables de entorno (`DATABASE_URL`, `JWT_SECRET`, etc.) en el panel de Render.

---

### 📱 C. Despliegue del Frontend (Compilación de la App Móvil)

Para generar el instalador de la app (`.apk` para Android o `.ipa` para iOS) se utiliza **EAS Build** (Expo Application Services).

1. Instala el CLI de EAS de forma global:
   ```bash
   npm install -g eas-cli
   ```
2. Inicia sesión en tu cuenta de Expo:
   ```bash
   eas login
   ```
3. Configura el proyecto en la carpeta `frontend/`:
   ```bash
   cd frontend
   eas build:configure
   ```
4. **Generar APK para Android (para probar en cualquier dispositivo Android):**
   ```bash
   eas build -p android --profile preview
   ```
5. **Generar Build de Producción (Play Store / App Store):**
   ```bash
   eas build -p android --profile production
   eas build -p ios --profile production
   ```

---

## 🛠️ 5. Comandos Útiles

| Entorno | Comando | Descripción |
| :--- | :--- | :--- |
| **Backend** | `npm run dev` | Inicia servidor de desarrollo con autorecargado (`tsx`). |
| **Backend** | `npm run db:migrate` | Ejecuta y aplica nuevas migraciones de Prisma. |
| **Backend** | `npm run db:studio` | Abre la GUI de Prisma para inspeccionar la base de datos. |
| **Frontend** | `npm run start` | Inicia el Metro Bundler de Expo. |
| **Frontend** | `npm run android` | Ejecuta la app directamente en el emulador de Android. |

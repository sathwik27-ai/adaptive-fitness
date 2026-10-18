# Adaptive Fitness Companion

A personalized, data-driven fitness and nutrition web application built on the MERN stack. Adapts workouts and meal plans to each user's goals, equipment, lifestyle, and real-time progress.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7, Tailwind CSS v3, Redux Toolkit, RTK Query, Recharts, React Hook Form + Zod |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (HTTP-only cookies) + Passport.js (Google/Facebook OAuth) |
| Email | Nodemailer via Gmail SMTP |
| Media | Cloudinary |

---

## Local Development Setup

### Windows quick start

Requirements: Node.js 20.19+ or 22.12+, npm, a running local MongoDB server or MongoDB Atlas connection, and a configured `backend\.env`. Create that environment file from [backend/.env.example](./backend/.env.example) if needed; generate a random `JWT_SECRET` and set `MONGO_URI` to your database. Do not replace an existing local secret.

Install dependencies once, from the repository root:

```powershell
Push-Location backend
npm ci
Pop-Location

Push-Location frontend
npm ci
Pop-Location
```

Initialize the workout catalogue once for the configured database:

```powershell
Push-Location backend
npm run seed:workouts
Pop-Location
```

The seed command inserts the sample workouts without deleting or replacing existing records. The workout library is empty until workouts are added or this seed command is run.

The diet planner provides a separate meal plan for each Monday-through-Sunday selection; it opens on the current weekday and labels the selected day's meals. Swapping a meal updates only that day's plan. Older plans without stored alternatives receive a generated local option the first time a meal is swapped. The Spotify mood player is available only while signed in and stays mounted as a persistent player while navigating between application pages. Spotify playback itself is controlled by the embedded Spotify player and requires an internet connection.

Start the API in the first PowerShell terminal:

```powershell
Set-Location 'C:\Users\Sathw\adaptive-fitness\backend'
npm run dev
```

Start the frontend in a second PowerShell terminal:

```powershell
Set-Location 'C:\Users\Sathw\adaptive-fitness\frontend'
npm run dev
```

Open **http://localhost:5173**. The API listens at **http://localhost:5000** after it successfully connects to MongoDB. Check the API with:

```powershell
Invoke-RestMethod 'http://localhost:5000/api/health'
```

If the backend does not start and reports `ECONNREFUSED` or a MongoDB timeout, start MongoDB or correct `MONGO_URI` in `backend\.env`, then restart the backend. The API intentionally does not serve requests without a database connection. OAuth, Gmail, Cloudinary, and hosted AI are optional integrations; features that use them need provider credentials. The dashboard's Spotify player embeds public playlists and requires internet access; it does not require Spotify API credentials. Use its **Open playlist in Spotify** link if embeds are blocked by a browser extension or network policy.

For database initialization/seeding instructions, every environment variable, and troubleshooting, see [SETUP.md](./SETUP.md). After installing dependencies and configuring the environment, `.\start-dev.ps1` can open the backend and frontend in separate PowerShell windows.

---

## 📁 Project Structure

```
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── pages/           # Route-level pages
│       ├── components/      # Reusable UI components
│       ├── features/        # Redux slices (auth, workout, diet)
│       ├── services/        # RTK Query API definitions
│       └── app/             # Redux store
└── backend/                 # Node.js + Express API
    ├── models/              # Mongoose schemas
    ├── controllers/         # Business logic
    ├── routes/              # Express routers
    ├── middleware/          # auth, error handlers
    ├── utils/               # tokenHelper, emailHelper, mealGenerator
    ├── config/              # DB, passport, cloudinary
    └── seeds/               # Workout seed script
```

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | Public | Register + JWT |
| POST | `/api/auth/login` | Public | Login + JWT |
| GET | `/api/auth/google` | Public | Google OAuth |
| GET | `/api/users/me` | Private | Get profile |
| PATCH | `/api/users/me` | Private | Update profile |
| PATCH | `/api/users/me/saved` | Private | Toggle bookmark |
| GET | `/api/workouts` | Public | List workouts (filterable) |
| GET | `/api/workouts/:id` | Public | Workout detail |
| POST | `/api/workouts/log` | Private | Log session |
| POST | `/api/diet/generate` | Private | Generate meal plan |
| GET | `/api/diet` | Private | Get diet profile |
| PATCH | `/api/diet/swap-meal` | Private | Swap meal |
| POST | `/api/diet/log` | Private | Log food |
| GET | `/api/progress` | Private | Get progress entries |
| POST | `/api/progress` | Private | Add progress entry |

---

## 🌿 Design System — Earthy Palette

| Token | Hex | Usage |
|-------|-----|-------|
| bg-main | `#D8CBB5` | Page background |
| bg-card | `#F4EFE6` | Cards & modals |
| primary | `#2F5D3A` | CTAs, active nav, progress |
| cta | `#1B1410` | Primary button bg |
| chart-orange | `#E59A3A` | Calories / goals |
| chart-purple | `#8C6FAE` | Strength / endurance |
| chart-olive | `#4F7C63` | Consistency / steps |
"# adaptive-fitness" 

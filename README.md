# Adaptive Fitness Companion

A personalized, data-driven fitness and nutrition web application built on the MERN stack. Adapts workouts and meal plans to each user's goals, equipment, lifestyle, and real-time progress.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS v3, Redux Toolkit, RTK Query, Recharts, React Hook Form + Zod |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (HTTP-only cookies) + Passport.js (Google OAuth2) |
| Email | Nodemailer via Gmail SMTP |
| Media | Cloudinary |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js v18+
- A MongoDB Atlas account with a cluster
- (Optional) Google OAuth credentials

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env (MongoDB URI is required)
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🌱 Seed Database

After filling in your `.env` with a valid `MONGO_URI`, run:

```bash
cd backend
npm run seed:workouts
```

This populates MongoDB with **20 workout documents** across 4 categories: Strength, Cardio, Yoga, HIIT.

The **50+ meal items** are embedded in the rules-based `mealGenerator.js` and served dynamically on meal plan generation.

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret (min 64 chars) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your regular password) |
| `FRONTEND_URL` | `http://localhost:5173` for local dev |

---

## 📁 Project Structure

```
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── pages/           # Route-level pages (11 pages)
│       ├── components/      # Reusable UI components (12 components)
│       ├── features/        # Redux slices (auth, workout, diet)
│       ├── services/        # RTK Query API definitions
│       └── app/             # Redux store
└── backend/                 # Node.js + Express API
    ├── models/              # 6 Mongoose schemas
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
| PATCH | `/api/diet/swap` | Private | Swap meal |
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

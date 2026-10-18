# Adaptive Fitness Companion

> A personalized fitness and nutrition companion for building healthier routines, one day at a time.

Adaptive Fitness is a full-stack web application that brings workout discovery, personalized meal planning, food and workout logs, progress tracking, and posture tools together in one place. Plans are tailored to a user's goals and preferences, while weekly schedules make it easy to follow and track a routine.

## Contents

- [Highlights](#highlights)
- [Problem and objectives](#problem-and-objectives)
- [How authentication and planning work](#how-authentication-and-planning-work)
- [Architecture](#architecture)
- [Technology](#technology)
- [Requirements](#requirements)
- [Run locally on Windows](#run-locally-on-windows)
- [Configure the backend](#configure-the-backend)
- [Optional integrations](#optional-integrations)
- [Deployments](#deployments)
- [Useful commands](#useful-commands)
- [Troubleshooting](#troubleshooting)
- [Project layout](#project-layout)
- [API overview](#api-overview)
- [Security notes](#security-notes)

## Highlights

### Training

- Browse the workout catalogue and open workout details.
- Start and track workout sessions, then review workout history and progress.
- Save workouts and meals for quick access.
- Admin-only workout management and image uploads.

### Nutrition

- Generate a weekly plan from diet type, goal, activity level, budget, and cuisine preferences.
- Select a weekday to see that day's meals; meal plans are designed to vary by day.
- Swap meal options and save a plan.
- Log meals—including snacks—against the selected day and review daily calorie and macro totals.

### Progress and connected features

- Track fitness progress, workout history, and nutrition logs.
- Explore dashboard insights and posture-session tools.
- Use the Spotify playlist embeds while signed in. Playback requires internet access and Spotify embeds to be available in your browser.
- Connect optional Google Fit, OAuth login, email, image storage, and hosted AI integrations when you supply provider credentials.

## Problem and objectives

Fitness information and day-to-day tracking can be scattered across separate tools. Adaptive Fitness brings workout planning, nutrition planning, and activity logs into one account so a user can record personal goals, follow a weekly routine, and review progress. Its objectives are to:

- Create a workout schedule from the user's onboarding profile and training preferences.
- Make meal planning adjustable to dietary preferences and individual weekdays.
- Keep workouts, saved items, food entries, and progress associated with the authenticated account.
- Provide a single dashboard and accessible navigation for the main fitness workflows.

## How authentication and planning work

1. Registration or login sends credentials to the Express API. The server validates the account and sets a signed JWT in an HTTP-only cookie; the token is not stored in browser local storage.
2. The frontend includes cookies with API requests. On app startup, it checks the current session through `GET /api/users/me`; protected routes wait for that check before rendering or redirecting. A stale unauthenticated session check cannot clear a login completed while that check was in flight. Only an explicit `SESSION_INVALID` response from the backend expires an established frontend session; other request failures remain on the current page.
3. During onboarding, the frontend submits personal metrics and workout preferences to `PATCH /api/users/me`. Only after the API confirms `user.onboardingComplete` does the frontend update auth state and navigate to the dashboard. Request failures remain visible on onboarding; only an explicit invalid-session response clears an existing authenticated session.
4. Diet planning is a separate workflow. The user submits diet preferences to `POST /api/diet/generate`; meals and food logs are managed through the diet API.
5. Logout calls the protected API endpoint and clears the same HTTP-only cookie.

In production, Vercel rewrites same-origin `/api/*` requests to the Render API. This keeps the HTTP-only session cookie first-party to the frontend site instead of relying on browsers accepting a third-party cookie. Render still restricts credentialed CORS to the configured Vercel origin. Login and registration also confirm the session with `GET /api/users/me` before routing.

## Architecture

| Component | Responsibility |
| --- | --- |
| React/Vite frontend | Pages, forms, onboarding, charts, routing, client-side state, and API calls. |
| Express backend | Authentication, authorization, validation, API workflows, and integration endpoints. |
| MongoDB/Mongoose | Persistent user profiles, plans, workouts, progress, and logs. |
| RTK Query | Frontend API requests, credential inclusion, response caching, and mutation cache invalidation. |

In local development, the browser talks directly to the API on port 5000; Vite does not proxy API requests. In production, browser requests use the Vercel same-origin `/api` rewrite to Render. Credentialed CORS must allow the deployed frontend origin.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite 7, Tailwind CSS, Redux Toolkit, RTK Query, React Hook Form, Zod, Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JWT in HTTP-only cookies; optional Google and Facebook OAuth |
| Integrations | Optional Google Fit, Cloudinary, Gmail SMTP, and Hugging Face |

## Requirements

- Windows 10/11 with PowerShell.
- Node.js **20.19+** or **22.12+** (npm is included with Node.js).
- MongoDB running locally or a MongoDB Atlas cluster that this computer can access.
- Git, if you are cloning the repository.

There is no root `package.json`; install and run each application from its own folder.

## Run locally on Windows

### 1. Get the project

If you already have this project, open PowerShell at the repository root. Otherwise:

```powershell
git clone https://github.com/sathwik27-ai/adaptive-fitness.git
Set-Location .\adaptive-fitness
```

### 2. Configure MongoDB and the backend environment

The API needs MongoDB and a JWT secret before it can start. Create `backend\.env` from the checked-in example only if it does not already exist. The following command also creates a strong local JWT secret; it does not overwrite an existing `.env`:

```powershell
if (-not (Test-Path '.\backend\.env')) {
    Copy-Item '.\backend\.env.example' '.\backend\.env'
    $jwtSecret = node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))"
    $envPath = Join-Path (Get-Location) 'backend\.env'
    $envText = [System.IO.File]::ReadAllText($envPath)
    $envText = $envText.Replace(
        'JWT_SECRET=replace-with-a-random-secret-at-least-32-characters',
        "JWT_SECRET=$jwtSecret"
    )
    [System.IO.File]::WriteAllText($envPath, $envText)
    Remove-Variable jwtSecret
}
```

Open `backend\.env` in a text editor and set `MONGO_URI` to your database:

- Local MongoDB: `mongodb://127.0.0.1:27017/adaptive_fitness`
- MongoDB Atlas: use the connection URI from your Atlas cluster, with your own database username, password, and database name.

Start the local MongoDB service before starting the API. For Atlas, configure a database user and allow your computer's IP address in Atlas Network Access. Review [backend/.env.example](./backend/.env.example) and [SETUP.md](./SETUP.md) for every supported variable and provider-specific details. Keep any existing JWT secret; changing it invalidates previously issued login cookies/tokens.

### 3. Install dependencies

Run these commands from the repository root:

```powershell
Push-Location .\backend
npm ci
Pop-Location

Push-Location .\frontend
npm ci
Pop-Location
```

### 4. Add sample workouts (optional but recommended)

The workout catalogue may be empty in a new database. Seed the sample catalogue once:

```powershell
Push-Location .\backend
npm run seed:workouts
Pop-Location
```

This command upserts sample workouts by title and does not delete existing workout records. It requires a reachable MongoDB database. Meal plans are generated by the application; no meal seed is required.

### 5. Start the backend

Open a PowerShell terminal:

```powershell
Set-Location 'C:\Users\Sathw\adaptive-fitness\backend'
npm run dev
```

The API connects to MongoDB before accepting requests. Its default address is **http://localhost:5000** and API base is **http://localhost:5000/api**. For a normal non-watch start, run `npm start` from the backend folder.

### 6. Start the frontend

Open a second PowerShell terminal:

```powershell
Set-Location 'C:\Users\Sathw\adaptive-fitness\frontend'
npm run dev
```

Open **http://localhost:5173**. The frontend defaults to calling the API on port 5000 at the same hostname used by the browser. If the API is on a different host or port, configure `VITE_API_BASE_URL` in `frontend\.env` (for example, `VITE_API_BASE_URL=http://localhost:5000/api`). Do not put secrets in frontend environment variables.

### 7. Verify the app

In another PowerShell window, check the backend health endpoint:

```powershell
Invoke-RestMethod 'http://localhost:5000/api/health'
```

A healthy API responds with a status such as `ok`. Then open the frontend, register a local account, sign in, and try the following:

1. Open Workouts and confirm the sample catalogue is available if you ran the seed command.
2. Open Diet Plan, choose preferences (including a diet type), and generate a weekly plan.
3. Select different weekdays, swap a meal, and log a meal or snack to confirm the selected day's schedule and totals update.
4. Open Saved and Progress after saving workouts/meals or logging activity.
5. Open the dashboard while signed in to check Spotify embeds (internet access required).

### Quick start script

After creating the backend environment file and installing both dependency sets, you can run this from the repository root:

```powershell
.\start-dev.ps1
```

It checks Node.js/npm, dependency folders, and `backend\.env`, then opens the backend and frontend in separate PowerShell windows. It does not install software or change execution policies.

## Configure the backend

The complete variable reference, OAuth callback URLs, database setup, admin notes, and further troubleshooting are in [SETUP.md](./SETUP.md). At minimum, configure:

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Random secret used to sign and verify JWTs. Use the creation command above; never commit it. |
| `MONGO_URI` | Yes (or `MONGODB_URI`) | Connection string for your local MongoDB or Atlas database. |
| `PORT` | No | API port; defaults to `5000`. |
| `FRONTEND_URL` | No | Browser origin permitted by credentialed CORS; defaults to `http://localhost:5173`. |
| `NODE_ENV` | No | Runtime mode; use `development` locally. |

Optional backend integrations are described below. The frontend's only optional variable is `VITE_API_BASE_URL`; it is public configuration, not a secret.

## Optional integrations

The core local application requires MongoDB and `JWT_SECRET`. These integrations are optional and are not provisioned by the project:

| Integration | Environment variables | What requires it |
| --- | --- | --- |
| Google OAuth / Google Fit | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`; optional `GOOGLE_CALLBACK_URL` | Google sign-in and Google Fit authorization/sync. Configure the OAuth callbacks and APIs/scopes in Google Cloud. |
| Facebook OAuth | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`; optional `FACEBOOK_CALLBACK_URL` | Facebook sign-in. Configure the callback URL in the Facebook developer app. |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Workout image uploads. |
| Gmail SMTP | `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Welcome email. Use a Gmail App Password, not your normal account password. |
| Hugging Face | `HUGGING_FACE_API_KEY` | Hosted AI assistance for meal plans and insights. Some generated features have local/rules-based fallback behavior. |
| Google Fit redirect base | `BACKEND_URL` | Optional public backend URL used to form the Google Fit callback; defaults to `http://localhost:5000`. |

For local Spotify embeds, no Spotify API key is used; an internet connection is needed, and browser/network policies may block embedded playback.

## Deployments

- Frontend: [adaptive-fitness-seven.vercel.app](https://adaptive-fitness-seven.vercel.app/)
- Backend: [adaptive-fitness-viux.onrender.com](https://adaptive-fitness-viux.onrender.com/)
- API health: [adaptive-fitness-viux.onrender.com/api/health](https://adaptive-fitness-viux.onrender.com/api/health)
- Repository: [github.com/sathwik27-ai/adaptive-fitness](https://github.com/sathwik27-ai/adaptive-fitness)

The production client uses the same-origin `/api` route. Leave `VITE_API_BASE_URL` unset in Vercel or set it to `/api`; the Vercel rewrite forwards requests to `https://adaptive-fitness-viux.onrender.com/api`. Do not set the production client to call Render directly, because that makes the HTTP-only session cookie third-party in browsers that block third-party cookies.

The frontend's `vercel.json` rewrites browser-side routes such as `/register`, `/login`, and `/dashboard` to the Vite entry document so direct links and page refreshes load the React application.

In Render, set `NODE_ENV=production`, `FRONTEND_URL=https://adaptive-fitness-seven.vercel.app`, `MONGO_URI` to the private Atlas connection string, and `JWT_SECRET` to a strong random secret. Keep secrets only in Render's environment settings. The server's credentialed CORS allowlist uses the exact `FRONTEND_URL`. Login cookies remain HTTP-only and `Secure` in production; local development retains `SameSite=Lax`.

After code changes, push the verified commit and confirm that Vercel and Render have deployed the expected revisions. Check `/api/health`, then test login, onboarding submission, protected-page navigation, and page refresh in the production browser. If social login is enabled, register `https://adaptive-fitness-seven.vercel.app/api/auth/google/callback` and `https://adaptive-fitness-seven.vercel.app/api/auth/facebook/callback` with the respective providers. Set `GOOGLE_CALLBACK_URL` and `FACEBOOK_CALLBACK_URL` to those same Vercel URLs in Render, or leave them unset to use the production defaults.

## Useful commands

| Purpose | PowerShell command (run in the indicated folder) |
| --- | --- |
| Start backend with automatic restart | `npm run dev` in `backend` |
| Start backend normally | `npm start` in `backend` |
| Seed sample workouts | `npm run seed:workouts` in `backend` |
| Start frontend dev server | `npm run dev` in `frontend` |
| Lint frontend | `npm run lint` in `frontend` |
| Test auth response handling | `npm test` in `frontend` |
| Build frontend for production | `npm run build` in `frontend` |
| Preview frontend build | `npm run preview` in `frontend` |

Stop each development server with **Ctrl+C** in its terminal window.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `JwtStrategy requires a secret or key` or missing-secret startup error | Confirm `backend\.env` exists and `JWT_SECRET` is set to a strong, non-placeholder value. Restart the API after editing it. |
| MongoDB `ECONNREFUSED`, server-selection timeout, or API not listening | Start the local MongoDB service or check Atlas URI, database credentials, IP allowlist, and network connectivity. |
| Browser reports a CORS error | Ensure `FRONTEND_URL` matches the origin in the address bar. `localhost` and `127.0.0.1` are different hostnames; use one hostname consistently for frontend and API. Restart the backend after changes. |
| Frontend cannot reach the API | Production calls the same-origin `/api` route, which Vercel rewrites to Render. Confirm `frontend/vercel.json` is deployed, verify the backend health endpoint, and inspect the browser Network panel for the request status. For local development, make sure the backend is running on port 5000. |
| Production login succeeds but onboarding/dashboard sends you back to login | Confirm Vercel uses the same-origin API rewrite and the Render CORS `FRONTEND_URL` matches the Vercel origin. Login now verifies `GET /api/users/me` before navigating. The session cookie should be host-only to the frontend origin when delivered through the rewrite; do not set a cookie `Domain`. |
| Onboarding request fails but user is sent to login | The frontend clears auth only when a protected API response explicitly identifies an invalid session. Other failures stay on onboarding and display the API error. Onboarding progress is held in this tab and restored after signing in again. Check the failed `PATCH /api/users/me` response in the browser Network panel; do not share request cookies or credentials. |
| Login suddenly stops accepting an existing session | A changed `JWT_SECRET` invalidates previously issued tokens. Sign in again; avoid rotating the secret unless intended. |
| No workouts appear | Run `npm run seed:workouts` from `backend` and check that the API uses the same database you seeded. |
| Google/Facebook login, email, uploads, AI, or Fit sync unavailable | These require the corresponding optional provider credentials and correctly configured provider account/callbacks. Core local use does not include provider credentials. |
| Spotify player does not load | Check internet access, browser extensions, and network rules; try the playlist's Spotify link. |

## Project layout

```text
adaptive-fitness/
├── backend/
│   ├── config/          # Database, Passport, and Cloudinary configuration
│   ├── controllers/     # HTTP request handlers and application workflows
│   ├── middleware/      # Authentication, authorization, and error handling
│   ├── models/          # Mongoose schemas and models
│   ├── routes/          # API route definitions
│   ├── scripts/         # Supporting scripts
│   ├── seeds/           # Sample workout seed data
│   ├── services/        # Stats, Google Fit, and integration services
│   ├── utils/            # Tokens, email, and meal generation
│   └── server.js         # Express application startup
├── frontend/
│   └── src/
│       ├── app/          # Redux store and application setup
│       ├── components/   # Shared UI and layout
│       ├── features/     # Redux feature state
│       ├── pages/        # Main application screens
│       └── services/     # RTK Query API client
├── SETUP.md              # Expanded Windows setup and environment reference
└── start-dev.ps1         # Opens both local development servers
```

## API overview

All routes are under `/api`. Private routes require a valid login cookie; workout catalogue management routes also require an admin account.

| Area | Example routes | Purpose |
| --- | --- | --- |
| Health | `GET /health` | Check API availability. |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | Account registration and session management. |
| User | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/saved` | Profile and saved items. |
| Workouts | `GET /workouts`, `GET /workouts/:id`, `POST /workouts/log`, `GET /workouts/logs` | Browse workouts and track sessions. |
| Diet | `POST /diet/generate`, `GET /diet`, `PATCH /diet/swap-meal`, `POST /diet/save`, `POST /diet/log`, `GET /diet/log` | Generate and manage meal plans and food logs. |
| Progress | `GET /progress`, `POST /progress` | Track and review progress. |
| Statistics | `GET /stats`, `GET /stats/insights`, `POST /stats/refresh` | Dashboard statistics and insights. |
| Posture | `POST /posture/session`, `GET /posture/history` | Save and review posture sessions. |
| Health | `GET /health/google-fit/auth`, `POST /health/sync` | Optional Google Fit integration. |

## Security notes

- `backend\.env` and `frontend\.env` are local configuration files; never commit secrets or tokens.
- Never put backend credentials in a `VITE_*` variable. Frontend variables are bundled for browser access.
- Do not use the example JWT placeholder as a real secret.
- Do not share an Atlas URI containing credentials. Use your own database user and keep local database backups before maintenance.
- Optional providers require your own accounts, API access, and credentials; this repository does not provide them.

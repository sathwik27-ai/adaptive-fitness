# Adaptive Fitness local setup (Windows)

This guide runs the existing React/Vite frontend and Express/Mongoose API from PowerShell. Do not commit local `.env` files or place backend secrets in frontend variables.

## 1. Prerequisites

- Windows 10/11 and PowerShell.
- Node.js **20.19+** or **22.12+** (the project uses Vite 7 and Mongoose 9). Installing the current Node.js LTS release is recommended; npm is included with Node.js.
- A reachable MongoDB server:
  - Local: MongoDB Community Server running on `127.0.0.1:27017`, or
  - Hosted: a MongoDB Atlas cluster and a database user/network rule that permits this computer to connect.
- Git is optional for running the project.

The project has no root npm package. Install the backend and frontend dependencies separately, using each folder's committed lockfile.

## 2. Configure backend environment

The backend reads `backend\.env` regardless of the current working directory. `backend\.env.example` lists all app-level environment variables.

From the repository root, create the local file and a cryptographically random 64-byte JWT secret only if the file does not already exist:

```powershell
if (-not (Test-Path 'backend\.env')) {
    Copy-Item 'backend\.env.example' 'backend\.env'
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

If `backend\.env` already exists, keep its JWT secret; do not regenerate it casually because existing login cookies/tokens will stop verifying. Edit the Mongo URI and any integrations in that file with a text editor. The JWT placeholder in `.env.example` is not a valid secret and is rejected at startup.

### Backend variables

| Variable | Required | Purpose and safe local value |
|---|---|---|
| `JWT_SECRET` | Yes | Signs and verifies HS256 session JWTs in the HTTP-only `token` cookie. Use the command above; do not reuse a production secret. |
| `MONGO_URI` | Yes (or `MONGODB_URI`) | Mongoose database connection. Local example: `mongodb://127.0.0.1:27017/adaptive_fitness`. For Atlas, use the URI from Atlas and replace its username/password with your own database user's credentials. |
| `NODE_ENV` | No | Set to `development` for development request logging. |
| `PORT` | No | API port; defaults to `5000`. |
| `FRONTEND_URL` | No | Allowed credentialed CORS origin and OAuth return origin; defaults to `http://localhost:5173`. |
| `BACKEND_URL` | No | Google Fit OAuth redirect base URL; defaults to `http://localhost:5000`. |
| `JWT_EXPIRES_IN` | No | `jsonwebtoken` token lifetime; defaults to `7d`. |
| `COOKIE_SECRET` | No | Optional cookie-parser signing key. The authentication cookie itself is HTTP-only and JWT-verified; this value is not the JWT key. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | No; paired | Google sign-in and Google Fit. Configure an OAuth client in Google Cloud; add `http://localhost:5000/api/auth/google/callback` and `http://localhost:5000/api/health/google-fit/callback` as authorized redirects. Google Fit use also requires the relevant Fitness API/scopes to be enabled and granted. |
| `GOOGLE_CALLBACK_URL` | No | Google sign-in callback; defaults to `http://localhost:5000/api/auth/google/callback`. |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | No; paired | Facebook sign-in. Create a Facebook developer app and allow `http://localhost:5000/api/auth/facebook/callback` as its redirect URL. |
| `FACEBOOK_CALLBACK_URL` | No | Facebook sign-in callback; defaults to `http://localhost:5000/api/auth/facebook/callback`. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | No; all three | Cloudinary-hosted workout image uploads. Obtain these from your Cloudinary account. Without them, regular app features work, but image upload operations require Cloudinary configuration. |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | No; paired | Welcome email sending through Gmail SMTP. Use a Gmail App Password generated for an account with 2-Step Verification; do not use your normal Gmail password. Without these values, registration still works and email is not sent. |
| `HUGGING_FACE_API_KEY` | No | Hosted AI requests for generated meal plan assistance and fitness insights. Create a token in Hugging Face settings. The application has local/rules-based or generic insight fallbacks when unavailable; no key is provided by this project. |

`MONGODB_URI` is accepted as an alternative to `MONGO_URI`. The `.env.example` uses `MONGO_URI`. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, Facebook credentials, Gmail credentials, and Cloudinary credentials are validated as pairs/groups; leave an optional integration entirely blank until configured.

## 3. Frontend environment

`VITE_API_BASE_URL` is the only frontend environment variable. It is public build-time configuration, **not a place for secrets**. By default the client calls port `5000` on the same hostname used to open the frontend (`localhost` or `127.0.0.1`) so browser cookies remain on one local host. Set this variable only when the API is on a different host or port.

Optionally copy the example (no frontend `.env` is needed for the default local URLs):

```powershell
Copy-Item 'frontend\.env.example' 'frontend\.env'
```

## 4. Install packages

Run these from the repository root:

```powershell
Push-Location backend
npm ci
Pop-Location

Push-Location frontend
npm ci
Pop-Location
```

## 5. Start/configure MongoDB and initialize data

Start your local MongoDB Community Server service, or configure an Atlas URI in `backend\.env`. Database credentials and access rules are managed by you; no database or hosted service is provisioned by this repository.

There are no separate database migrations. Mongoose initializes its models/indexes when the API connects. The application generates meal plans from the rules-based `backend\utils\mealGenerator.js`; no meal seed is needed.

To add the sample workout catalogue to a **new or existing** database, run:

```powershell
Push-Location backend
npm run seed:workouts
Pop-Location
```

This command upserts the sample workouts by title and does not clear existing workout records. It does require a reachable MongoDB URI. `backend\seeds\seedMeals.js` is not part of the supported setup command and currently contains placeholder meals; do not run it against a database with data you want to keep.

Workout create/update/delete APIs and the Admin Upload page require a user whose MongoDB `role` is `admin`. New registrations are ordinary users by default. To grant local admin access, update only your own account in MongoDB Compass or `mongosh` (replace the example email):

```javascript
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "admin" } }
)
```

## 6. Start the backend

In a PowerShell terminal:

```powershell
Set-Location 'C:\Users\Sathw\adaptive-fitness\backend'
npm run dev
```

`npm start` runs the same server without watch mode. The server validates required settings before loading Passport, connects to MongoDB before accepting HTTP requests, and starts Google Fit background sync schedules only after connection succeeds. Expected API base URL: `http://localhost:5000/api`.

## 7. Start the frontend

Open a **second** PowerShell terminal:

```powershell
Set-Location 'C:\Users\Sathw\adaptive-fitness\frontend'
npm run dev
```

Open **http://localhost:5173**. The Vite development server proxies no API routes; the client calls `VITE_API_BASE_URL` directly and sends cookies with credentialed requests. CORS allows the configured `FRONTEND_URL`; in non-production mode it also allows its equivalent `localhost`/`127.0.0.1` hostname on the same port. Production remains restricted to the configured origin.

To open both dev servers in separate PowerShell windows after installing dependencies and creating `backend\.env`, run from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

The script only checks prerequisites and launches processes. It does not install software, alter execution policy permanently, or print/read environment secrets.

## 8. Verify the application

With MongoDB reachable and the backend running:

```powershell
Invoke-RestMethod 'http://localhost:5000/api/health'
```

Expected response: `{ "status": "ok" }`. Then load `http://localhost:5173`, register a user with a password of at least 8 characters, complete onboarding, and verify the dashboard/workout/diet/progress pages. Registration and authenticated features need a working database.

Optional checks:

```powershell
Push-Location frontend
npm test
npm run lint
npm run build
Pop-Location
```

The frontend includes browser-camera posture detection (grant camera access on localhost), and this feature needs a browser with WebGL support. OAuth, Google Fit, email, Cloudinary uploads, and hosted AI require the corresponding real credentials and provider configuration above; they cannot be verified without those services.

The dashboard's Spotify playlist player is an embedded third-party player and needs an internet connection, but no Spotify credentials.

## 9. Production deployment (Vercel + Render)

The deployed application uses:

- Frontend: `https://adaptive-fitness-seven.vercel.app`
- Backend/API: `https://adaptive-fitness-viux.onrender.com`
- Health endpoint: `https://adaptive-fitness-viux.onrender.com/api/health`

Set these project environment variables in the hosting dashboards (never in committed files):

| Host | Variable | Value |
|---|---|---|
| Vercel | `VITE_API_BASE_URL` | `https://adaptive-fitness-viux.onrender.com/api` |
| Render | `NODE_ENV` | `production` |
| Render | `FRONTEND_URL` | `https://adaptive-fitness-seven.vercel.app` |
| Render | `MONGO_URI` | Your private MongoDB Atlas connection string |
| Render | `JWT_SECRET` | A strong random secret, kept private |

The frontend uses credentialed requests. The backend must return the exact Vercel origin in CORS responses and set the HTTP-only JWT cookie with `SameSite=None; Secure` in production. Local development uses `SameSite=Lax` and does not require cross-site cookies. Do not set a cookie domain; it should remain host-only for the API host. After changing Vercel variables, redeploy the frontend so Vite includes the new API URL. After changing backend code or Render variables, redeploy the Render service.

Verify `/api/health`, then test account login, onboarding submission, navigation to a protected page, refresh, and logout in a production browser. Hosting health and CORS preflight alone do not verify an authenticated session. Some browsers block third-party cookies across the separate `vercel.app` and `onrender.com` sites; if that applies, configure custom frontend and API domains under the same site and update the frontend URL, API base URL, backend CORS origin, and OAuth callback URLs.

## 10. Troubleshooting

- **Missing `JWT_SECRET` / secret validation error:** create `backend\.env` from the example and replace its placeholder with a random secret using the command in section 2. Do not put the JWT secret in a frontend file.
- **MongoDB connection error / server selection timeout:** make sure MongoDB is running locally, or check the Atlas URI, database-user password, IP access list, network access, and database name. The API intentionally does not listen if the database connection fails.
- **`npm ci` reports an unsupported engine:** install Node.js 20.19+ or 22.12+ (or newer supported Node release), open a fresh terminal, and retry.
- **Browser reports CORS or failed API requests:** backend should be on port 5000; frontend on 5173. If you changed either, align `PORT`, `FRONTEND_URL`, and `VITE_API_BASE_URL` (include `/api` in the frontend URL), then restart both dev servers.
- **Login works but refresh redirects to login:** confirm the browser accepts the HTTP-only cookie and that frontend requests use the same local host (`localhost`, not a mix of `localhost` and `127.0.0.1`). Keep `FRONTEND_URL=http://localhost:5173`.
- **Onboarding request fails and returns to login:** inspect the response status and message for `PATCH /api/users/me` in the browser Network panel. An explicit `SESSION_INVALID` response indicates the backend did not accept the session; other failures should stay on onboarding and show an error. Do not copy or share request cookies.
- **OAuth responds “not configured” or provider rejects redirect:** configure the complete credential pair and the exact callback URL in the provider console, then restart the backend.
- **Workout image uploads fail:** configure all three Cloudinary values. This integration is not needed for seeded/default workout data.
- **Port already in use:** close the old dev server or set an unused `PORT` and update `VITE_API_BASE_URL` accordingly.

## 11. Stop the application

In each server terminal, press **Ctrl+C**. For windows launched by `start-dev.ps1`, close the corresponding PowerShell windows or press **Ctrl+C** in each.

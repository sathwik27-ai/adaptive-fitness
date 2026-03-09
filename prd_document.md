Adaptive Fitness Companion
Product Requirements Document
MVP v1.0  ·  MERN Stack  ·  Earthy Wellness UI  ·  February 2026


1. Executive Summary

Field	Detail
Product Name	Adaptive Fitness Companion
Version	MVP 1.0
Document Status	Draft
Last Updated	February 2026
Document Owner	Product Team
Tech Stack	MERN (MongoDB · Express.js · React · Node.js)
Styling	Tailwind CSS + earthy wellness palette
Charts	Recharts
Auth	JWT + OAuth2 (Google / Facebook)
Hosting	Vercel (Frontend) · Railway / Render (Backend) · MongoDB Atlas

Product Vision
The Adaptive Fitness Companion is a personalized, data-driven fitness and nutrition web application built on the MERN stack. It adapts workouts and meal plans to each user's goals, equipment, lifestyle, and real-time progress — delivering a premium wellness experience through an earthy, calm visual identity. Every screen answers one clear question and removes the guesswork from fitness.

Success Criteria
•	≥ 80% onboarding completion rate within 30 days of launch
•	≥ 60% Day-7 user retention
•	Average session duration > 5 minutes
•	CSAT score ≥ 4.2 / 5.0 in first 90 days
•	Core Web Vitals in green zone across all pages
•	API p95 response time < 200ms


2. Problem Statement
Problem Definition
Generic fitness apps provide one-size-fits-all plans that ignore the user's equipment, budget, schedule, cuisine preferences, and current fitness level. Without personalization or visible progress, users lose motivation and abandon the app within the first month. There is a clear gap for a wellness-focused, truly adaptive platform that feels personal from the very first screen.

Impact Analysis
User Impact
•	Users waste time on workouts mismatched to their level or available equipment
•	Rigid meal plans fail users with budget constraints, allergies, or regional food preferences
•	No progress visualization leads to a 'flying blind' experience and rapid churn

Market Impact
•	Global fitness app market projected to exceed $15B by 2026
•	Personalization and AI coaching are the top purchase drivers cited by users
•	Post-pandemic demand for at-home, budget-conscious fitness is still growing

Business Impact
•	Personalization drives retention — the foundation for a freemium → premium funnel
•	Onboarding data enables upsells: nutrition consultation, AI coaching, wearable sync
•	MERN stack reduces development cost and accelerates iteration speed


3. Target Audience
Primary Persona: Alex — the Busy Beginner
Attribute	Detail
Age	22–35
Location	Urban / Suburban
Income	Mid-range (budget-conscious)
Fitness Level	Beginner to Intermediate
Equipment	Home setup or basic gym
Behaviors	Scrolls fitness content, has tried apps, struggles with consistency
Values	Efficiency, personalization, visible results, simplicity, aesthetics

Jobs to Be Done
1.	Functional: Get a realistic personalized workout + meal plan without a trainer
2.	Emotional: Feel confident the plan was built specifically for me
3.	Social: Share milestones and feel part of a motivated community

Current Solutions vs Our Advantage
Current Solution	Pain Points	Our Advantage
YouTube Workouts	No personalization or tracking	Guided plan + logged progress
Generic Fitness Apps	Static plans, weak onboarding	Dynamic adaptation from day 1
Personal Trainer	Expensive and inconvenient	Always available at a fraction of the cost
Meal Prep Blogs	Ignores budget/diet constraints	Budget-aware, preference-matched meal plans

Secondary Personas
•	Sam, the Intermediate Lifter — tracks strength gains, optimizes macros
•	Jordan, the Busy Parent — needs short home workouts and budget-friendly meals


4. User Stories
Epic: Personalized Onboarding & Plan Generation
"As a new user, I want to complete a guided onboarding questionnaire so that the app generates a personalized workout and meal plan tailored to my goals, equipment, and lifestyle."

Acceptance Criteria
☐	4-step onboarding (Age/Gender → Height/Weight → Goal/Level → Location/Equipment/Time) with progress bar
☐	Diet questions are NOT in onboarding — they live on the Diet Plan page
☐	Skip option on non-critical steps; social login via Google/Facebook available
☐	On completion, a user profile document is created in MongoDB and plan generation is triggered

Supporting User Stories
4.	"As a user, I want a Dashboard so I understand my progress at a glance."
◦	AC: Loads in < 2s; shows workouts logged, calories, weekly goal %, weight trend chart

5.	"As a user, I want to browse and filter a workout library to find sessions that fit my situation."
◦	AC: Filters for type, duration, intensity, equipment; results update in real-time

6.	"As a user, I want step-by-step workout instructions with video demos to exercise with correct form."
◦	AC: Each exercise has video/image + written instructions; session has a live timer

7.	"As a user, I want to set my diet preferences on the Diet Plan page and see a personalized meal plan."
◦	AC: Form captures diet type, goal, region, allergies, calorie target, budget; meal plan generates on submit

8.	"As a user, I want to log meals and compare against my plan to stay accountable."
◦	AC: Food diary shows planned vs actual; app shows instant kcal variance feedback


5. Complete App Flow
5.1 Authentication Flow
Landing Page  →  Sign Up / Login  →  JWT token issued  →  Stored in HTTP-only cookie
•	New users: redirect to Onboarding
•	Returning users: redirect to Dashboard
•	Social auth (Google/Facebook) via Passport.js

5.2 Onboarding Flow (4 Steps)
Step	Screen	Fields Collected
1	Personal Info	Age, Gender
2	Body Metrics	Height (cm), Weight (kg)
3	Fitness Goals	Primary Goal (weight loss/muscle/endurance), Fitness Level (beginner/intermediate/advanced)
4	Workout Setup	Location (Home/Gym), Equipment available (multi-select), Time per workout (slider)

→ Final Screen: 'Your Plan Is Ready!' with CTA to Dashboard
→ Profile saved to MongoDB; workout plan generated server-side based on collected data

5.3 Dashboard Flow
User lands on Dashboard after onboarding or login. The dashboard is the control center.
•	Top: Workout Vibes Spotify banner (embedded iframe)
•	Stats Grid: Calories Burned · Steps · Active Minutes · Sleep (4 cards)
•	Weekly Progress Chart: bar/line using Recharts with orange/olive/purple palette
•	Achievement Badges row
•	Quick-access nav: Workouts · Diet Plan · Progress · Saved

5.4 Workout Library Flow
Dashboard  →  Workouts Page  →  Filter/Search  →  Select Card  →  Workout Detail  →  Start Session
•	Library: search bar + filter chips (Beginner / Strength / Yoga / Cardio)
•	Cards show: thumbnail, name, duration, difficulty badge, equipment tag
•	Detail Page: ordered exercise list, video/image demo, step instructions, timer, 'Start Workout' CTA
•	Session Mode: live timer, exercise prompts, optional form feedback UI
•	On Complete: POST /api/workouts/log → stats recalculated → badge awarded if milestone hit

5.5 Diet Plan Flow
Diet Plan Page  →  Fill Preferences Form  →  Submit  →  Generated Meal Plan Displayed
•	Form fields: Diet Type, Goal, Region, Restrictions/Allergies, Daily Calorie Target, Budget Range
•	POST /api/diet/generate → returns meals for Breakfast, Lunch, Dinner, Snacks
•	Meal cards: name, kcal, protein/carbs/fats bar, Swap button
•	Food Diary section: log actual intake  →  planned vs actual comparison  →  instant feedback

5.6 Progress Flow
Dashboard  →  Progress Page  →  View Charts + Badges
•	Weight trend line chart
•	Workout consistency bar chart (Mon–Sun)
•	Calories burned vs goal chart
•	Strength gain chart (per muscle group)
•	Achievement badge gallery with locked/unlocked states

5.7 Saved Flow
Any page  →  bookmark icon  →  PATCH /api/user/saved  →  Saved Page
•	Tabs: Saved Workouts · Saved Meals · Saved Articles
•	Card grid layout with remove bookmark option


6. Tech Stack — MERN
6.1 Stack Overview
Layer	Technology	Purpose
Frontend	React 18 + Vite	SPA — component-based UI, fast HMR dev
Routing	React Router v6	Client-side page navigation
State	Redux Toolkit + RTK Query	Global state, API caching, optimistic updates
Styling	Tailwind CSS v3	Utility-first CSS; earthy palette via design tokens
Charts	Recharts	Dashboard charts — line, bar, composed
Forms	React Hook Form + Zod	Form validation with schema-based rules
Backend	Node.js + Express.js	REST API server
Database	MongoDB Atlas	Document DB — flexible user/workout/meal schemas
ODM	Mongoose	Schema enforcement, validation, indexing
Auth	JWT + Passport.js	Stateless auth; Google & Facebook OAuth2 strategies
File Storage	Cloudinary	Workout video/image CDN hosting
Email	Nodemailer + SendGrid	Reminders, welcome emails
Hosting Frontend	Vercel	Auto-deploy from GitHub; edge CDN
Hosting Backend	Railway / Render	Node.js server with env var management
CI/CD	GitHub Actions	Lint, test, build, deploy pipeline

6.2 Folder Structure — Frontend (React + Vite)
src/
├── assets/              # Static images, icons, fonts
├── components/          # Reusable UI components
│   ├── ui/              # Button, Card, Badge, Modal, Input
│   ├── charts/          # WeeklyChart, ProgressChart, CalorieChart
│   ├── layout/          # Navbar, Sidebar, Footer
│   └── workout/         # WorkoutCard, SessionTimer, ExerciseStep
├── pages/               # Route-level page components
│   ├── Landing.jsx
│   ├── Onboarding.jsx   # 4-step multi-screen form
│   ├── Dashboard.jsx
│   ├── Workouts.jsx
│   ├── WorkoutDetail.jsx
│   ├── DietPlan.jsx     # Diet form + generated meal plan
│   ├── Progress.jsx
│   ├── Saved.jsx
│   └── Profile.jsx
├── features/            # Redux slices (auth, workout, diet, progress)
├── hooks/               # Custom hooks (useWorkout, useDiet, useProgress)
├── services/            # RTK Query API definitions
├── utils/               # Helpers, constants, formatters
├── styles/              # Tailwind config, global CSS, design tokens
└── App.jsx              # Router + auth guard setup

6.3 Folder Structure — Backend (Node.js + Express)
server/
├── config/              # DB connection, Cloudinary, Passport config
├── controllers/         # Business logic per resource
│   ├── authController.js
│   ├── userController.js
│   ├── workoutController.js
│   ├── dietController.js
│   └── progressController.js
├── models/              # Mongoose schemas (see Section 8)
├── routes/              # Express routers
│   ├── auth.js          # POST /api/auth/register, /login, /oauth
│   ├── users.js         # GET/PATCH /api/users/:id
│   ├── workouts.js      # GET /api/workouts, POST /api/workouts/log
│   ├── diet.js          # POST /api/diet/generate, GET /api/diet
│   └── progress.js      # GET /api/progress/:userId
├── middleware/          # auth.js (JWT verify), error.js, upload.js
├── utils/               # planGenerator.js, mealGenerator.js, tokenHelper.js
└── server.js            # Express app entry point


7. Frontend Design Guidelines
7.1 Color Palette (Mandatory Tokens)
Token	Hex	Usage
bg-main	#D8CBB5	Main page background
bg-secondary	#E6DCCB	Secondary sections, sidebars
bg-card	#F4EFE6	Card backgrounds, modals
bg-surface	#CBBDA6	Alternate surface, input backgrounds
primary	#2F5D3A	Primary accent — active nav, progress bars, CTAs
primary-hover	#254C30	Hover state for primary elements
accent-light	#6F8F76	Light accent — tags, badges, secondary buttons
accent-soft	#A7C4A0	Soft highlights, success states
chart-orange	#E59A3A	Chart color 1 — calories, goals
chart-purple	#8C6FAE	Chart color 2 — strength, endurance
chart-olive	#4F7C63	Chart color 3 — consistency, steps
cta	#1B1410	Primary CTA button background (Start Workout etc.)
text-primary	#1E1E1E	Body text
text-secondary	#6B6B6B	Secondary / supporting text
text-muted	#9E9587	Timestamps, labels, captions
text-on-dark	#FFFFFF	Text on dark backgrounds

7.2 Typography
Element	Font	Size	Weight	Color
Display / App Name	Inter or Poppins	36–48px	800	#1B1410
Page Heading (H1)	Inter	28–34px	700	#1B1410
Section Heading (H2)	Inter	22–26px	600	#2F5D3A
Card Title	Inter	18–20px	600	#1E1E1E
Body Text	Inter	16px	400	#1E1E1E
Secondary Text	Inter	14px	400	#6B6B6B
Muted / Label	Inter	12–13px	400	#9E9587
Code / Mono	Fira Code	14px	400	#2F5D3A

7.3 Spacing & Shapes
•	Border radius: 16px for cards, 12px for buttons/inputs, 24px for modals
•	Card shadow: 0 4px 24px rgba(0,0,0,0.07) — soft, never harsh
•	Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px (Tailwind default)
•	Grid gap: 16px mobile / 24px tablet / 32px desktop
•	Minimum tap target: 44 × 44px on all interactive elements

7.4 Navigation
Desktop — Fixed Top Navbar
•	Background: #F4EFE6, sticky on scroll with subtle border-bottom
•	Left: Logo text 'Adaptive Fitness Companion' in #2F5D3A bold
•	Center: Nav links — Workouts · Diet Plan · Progress · Saved
•	Active link color: #2F5D3A with bottom underline indicator
•	Hover: color #254C30, transition 150ms ease
•	Right: Avatar circle → dropdown (Profile · Settings · Logout)

Mobile — Bottom Navigation Bar
•	Fixed bottom bar with 5 icon tabs: Home · Workouts · Diet · Progress · Saved
•	Active icon: #2F5D3A, inactive: #9E9587
•	Background: #F4EFE6, top border: 1px solid #CBBDA6

7.5 Page-by-Page UI Spec

🏠 Dashboard
•	Hero: Spotify 'Workout Vibes' banner — card bg #F4EFE6, green left-border accent
•	Spotify embed iframe (placeholder) + motivational tagline in #6B6B6B
•	Stats Grid (2×2 on mobile, 4-col on desktop): Calories · Steps · Active Minutes · Sleep
•	Each stat card: icon, large number in #2F5D3A, label in #6B6B6B, subtle trend arrow
•	Weekly Progress Chart: Recharts ComposedChart, colors: #E59A3A + #4F7C63 + #8C6FAE
•	Achievement Badges: horizontal scroll row, locked badges shown in 40% opacity

🚀 Onboarding (4 Steps)
•	Full-screen card centered on #D8CBB5 background
•	Progress bar at top: filled with #2F5D3A, track in #CBBDA6
•	One question group per step, large friendly typography
•	Inputs: rounded 12px, border #CBBDA6, focus ring #2F5D3A
•	Multi-select chips for equipment (toggles #A7C4A0 when selected)
•	Navigation: Back (ghost) + Continue (#1B1410 filled)
•	Final screen: animated checkmark + 'Your Plan Is Ready!' + 'Go to Dashboard' CTA

🏋️ Workouts Page
•	Search bar full-width, placeholder 'Search workouts...'
•	Filter chips below: All · Beginner · Strength · Yoga · Cardio — active chip bg #2F5D3A text #FFFFFF
•	Card grid: 1-col mobile / 2-col tablet / 3-col desktop
•	Workout Card: 16:9 image placeholder (#CBBDA6), name, duration badge, difficulty badge, 'Start' button
•	Workout Detail: breadcrumb, hero image, exercise list with step numbers, video embed placeholder, timer ring, 'Start Workout' button (#1B1410)

🥗 Diet Plan Page
•	Top: form card bg #F4EFE6, heading 'Set Your Nutrition Preferences'
•	2-col grid on desktop, 1-col on mobile
•	Fields: Diet Type (segmented control), Goal (radio cards), Region (dropdown), Restrictions (tag input), Calorie Target (number input), Budget (Low/Medium/High toggle)
•	Submit button: bg #2F5D3A, text #FFFFFF, full-width, border-radius 12px
•	Generated Meal Plan: 4 meal sections (Breakfast/Lunch/Dinner/Snacks)
•	Meal Card: name, macro bar chart, kcal badge, 'Swap' ghost button, expand for ingredients
•	Food Diary below: input row to log actual intake, progress vs target bar

📊 Progress Page
•	Metric selector tabs: Weight · Workouts · Calories · Strength
•	Large chart area (Recharts) — all charts use the 3-color palette
•	Insight panel: text summaries ('You're 85% consistent this month')
•	Badge gallery: 3-col grid, locked state grayed out, hover tooltip shows unlock condition

🔖 Saved Page
•	3 tabs: Workouts · Meals · Articles
•	Card grid matching original section styles
•	Empty state: illustration + 'Nothing saved yet — explore workouts!'

7.6 Component Library
Component	Props / Variants	Notes
<Button>	variant: primary|ghost|danger; size: sm|md|lg	Primary bg #1B1410, ghost border #2F5D3A
<Card>	padding: sm|md|lg; shadow: soft|none	bg #F4EFE6, radius 16px
<Badge>	color: green|orange|purple|muted	Fitness level, difficulty, intensity tags
<Input>	type, label, error, hint	Focus ring #2F5D3A
<ProgressBar>	value 0–100, color	bg-card track, filled #2F5D3A
<MacroBar>	protein, carbs, fats	3-segment horizontal bar
<WorkoutCard>	workout object, onSave, onStart	Used in library and saved pages
<MealCard>	meal object, onSwap	Expandable for ingredients
<StatCard>	icon, value, label, trend	Dashboard overview grid
<Modal>	isOpen, onClose, title	Confirm dialogs, workout complete
<FilterChip>	label, active, onClick	Workout library filters
<SessionTimer>	duration, onComplete	Circular progress ring + countdown

7.7 Responsiveness
Breakpoint	Width	Layout Notes
Mobile	< 640px	Single column; bottom nav; stacked cards; 16px horizontal padding
Tablet	640px – 1024px	2-column grid for cards; top nav visible; collapsible filters
Desktop	> 1024px	3-4 column grid; full sidebar optional; expanded chart views
Large	> 1280px	Max content width 1280px centered with auto margins


8. Backend — MongoDB Schemas
8.1 User Schema
// models/User.js
const UserSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String },                        // null for OAuth users
  oauthProvider: { type: String, enum: ['google','facebook',null] },
  oauthId:      { type: String },
  avatar:       { type: String },                        // Cloudinary URL
  profile: {
    age:        { type: Number },
    gender:     { type: String, enum: ['male','female','non-binary','prefer-not'] },
    height:     { type: Number },                        // cm
    weight:     { type: Number },                        // kg
    goal:       { type: String, enum: ['weight-loss','muscle-gain','endurance','maintenance'] },
    fitnessLevel: { type: String, enum: ['beginner','intermediate','advanced'] },
    location:   { type: String, enum: ['home','gym'] },
    equipment:  [{ type: String }],                      // ['dumbbells','resistance-bands',...]
    timePerWorkout: { type: Number },                    // minutes
  },
  onboardingComplete: { type: Boolean, default: false },
  savedWorkouts:  [{ type: Schema.Types.ObjectId, ref: 'Workout' }],
  savedMeals:     [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  createdAt:    { type: Date, default: Date.now }
}, { timestamps: true });

8.2 Workout Schema
// models/Workout.js
const WorkoutSchema = new Schema({
  title:        { type: String, required: true },
  type:         { type: String, enum: ['strength','cardio','yoga','hiit','flexibility'] },
  level:        { type: String, enum: ['beginner','intermediate','advanced'] },
  duration:     { type: Number },                        // minutes
  equipment:    [{ type: String }],
  targetMuscles: [{ type: String }],
  thumbnail:    { type: String },                        // Cloudinary URL
  exercises: [{
    name:       { type: String },
    sets:       { type: Number },
    reps:       { type: String },                        // '10-12' or '30s'
    restSeconds:{ type: Number },
    instructions:[{ type: String }],
    mediaUrl:   { type: String },                        // Cloudinary video/image
    mediaType:  { type: String, enum: ['video','image'] }
  }],
  tags:         [{ type: String }],
  isPublished:  { type: Boolean, default: true }
}, { timestamps: true });

8.3 WorkoutLog Schema
// models/WorkoutLog.js
const WorkoutLogSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId:    { type: Schema.Types.ObjectId, ref: 'Workout', required: true },
  completedAt:  { type: Date, default: Date.now },
  durationMins: { type: Number },
  caloriesBurned: { type: Number },
  exercises: [{
    exerciseName: { type: String },
    setsCompleted:{ type: Number },
    repsCompleted:{ type: String },
    weightKg:     { type: Number }
  }],
  notes:        { type: String }
}, { timestamps: true });

8.4 DietProfile Schema
// models/DietProfile.js
const DietProfileSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dietType:     { type: String, enum: ['veg','non-veg','vegan','keto','paleo'] },
  goal:         { type: String, enum: ['weight-loss','muscle-gain','maintenance'] },
  region:       { type: String },
  restrictions: [{ type: String }],                      // allergies, intolerances
  dailyCalorieTarget: { type: Number },
  budget:       { type: String, enum: ['low','medium','high'] },
  generatedPlan: {
    breakfast:  [MealItemSchema],
    lunch:      [MealItemSchema],
    dinner:     [MealItemSchema],
    snacks:     [MealItemSchema]
  },
  lastGeneratedAt: { type: Date }
}, { timestamps: true });

// Sub-schema: MealItem
const MealItemSchema = new Schema({
  name:         { type: String },
  calories:     { type: Number },
  protein:      { type: Number },                        // grams
  carbs:        { type: Number },
  fats:         { type: Number },
  ingredients:  [{ type: String }],
  instructions: { type: String },
  isSwapped:    { type: Boolean, default: false }
});

8.5 FoodLog Schema
// models/FoodLog.js
const FoodLogSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:         { type: Date, default: Date.now },
  entries: [{
    mealType:   { type: String, enum: ['breakfast','lunch','dinner','snack'] },
    name:       { type: String },
    calories:   { type: Number },
    protein:    { type: Number },
    carbs:      { type: Number },
    fats:       { type: Number },
    loggedAt:   { type: Date, default: Date.now }
  }],
  totalCalories: { type: Number, default: 0 },
  targetCalories:{ type: Number }
}, { timestamps: true });

8.6 Progress Schema
// models/Progress.js
const ProgressSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:         { type: Date, default: Date.now },
  weight:       { type: Number },                        // kg
  bodyFat:      { type: Number },                        // %
  measurements: {
    chest:      { type: Number },
    waist:      { type: Number },
    hips:       { type: Number },
    arms:       { type: Number }
  },
  steps:        { type: Number },
  activeMinutes:{ type: Number },
  sleepHours:   { type: Number },
  caloriesBurned: { type: Number }
}, { timestamps: true });

8.7 API Endpoint Reference
Method	Endpoint	Auth	Description
POST	/api/auth/register	Public	Create account, return JWT
POST	/api/auth/login	Public	Validate credentials, return JWT
GET	/api/auth/google	Public	Google OAuth2 redirect
GET	/api/users/me	Private	Get current user profile
PATCH	/api/users/me	Private	Update profile / onboarding data
PATCH	/api/users/me/saved	Private	Add/remove saved workouts or meals
GET	/api/workouts	Public	List workouts (filter: type, level, equipment)
GET	/api/workouts/:id	Public	Get single workout with exercises
POST	/api/workouts/log	Private	Log completed workout session
GET	/api/workouts/logs	Private	Get user's workout history
POST	/api/diet/generate	Private	Generate meal plan from DietProfile
GET	/api/diet	Private	Get current diet profile + meal plan
PATCH	/api/diet/swap	Private	Swap a meal item
POST	/api/diet/log	Private	Log food diary entry
GET	/api/diet/log	Private	Get food diary for date range
GET	/api/progress	Private	Get progress entries for charts
POST	/api/progress	Private	Add weight/body measurement entry


9. Functional Requirements
9.1 Core Features — MVP (P0)
Feature 1: Personalized Onboarding
Description: 4-step guided form collecting personal, body, goal, and workout setup data
Stack: React Hook Form + Zod validation; Redux stores answers; PATCH /api/users/me on complete
UI: Full-screen step cards on #D8CBB5; progress bar; animated transitions; chip multi-select
Acceptance Criteria: 4 steps, no diet questions, skip on optional, social login, plan triggered on finish
Effort: L

Feature 2: Dashboard
Description: Control center showing Spotify banner, stats grid, weekly chart, badges
Stack: RTK Query fetches /api/progress + /api/workouts/logs; Recharts ComposedChart
UI: 2×2 stat cards; chart with 3 palette colors; badge row; Spotify iframe
Acceptance Criteria: Loads < 2s; all stats visible; charts interactive; badges milestone-triggered
Effort: M

Feature 3: Workout Library & Session Mode
Description: Filterable workout library, detail page, live session timer
Stack: GET /api/workouts with query params; useReducer for session state; Cloudinary video embed
UI: Filter chips; 3-col card grid; detail with exercise steps; circular timer ring
Acceptance Criteria: Real-time filters; session timer; log on complete; stat + badge update
Effort: XL

Feature 4: Diet Plan Page
Description: Preference form triggers meal plan generation; food diary logs actuals
Stack: POST /api/diet/generate; rules-based meal matching (v1); Nutrition API (v2)
UI: 2-col form; meal cards with macro bar; swap button; diary section
Acceptance Criteria: All preference fields; meal plan generated; swap works; diary shows variance
Effort: L

Feature 5: Progress & Analytics
Description: Charts for weight, consistency, calories, strength over time; badge gallery
Stack: GET /api/progress + /api/workouts/logs; Recharts LineChart + BarChart
UI: Tabbed metric selector; large chart; insight text panel; badge grid
Acceptance Criteria: All 4 chart types; insight text generated; badges show lock/unlock state
Effort: M

9.2 Should Have — Post-MVP (P1)
•	Spotify music integration: embedded player in dashboard + workout session
•	Saved library: bookmark workouts/meals/articles to /api/users/me/saved
•	Push notifications / email reminders via Nodemailer + SendGrid
•	Articles & tips: seeded content collection with search

9.3 Could Have (P2)
•	AI posture feedback via TensorFlow.js PoseNet (camera-enabled devices)
•	Social challenges and leaderboards
•	Wearable sync (Apple Health / Fitbit API)
•	Premium tier: advanced analytics, AI plan regeneration, 1-on-1 trainer marketplace

9.4 Out of Scope — MVP
•	Live video coaching calls
•	Native iOS / Android apps
•	Multilingual support
•	Payment gateway / subscription billing


10. Non-Functional Requirements
Performance
Metric	Target
Page load (p95)	< 2 seconds
API response (p95)	< 200ms
Concurrent users	1,000 (MVP)
Uptime SLA	99.9%
Core Web Vitals	LCP < 2.5s · FID < 100ms · CLS < 0.1
Image loading	Lazy load all workout media; WebP format via Cloudinary transforms

Security
•	JWT stored in HTTP-only cookies (not localStorage)
•	Passwords hashed with bcrypt (salt rounds: 12)
•	OAuth2 via Passport.js (Google + Facebook strategies)
•	RBAC: User role and Admin role; all private routes middleware-verified
•	CORS whitelist: only frontend origin allowed
•	Rate limiting: express-rate-limit on /api/auth/* (max 10/min per IP)
•	Helmet.js for HTTP security headers
•	Input validation: Zod (frontend) + Mongoose schema (backend)

Accessibility
•	WCAG 2.1 AA — all color combos pass contrast check
•	All images have descriptive alt text; videos have captions
•	ARIA labels on nav, form fields, charts, modals
•	44px minimum tap targets; keyboard navigable throughout
•	Focus rings visible on all interactive elements (2px #2F5D3A)

Scalability
•	MongoDB Atlas auto-scaling; indexes on userId, workoutId, date fields
•	Cloudinary CDN for all media; no binary blobs in MongoDB
•	Stateless Express API — horizontal scaling ready
•	Redis caching (post-MVP) for frequently read workout library


11. Quality Standards — Anti-Vibe Rules
Code Quality
•	Strict TypeScript in all React components (no implicit any)
•	ESLint + Prettier enforced in CI — PRs blocked if lint fails
•	Thin controllers: Express controllers call service functions, never DB models directly
•	Explicit async/await error handling — no unhandled promise rejections
•	80% unit + integration test coverage on critical paths

Design Quality
•	All colors via Tailwind CSS design tokens defined in tailwind.config.js — no raw hex in JSX
•	All components in /components — no inline styles outside Tailwind utility classes
•	Every PR must pass WCAG 2.1 AA contrast check before merge
•	Core Web Vitals checked in CI via Lighthouse CI

What This Project Will NOT Accept
•	Placeholder 'Lorem ipsum' content in any production build
•	Features outside current phase scope added without PRD sign-off
•	Skipped tests labelled 'simple change'
•	alert() or console.log() in production code
•	Storing JWT in localStorage — HTTP-only cookies only


12. Implementation Plan
Phase 0 — Setup & Foundation (Week 1)
•	Initialize Vite + React + TypeScript + Tailwind; configure earthy design tokens
•	Set up Express + MongoDB Atlas + Mongoose; configure Passport.js auth
•	Configure GitHub repo: branch protection, ESLint/Prettier, GitHub Actions CI
•	Deploy empty frontend to Vercel; empty backend to Railway
•	Cloudinary account setup; test image/video upload
•	Seed MongoDB with 20 workout documents and 50 meal items

Phase 1 — Auth & Onboarding (Week 2)
•	Build: /register, /login pages; JWT auth flow; Google OAuth
•	Build: 4-step Onboarding with React Hook Form + Zod; Redux slice
•	API: POST /auth/register, /auth/login, GET /auth/google, PATCH /users/me
•	Test: Auth middleware; onboarding form validation; profile persistence

Phase 2 — Dashboard & Progress (Week 3)
•	Build: Dashboard page — Spotify banner, stat cards, weekly chart, badges
•	Build: Progress page — 4 chart types with Recharts, insight panel
•	API: GET /progress, GET /workouts/logs
•	Mock data seeded for chart development; RTK Query integration

Phase 3 — Workout System (Week 4)
•	Build: Workout library with filter chips, search, card grid
•	Build: Workout detail page — exercise list, video embeds, step instructions
•	Build: Session mode — timer ring, step-by-step prompts, complete flow
•	API: GET /workouts, GET /workouts/:id, POST /workouts/log
•	Badge unlock logic on session completion

Phase 4 — Diet Plan System (Week 5)
•	Build: Diet Plan page — preferences form (2-col desktop, 1-col mobile)
•	Build: Generated meal plan — 4 section cards, macro bars, swap button
•	Build: Food diary section — log form, planned vs actual progress bar
•	API: POST /diet/generate (rules-based), GET /diet, PATCH /diet/swap, POST + GET /diet/log

Phase 5 — Saved & Polish (Week 6)
•	Build: Saved page with 3 tabs (Workouts / Meals / Articles)
•	Bookmark toggle integrated across all cards
•	API: PATCH /users/me/saved
•	Responsive QA: test on 320px / 768px / 1024px / 1440px
•	Accessibility audit: axe-core scan, keyboard nav test, contrast check
•	Performance: Lighthouse CI gate — LCP < 2.5s enforced

Phase 6 — Testing & Launch (Week 7–8)
•	Unit tests: Jest + React Testing Library for all components and Redux slices
•	API tests: Supertest for all endpoints — happy path + error cases
•	E2E tests: Cypress for onboarding, workout session, diet plan flows
•	Staging deploy → manual QA sign-off → production release
•	Privacy policy + ToS published; monitoring (Sentry + UptimeRobot) configured

Timeline Summary
Phase	Focus	Duration	Output
0	Setup & Foundation	Week 1	Repo, CI/CD, empty deploys, seed data
1	Auth & Onboarding	Week 2	Working auth, 4-step onboarding, user profile
2	Dashboard & Progress	Week 3	Charts live, stat cards, badge system
3	Workout System	Week 4	Library, detail, session timer, workout log
4	Diet Plan System	Week 5	Preferences form, meal plan, food diary
5	Saved & Polish	Week 6	Saved page, responsive QA, accessibility audit
6	Testing & Launch	Weeks 7–8	Full test suite, staging QA, production release


13. Risk Assessment
Risk	Probability	Impact	Mitigation
Low onboarding completion → weak plan quality	Medium	High	A/B test step count; keep each step under 30 seconds
Nutrition API cost exceeds budget	Medium	High	Use rules-based v1; evaluate Edamam/Spoonacular pricing pre-launch
Cloudinary CDN costs spike with video uploads	Low	Medium	Set Cloudinary upload limits; use adaptive streaming
MongoDB query performance degrades at scale	Low	High	Compound indexes on userId+date; Atlas performance advisor enabled
Users churn after day 1 without habit loop	High	High	Streak counter, D1 welcome email, workout reminders on day 3
MERN stack security misconfiguration	Medium	High	Security checklist in PR template; Helmet.js + rate limiting from day 1


14. Success Metrics
North Star Metric
Weekly Active Workouts Logged per User — a user who logs workouts regularly is getting real value, building habits, and will not churn.

OKRs — First 90 Days
Objective 1: Drive Engagement
•	KR1: ≥ 60% D7 retention
•	KR2: Avg ≥ 3 workouts logged per active user per week
•	KR3: ≥ 70% onboarding completion rate

Objective 2: Validate Product Value
•	KR1: CSAT ≥ 4.2 / 5.0 in in-app survey
•	KR2: ≥ 50% of users interact with Diet Plan page in first 7 days
•	KR3: ≤ 5% of sessions include a JS error or API failure

Metrics Framework
Category	Metric	Target	Tool
Acquisition	Sign-ups / week	500 in month 1	Google Analytics
Activation	Onboarding completion	≥ 70%	Mixpanel
Retention	D7 Retention	≥ 60%	Cohort analysis
Retention	D30 Retention	≥ 35%	Cohort analysis
Engagement	Workouts logged / user / week	≥ 3	Custom event tracking
Satisfaction	CSAT	≥ 4.2 / 5.0	In-app survey
Technical	API error rate	< 0.5%	Sentry
Revenue (post-MVP)	Free → Premium conversion	≥ 5%	Billing dashboard


15. MVP Definition of Done
Feature Complete
☐	All P0 features implemented and code-reviewed
☐	All acceptance criteria verified per feature
☐	Workout seed data (≥ 20 workouts, 3 categories) live in MongoDB Atlas

Quality Assurance
☐	Jest unit tests ≥ 80% coverage on auth, workout, diet, progress flows
☐	Supertest API tests passing for all endpoints (happy + error paths)
☐	Cypress E2E tests: onboarding flow, workout session, diet plan generation
☐	Manual QA: Chrome, Safari, Firefox, Edge (latest 2 versions)
☐	Responsive QA: 375px, 768px, 1024px, 1440px
☐	Lighthouse CI gate: LCP < 2.5s, FID < 100ms, CLS < 0.1
☐	WCAG 2.1 AA audit passed (axe-core zero critical violations)

Documentation
☐	API docs: all endpoints documented in Postman collection
☐	README: local setup, env vars, seed data instructions
☐	Deployment guide: Vercel + Railway configuration documented

Release Ready
☐	Staging environment fully validated and signed off by product owner
☐	Sentry error monitoring + UptimeRobot uptime alerting configured
☐	Rollback plan documented and tested
☐	Privacy policy + Terms of Service published
☐	Welcome email sequence live in SendGrid


16. Developer Handoff
Deliverables from Design
•	High-fidelity Figma mockups for all 11 screens + responsive variants
•	Interactive Figma prototype: onboarding → dashboard → workout session → diet plan flows
•	Style guide: exact hex tokens, typography scale, spacing grid, radius values
•	Component annotations: hover/active states, form validation states, empty states
•	SVG icon exports + Cloudinary placeholder images for workout cards and meal cards
•	Responsive breakpoints: 375px / 768px / 1024px / 1440px documented

Tailwind Config — Design Tokens
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-main':      '#D8CBB5',
        'bg-secondary': '#E6DCCB',
        'bg-card':      '#F4EFE6',
        'bg-surface':   '#CBBDA6',
        'primary':      '#2F5D3A',
        'primary-hover':'#254C30',
        'accent-light': '#6F8F76',
        'accent-soft':  '#A7C4A0',
        'chart-orange': '#E59A3A',
        'chart-purple': '#8C6FAE',
        'chart-olive':  '#4F7C63',
        'cta':          '#1B1410',
        'text-primary': '#1E1E1E',
        'text-secondary':'#6B6B6B',
        'text-muted':   '#9E9587',
      },
      borderRadius: { card: '16px', btn: '12px', modal: '24px' },
      fontFamily: { sans: ['Inter', 'Poppins', 'sans-serif'] }
    }
  }
}

End of Document

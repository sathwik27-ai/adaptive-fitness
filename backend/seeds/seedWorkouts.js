require('dotenv').config();
const mongoose = require('mongoose');
const Workout = require('../models/Workout');

const workouts = [
    // ─── STRENGTH ───────────────────────────────────────────────────────────────
    {
        title: 'Full Body Strength Starter',
        type: 'strength', level: 'beginner', duration: 30,
        equipment: ['dumbbells'], targetMuscles: ['chest', 'back', 'legs', 'core'],
        thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        exercises: [
            { name: 'Goblet Squat', sets: 3, reps: '12', restSeconds: 60, instructions: ['Stand feet shoulder-width', 'Hold dumbbell at chest', 'Squat until thighs parallel'] },
            { name: 'Dumbbell Row', sets: 3, reps: '10', restSeconds: 60, instructions: ['Hinge at hip', 'Pull dumbbell to hip', 'Squeeze shoulder blade'] },
            { name: 'Push-Up', sets: 3, reps: '8-12', restSeconds: 60, instructions: ['Keep core braced', 'Lower chest to floor', 'Push back explosively'] },
        ],
        tags: ['beginner', 'full-body', 'home'], isPublished: true,
    },
    {
        title: 'Upper Body Power',
        type: 'strength', level: 'intermediate', duration: 45,
        equipment: ['dumbbells', 'bench'], targetMuscles: ['chest', 'shoulders', 'triceps', 'biceps'],
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
        exercises: [
            { name: 'Dumbbell Bench Press', sets: 4, reps: '10-12', restSeconds: 90, instructions: ['Lie on bench', 'Lower dumbbells to chest', 'Press explosively'] },
            { name: 'Overhead Press', sets: 3, reps: '10', restSeconds: 75, instructions: ['Stand feet hip-width', 'Press dumbbells overhead', 'Avoid arching back'] },
            { name: 'Bicep Curl', sets: 3, reps: '12', restSeconds: 60, instructions: ['Keep elbows pinned', 'Curl through full range', 'Squeeze at top'] },
        ],
        tags: ['intermediate', 'upper-body', 'gym'], isPublished: true,
    },
    {
        title: 'Leg Day Destroyer',
        type: 'strength', level: 'advanced', duration: 60,
        equipment: ['barbell', 'rack', 'dumbbells'], targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
        thumbnail: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400',
        exercises: [
            { name: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 120, instructions: ['Bar on traps', 'Break at hips and knees simultaneously', 'Drive up through heels'] },
            { name: 'Romanian Deadlift', sets: 3, reps: '10', restSeconds: 90, instructions: ['Hip hinge, soft knees', 'Lower bar along legs', 'Feel hamstring stretch'] },
            { name: 'Walking Lunges', sets: 3, reps: '12 each leg', restSeconds: 75, instructions: ['Step forward into lunge', 'Back knee near floor', 'Drive through front heel'] },
        ],
        tags: ['advanced', 'legs', 'gym'], isPublished: true,
    },
    {
        title: 'Core & Abs Sculptor',
        type: 'strength', level: 'beginner', duration: 20,
        equipment: ['none'], targetMuscles: ['core', 'abs', 'obliques'],
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        exercises: [
            { name: 'Plank', sets: 3, reps: '30s', restSeconds: 45, instructions: ['Forearms flat', 'Body straight line', 'Breathe steadily'] },
            { name: 'Bicycle Crunch', sets: 3, reps: '20', restSeconds: 45, instructions: ['Opposite elbow to knee', 'Slow controlled twist', 'Keep lower back pressed'] },
            { name: 'Dead Bug', sets: 3, reps: '10 each', restSeconds: 45, instructions: ['Arms up, legs 90°', 'Lower opposite arm/leg', 'Keep lower back glued to floor'] },
        ],
        tags: ['beginner', 'core', 'home', 'no-equipment'], isPublished: true,
    },
    {
        title: 'Dumbbell Muscle Builder',
        type: 'strength', level: 'intermediate', duration: 50,
        equipment: ['dumbbells'], targetMuscles: ['chest', 'back', 'shoulders', 'arms'],
        thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
        exercises: [
            { name: 'Dumbbell Fly', sets: 4, reps: '12', restSeconds: 75, instructions: ['Arms slightly bent', 'Open wide like hugging tree', 'Squeeze at top'] },
            { name: 'Single Arm Row', sets: 4, reps: '10 each', restSeconds: 60, instructions: ['Brace on bench', 'Full stretch at bottom', 'Elbow past torso'] },
            { name: 'Lateral Raises', sets: 3, reps: '15', restSeconds: 60, instructions: ['Slight bend in elbow', 'Raise to shoulder height', 'Control the descent'] },
        ],
        tags: ['intermediate', 'hypertrophy', 'home'], isPublished: true,
    },

    // ─── CARDIO ──────────────────────────────────────────────────────────────────
    {
        title: 'Morning Cardio Blast',
        type: 'cardio', level: 'beginner', duration: 25,
        equipment: ['none'], targetMuscles: ['full-body', 'cardiovascular'],
        thumbnail: 'https://images.unsplash.com/photo-1571732154690-f6d1c294511e?w=400',
        exercises: [
            { name: 'Jumping Jacks', sets: 3, reps: '30s', restSeconds: 30, instructions: ['Arms overhead, feet wide', 'Reverse the movement', 'Land softly'] },
            { name: 'High Knees', sets: 3, reps: '30s', restSeconds: 30, instructions: ['Drive knees to hip height', 'Pump arms vigorously', 'Stay on balls of feet'] },
            { name: 'Mountain Climbers', sets: 3, reps: '30s', restSeconds: 30, instructions: ['Plank position', 'Alternating drive knees to chest', 'Hips stay low'] },
        ],
        tags: ['beginner', 'cardio', 'home', 'no-equipment'], isPublished: true,
    },
    {
        title: 'Fat Burn Interval Run',
        type: 'cardio', level: 'intermediate', duration: 40,
        equipment: ['treadmill'], targetMuscles: ['legs', 'cardiovascular'],
        thumbnail: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
        exercises: [
            { name: '5 Min Warm-Up Walk', sets: 1, reps: '5 min', restSeconds: 0, instructions: ['3.5–4 km/h pace', 'Swing arms naturally'] },
            { name: 'Run Interval', sets: 6, reps: '2 min', restSeconds: 90, instructions: ['7–8 km/h pace', 'Land mid-foot'] },
            { name: '5 Min Cool Down Walk', sets: 1, reps: '5 min', restSeconds: 0, instructions: ['3 km/h pace', 'Deep breaths'] },
        ],
        tags: ['intermediate', 'cardio', 'gym', 'fat-loss'], isPublished: true,
    },
    {
        title: 'Jump Rope HIIT',
        type: 'cardio', level: 'advanced', duration: 30,
        equipment: ['jump-rope'], targetMuscles: ['calves', 'cardiovascular', 'coordination'],
        thumbnail: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=400',
        exercises: [
            { name: 'Basic Jump', sets: 4, reps: '60s', restSeconds: 20, instructions: ['Wrists rotate', 'Lightly hop on balls of feet'] },
            { name: 'Double-Under', sets: 4, reps: '30s', restSeconds: 30, instructions: ['Rope passes twice per jump', 'Explosive jump, quick wrists'] },
            { name: 'Alternating Foot Step', sets: 4, reps: '60s', restSeconds: 20, instructions: ['Jog in place with rope', 'High cadence'] },
        ],
        tags: ['advanced', 'cardio', 'home', 'endurance'], isPublished: true,
    },
    {
        title: 'Cycling Endurance Ride',
        type: 'cardio', level: 'intermediate', duration: 45,
        equipment: ['stationary-bike'], targetMuscles: ['quads', 'hamstrings', 'cardiovascular'],
        thumbnail: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400',
        exercises: [
            { name: 'Steady-State Ride', sets: 1, reps: '30 min', restSeconds: 0, instructions: ['Moderate resistance', '70–80 rpm cadence', 'Breathe rhythmically'] },
            { name: 'Standing Sprints', sets: 5, reps: '20s', restSeconds: 90, instructions: ['Increase resistance', 'Stand out of saddle', 'Max effort'] },
        ],
        tags: ['intermediate', 'cardio', 'gym', 'endurance'], isPublished: true,
    },
    {
        title: 'Low-Impact Flow Walk',
        type: 'cardio', level: 'beginner', duration: 35,
        equipment: ['none'], targetMuscles: ['full-body', 'cardiovascular'],
        thumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
        exercises: [
            { name: 'Brisk Walk', sets: 1, reps: '20 min', restSeconds: 0, instructions: ['Brisk pace', 'Arm swing engaged'] },
            { name: 'Bodyweight Squats', sets: 3, reps: '15', restSeconds: 30, instructions: ['Take breaks during walk', 'Full depth', 'Pause at bottom'] },
            { name: 'Calf Raises', sets: 3, reps: '20', restSeconds: 30, instructions: ['Rise onto toes', 'Full range of motion'] },
        ],
        tags: ['beginner', 'low-impact', 'home', 'rehabilitation'], isPublished: true,
    },

    // ─── YOGA ────────────────────────────────────────────────────────────────────
    {
        title: 'Morning Sun Salutation Flow',
        type: 'yoga', level: 'beginner', duration: 25,
        equipment: ['yoga-mat'], targetMuscles: ['full-body', 'flexibility'],
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        exercises: [
            { name: 'Mountain Pose', sets: 1, reps: '5 breaths', restSeconds: 0, instructions: ['Feet together', 'Spine tall', 'Arms at sides'] },
            { name: 'Sun Salutation A', sets: 5, reps: '1 flow', restSeconds: 0, instructions: ['Inhale arms up', 'Forward fold', 'Chaturanga', 'Updog', 'Downdog'] },
            { name: 'Child\'s Pose', sets: 1, reps: '1 min', restSeconds: 0, instructions: ['Knees wide', 'Arms extended', 'Forehead to mat'] },
        ],
        tags: ['beginner', 'yoga', 'flexibility', 'home'], isPublished: true,
    },
    {
        title: 'Power Yoga Core Flow',
        type: 'yoga', level: 'intermediate', duration: 45,
        equipment: ['yoga-mat'], targetMuscles: ['core', 'arms', 'balance', 'flexibility'],
        thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
        exercises: [
            { name: 'Boat Pose', sets: 3, reps: '30s', restSeconds: 15, instructions: ['Balance on sit bones', 'Legs at 45°', 'Arms parallel to floor'] },
            { name: 'Crow Pose', sets: 3, reps: '20s', restSeconds: 30, instructions: ['Hands shoulder-width', 'Knees on triceps', 'Tip forward to balance'] },
            { name: 'Warrior Flow', sets: 2, reps: '5 breaths each', restSeconds: 0, instructions: ['Warrior I to II to Reverse Warrior', 'Hold, breathe, flow'] },
        ],
        tags: ['intermediate', 'yoga', 'core', 'balance'], isPublished: true,
    },
    {
        title: 'Evening Restore & Stretch',
        type: 'yoga', level: 'beginner', duration: 30,
        equipment: ['yoga-mat', 'blocks'], targetMuscles: ['hips', 'spine', 'shoulders', 'relaxation'],
        thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
        exercises: [
            { name: 'Legs Up the Wall', sets: 1, reps: '5 min', restSeconds: 0, instructions: ['Lie back', 'Legs vertical against wall', 'Arms relaxed'] },
            { name: 'Pigeon Pose', sets: 2, reps: '90s each', restSeconds: 0, instructions: ['Hip over front ankle', 'Fold forward', 'Breathe into hip'] },
            { name: 'Supine Twist', sets: 2, reps: '1 min each', restSeconds: 0, instructions: ['Lie flat', 'Knee crosses body', 'Gaze opposite way'] },
        ],
        tags: ['beginner', 'yoga', 'recovery', 'stress-relief'], isPublished: true,
    },
    {
        title: 'Advanced Ashtanga Sequence',
        type: 'yoga', level: 'advanced', duration: 60,
        equipment: ['yoga-mat'], targetMuscles: ['full-body', 'balance', 'strength', 'flexibility'],
        thumbnail: 'https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?w=400',
        exercises: [
            { name: 'Primary Series Opening', sets: 1, reps: '5 rounds', restSeconds: 0, instructions: ['Sun Salutation A x3', 'Sun Salutation B x2', 'Standing sequence'] },
            { name: 'Seated Forward Fold Sequence', sets: 1, reps: '5 postures', restSeconds: 0, instructions: ['Janu Sirsasana', 'Paschimottanasana', 'Navasana x5'] },
            { name: 'Closing Sequence', sets: 1, reps: '10 min', restSeconds: 0, instructions: ['Shoulder stand', 'Plough', 'Fish', 'Final Savasana'] },
        ],
        tags: ['advanced', 'yoga', 'flexibility', 'mindfulness'], isPublished: true,
    },
    {
        title: 'Yoga Flexibility Boost',
        type: 'yoga', level: 'intermediate', duration: 35,
        equipment: ['yoga-mat', 'strap'], targetMuscles: ['hamstrings', 'hips', 'spine', 'shoulders'],
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
        exercises: [
            { name: 'Standing Forward Fold', sets: 3, reps: '60s', restSeconds: 0, instructions: ['Micro-bend knees', 'Hang heavy', 'Breathe into stretch'] },
            { name: 'Low Lunge with Twist', sets: 2, reps: '90s each', restSeconds: 0, instructions: ['Back knee down', 'Front foot under knee', 'Twist open'] },
            { name: 'Seated Wide-Leg Forward Fold', sets: 3, reps: '60s', restSeconds: 0, instructions: ['Legs wide', 'Walk hands forward', 'Relaxed spine'] },
        ],
        tags: ['intermediate', 'yoga', 'flexibility', 'hip-opener'], isPublished: true,
    },

    // ─── HIIT ────────────────────────────────────────────────────────────────────
    {
        title: 'Tabata Total Body',
        type: 'hiit', level: 'intermediate', duration: 25,
        equipment: ['none'], targetMuscles: ['full-body', 'cardiovascular'],
        thumbnail: 'https://images.unsplash.com/photo-1571019613967-11ec239fcef9?w=400',
        exercises: [
            { name: 'Burpees', sets: 8, reps: '20s on / 10s off', restSeconds: 0, instructions: ['Squat down', 'Jump feet back', 'Push-up', 'Jump up and clap'] },
            { name: 'Jump Squats', sets: 8, reps: '20s on / 10s off', restSeconds: 0, instructions: ['Squat low', 'Explode into jump', 'Land softly'] },
            { name: 'Push-Up to T', sets: 8, reps: '20s on / 10s off', restSeconds: 0, instructions: ['Push-up', 'Rotate to side plank', 'Arm to ceiling', 'Repeat other side'] },
        ],
        tags: ['intermediate', 'hiit', 'fat-loss', 'home'], isPublished: true,
    },
    {
        title: 'HIIT for Beginners',
        type: 'hiit', level: 'beginner', duration: 20,
        equipment: ['none'], targetMuscles: ['full-body', 'cardiovascular'],
        thumbnail: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400',
        exercises: [
            { name: 'Step Jacks', sets: 4, reps: '30s', restSeconds: 30, instructions: ['Step one foot out, then other', 'Arms overhead', 'No impact version'] },
            { name: 'Squat to Toe Tap', sets: 4, reps: '30s', restSeconds: 30, instructions: ['Squat, stand, tap toe out to side', 'Alternate feet'] },
            { name: 'Modified Push-Up', sets: 4, reps: '30s', restSeconds: 30, instructions: ['Knees on floor', 'Full push-up motion', 'Core braced'] },
        ],
        tags: ['beginner', 'hiit', 'low-impact', 'home'], isPublished: true,
    },
    {
        title: 'Advanced HIIT Circuit',
        type: 'hiit', level: 'advanced', duration: 35,
        equipment: ['dumbbells', 'box'], targetMuscles: ['full-body', 'explosive-power'],
        thumbnail: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400',
        exercises: [
            { name: 'Box Jumps', sets: 5, reps: '8', restSeconds: 45, instructions: ['Full squat prep', 'Explode two feet', 'Land softly on box', 'Step down'] },
            { name: 'Dumbbell Clean & Press', sets: 4, reps: '8 each', restSeconds: 60, instructions: ['Hinge, pull dumbbell to shoulder', 'Press overhead', 'Lower controlled'] },
            { name: 'Plyo Push-Ups', sets: 4, reps: '8', restSeconds: 60, instructions: ['Explosive push', 'Hands leave floor', 'Catch softly'] },
        ],
        tags: ['advanced', 'hiit', 'power', 'intensity'], isPublished: true,
    },
    {
        title: 'Kettlebell HIIT',
        type: 'hiit', level: 'intermediate', duration: 30,
        equipment: ['kettlebell'], targetMuscles: ['full-body', 'posterior-chain'],
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
        exercises: [
            { name: 'Kettlebell Swing', sets: 5, reps: '15', restSeconds: 45, instructions: ['Hip hinge, power from glutes', 'Swing to shoulder height', 'Squeeze glutes at top'] },
            { name: 'Goblet Squat', sets: 4, reps: '12', restSeconds: 45, instructions: ['Kettlebell at chest', 'Deep squat', 'Elbows track inside knees'] },
            { name: 'Turkish Get-Up', sets: 3, reps: '3 each', restSeconds: 90, instructions: ['Master each phase', 'Keep wrist stacked', 'Eyes on bell always'] },
        ],
        tags: ['intermediate', 'hiit', 'functional', 'gym'], isPublished: true,
    },
    {
        title: 'Bodyweight AMRAP',
        type: 'hiit', level: 'advanced', duration: 25,
        equipment: ['none'], targetMuscles: ['full-body', 'endurance'],
        thumbnail: 'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?w=400',
        exercises: [
            { name: '5 Burpees', sets: 1, reps: 'AMRAP 20 min', restSeconds: 0, instructions: ['In a circuit with all 3 moves', 'Minimal rest', 'Track rounds'] },
            { name: '10 Air Squats', sets: 1, reps: 'in circuit', restSeconds: 0, instructions: ['Full depth', 'Arms out for balance'] },
            { name: '15 Mountain Climbers', sets: 1, reps: 'in circuit', restSeconds: 0, instructions: ['Fast feet', 'Hips level', 'Strong plank'] },
        ],
        tags: ['advanced', 'hiit', 'amrap', 'home', 'no-equipment'], isPublished: true,
    },
];

const seedWorkouts = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');
    await Workout.deleteMany({});
    console.log('Cleared existing workouts...');
    const created = await Workout.insertMany(workouts);
    console.log(`✅ Seeded ${created.length} workouts successfully!`);
    await mongoose.disconnect();
};

seedWorkouts().catch(err => { console.error(err); process.exit(1); });

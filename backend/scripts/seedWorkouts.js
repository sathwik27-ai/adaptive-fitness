const mongoose = require('mongoose');
const Workout = require('../models/Workout');
require('dotenv').config();

const workouts = [
    {
        title: 'Full Body HIIT Blast',
        description: 'A high-intensity interval training session designed to burn maximum calories and boost metabolism.',
        type: 'hiit',
        level: 'intermediate',
        duration: 30,
        calories: 350,
        equipment: ['None', 'Mat'],
        targetMuscles: ['Full Body', 'Heart'],
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
        exercises: [
            {
                name: 'Burpees',
                sets: 3,
                reps: '45s',
                restSeconds: 15,
                instructions: ['Stand with feet shoulder-width apart.', 'Drop into a squat and place hands on floor.', 'Kick feet back into plank.', 'Return to squat and jump up.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/burpee.gif',
                mediaType: 'image'
            },
            {
                name: 'Mountain Climbers',
                sets: 3,
                reps: '45s',
                restSeconds: 15,
                instructions: ['Start in high plank position.', 'Drive knees toward chest as fast as possible.', 'Keep back flat.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/mountain-climber.gif',
                mediaType: 'image'
            }
        ],
        tags: ['fat loss', 'cardio', 'quick'],
        isPublished: true
    },
    {
        title: 'Morning Yoga Flow',
        description: 'Start your day with gentle stretches and mindful breathing to improve flexibility and focus.',
        type: 'yoga',
        level: 'beginner',
        duration: 20,
        calories: 120,
        equipment: ['Yoga Mat'],
        targetMuscles: ['Back', 'Legs', 'Mind'],
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
        exercises: [
            {
                name: 'Sun Salutation A',
                sets: 5,
                reps: '5 mins',
                restSeconds: 30,
                instructions: ['Mountain pose.', 'Forward fold.', 'Plank to Cobra.', 'Downward Dog.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/sun-salutation.gif',
                mediaType: 'image'
            }
        ],
        tags: ['stretch', 'relax', 'morning'],
        isPublished: true
    },
    {
        title: 'Strength: Upper Body Focus',
        description: 'Build strength and muscle definition in your chest, shoulders, and arms.',
        type: 'strength',
        level: 'advanced',
        duration: 45,
        calories: 400,
        equipment: ['Dumbbells', 'Bench'],
        targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?w=800&q=80',
        exercises: [
            {
                name: 'Dumbbell Chest Press',
                sets: 4,
                reps: '10-12',
                restSeconds: 60,
                instructions: ['Lie on bench with dumbbells.', 'Press weights upward until arms are straight.', 'Lower slowly to chest level.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/chest-press.gif',
                mediaType: 'image'
            }
        ],
        tags: ['muscle gain', 'heavy', 'gym'],
        isPublished: true
    },
    {
        title: 'Core Stability & Power',
        description: 'A dedicated core session to improve posture, balance, and functional strength.',
        type: 'strength',
        level: 'intermediate',
        duration: 20,
        calories: 150,
        equipment: ['None'],
        targetMuscles: ['Abs', 'Obliques', 'Lower Back'],
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        exercises: [
            {
                name: 'Plank',
                sets: 3,
                reps: '60s',
                restSeconds: 30,
                instructions: ['Place elbows under shoulders.', 'Keep body in straight line.', 'Engage core and glutes.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/plank.gif',
                mediaType: 'image'
            },
            {
                name: 'Russian Twists',
                sets: 3,
                reps: '20 per side',
                restSeconds: 30,
                instructions: ['Sit with knees bent, feet off floor.', 'Lean back slightly.', 'Rotate torso from side to side.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/russian-twist.gif',
                mediaType: 'image'
            }
        ],
        tags: ['core', 'abs', 'no-equipment'],
        isPublished: true
    },
    {
        title: 'Daily Stretch & Reset',
        description: 'Quick flexibility routine to relieve tension and improve mobility after a long day.',
        type: 'flexibility',
        level: 'beginner',
        duration: 15,
        calories: 60,
        equipment: ['None'],
        targetMuscles: ['Hamstrings', 'Hips', 'Back'],
        thumbnail: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80',
        exercises: [
            {
                name: 'Child\'s Pose',
                sets: 1,
                reps: '2 mins',
                restSeconds: 0,
                instructions: ['Kneel on floor, toes together.', 'Sit on heels and fold forward.', 'Extend arms in front.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/childs-pose.gif',
                mediaType: 'image'
            },
            {
                name: 'Cat-Cow Stretch',
                sets: 3,
                reps: '10 reps',
                restSeconds: 15,
                instructions: ['On all fours.', 'Inhale, arch back (Cow).', 'Exhale, round back (Cat).'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/cat-cow.gif',
                mediaType: 'image'
            }
        ],
        tags: ['recovery', 'relax', 'flexibility'],
        isPublished: true
    },
    {
        title: 'Pure Cardio Burn',
        description: 'Ignite your cardiovascular system with this intense running-inspired HIIT workout.',
        type: 'cardio',
        level: 'intermediate',
        duration: 25,
        calories: 300,
        equipment: ['None'],
        targetMuscles: ['Heart', 'Legs'],
        thumbnail: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&q=80',
        exercises: [
            {
                name: 'High Knees',
                sets: 4,
                reps: '45s',
                restSeconds: 15,
                instructions: ['Run in place.', 'Drive knees toward chest.', 'Pump arms.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/high-knees.gif',
                mediaType: 'image'
            },
            {
                name: 'Jumping Jacks',
                sets: 4,
                reps: '45s',
                restSeconds: 15,
                instructions: ['Jump with feet apart and clap hands overhead.', 'Return to standing.'],
                mediaUrl: 'https://res.cloudinary.com/dxm2egxbd/image/upload/v1/workouts/jumping-jacks.gif',
                mediaType: 'image'
            }
        ],
        tags: ['speed', 'endurance', 'cardio'],
        isPublished: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/webathon_db');
        console.log('Connected to MongoDB');

        // Clear existing workouts before seeding to avoid duplicates
        await Workout.deleteMany({});
        console.log('Cleared existing workouts');

        await Workout.insertMany(workouts);
        console.log('Successfully seeded workouts!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();

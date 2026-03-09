const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkoutSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['strength', 'cardio', 'yoga', 'hiit', 'flexibility'] },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    duration: { type: Number },                          // minutes
    calories: { type: Number, default: 0 },              // estimated kcal
    equipment: [{ type: String }],
    targetMuscles: [{ type: String }],
    thumbnail: { type: String },                          // Cloudinary URL or placeholder
    exercises: [{
        name: { type: String },
        sets: { type: Number },
        reps: { type: String },                        // '10-12' or '30s'
        restSeconds: { type: Number },
        instructions: [{ type: String }],
        mediaUrl: { type: String },                        // Cloudinary video/image
        mediaType: { type: String, enum: ['video', 'image'] },
    }],
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
}, { timestamps: true });

WorkoutSchema.index({ type: 1, level: 1 });

module.exports = mongoose.model('Workout', WorkoutSchema);

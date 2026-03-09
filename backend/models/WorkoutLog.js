const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkoutLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: 'Workout', required: true },
    completedAt: { type: Date, default: Date.now },
    durationMins: { type: Number },
    caloriesBurned: { type: Number },
    exercises: [{
        exerciseName: { type: String },
        setsCompleted: { type: Number },
        repsCompleted: { type: String },
        weightKg: { type: Number },
    }],
    notes: { type: String },
}, { timestamps: true });

WorkoutLogSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    weight: { type: Number },          // kg
    bodyFat: { type: Number },          // %
    measurements: {
        chest: { type: Number },
        waist: { type: Number },
        hips: { type: Number },
        arms: { type: Number },
    },
    steps: { type: Number },
    activeMinutes: { type: Number },
    sleepHours: { type: Number },
    caloriesBurned: { type: Number },
}, { timestamps: true });

ProgressSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Progress', ProgressSchema);

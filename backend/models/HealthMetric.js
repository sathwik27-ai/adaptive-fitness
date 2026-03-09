const mongoose = require('mongoose');
const { Schema } = mongoose;

const HealthMetricSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    steps: { type: Number, default: 0 },
    avgHeartRate: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    source: { type: String, default: 'google_fit' },
    lastSyncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique daily entry per user
HealthMetricSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthMetric', HealthMetricSchema);

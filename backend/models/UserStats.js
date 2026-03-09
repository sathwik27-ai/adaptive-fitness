const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserStatsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Summary Metrics
    totalWorkouts: { type: Number, default: 0 },
    totalCaloriesBurned: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 },
    avgPostureScore: { type: Number, default: 100 },
    totalPostureSessions: { type: Number, default: 0 },

    // Diet adherence 
    dietAdherencePct: { type: Number, default: 0 }, // % of target calories matched
    macroCompletion: {
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },

    // Aggregates for Charts
    weeklyCalories: [{
        day: { type: String }, // 'Mon', 'Tue'...
        calories: { type: Number, default: 0 }
    }],
    weightTrend: [{
        date: { type: Date },
        weight: { type: Number }
    }],
    workoutDistribution: [{
        type: { type: String },
        count: { type: Number, default: 0 }
    }],
    stepsTrend: [{
        date: { type: Date },
        steps: { type: Number, default: 0 }
    }],
    postureTrend: [{
        date: { type: Date },
        score: { type: Number, default: 0 }
    }],
    workoutTrend: [{
        date: { type: Date },
        duration: { type: Number, default: 0 }
    }],

    lastRecalculated: { type: Date, default: Date.now },
    aiInsightCache: {
        insights: [String],
        timestamp: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('UserStats', UserStatsSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const FoodLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    entries: [{
        mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
        name: { type: String },
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fats: { type: Number },
        loggedAt: { type: Date, default: Date.now },
    }],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 },
    targetCalories: { type: Number },
}, { timestamps: true });

FoodLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FoodLog', FoodLogSchema);

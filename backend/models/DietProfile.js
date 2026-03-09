const mongoose = require('mongoose');
const { Schema } = mongoose;

const IngredientSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: String, required: true }
});

const MealOptionSchema = new Schema({
    title: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    ingredients: [IngredientSchema],
    instructions: { type: String }
});

const StructuredMealSchema = new Schema({
    mealType: { type: String, enum: ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'], required: true },
    primaryOption: MealOptionSchema,
    alternativeOptions: [MealOptionSchema],
    selectedOptionIndex: { type: Number, default: 0 }
});

const DailyPlanSchema = new Schema({
    day: { type: String },
    meals: [StructuredMealSchema],
    totals: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    }
});

const DietProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dietType: { type: String, enum: ['veg', 'non-veg', 'vegan', 'keto', 'paleo'] },
    goal: { type: String, enum: ['weight-loss', 'muscle-gain', 'maintenance'] },
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'], default: 'moderate' },
    region: { type: String },
    restrictions: [{ type: String }],
    dailyCalorieTarget: { type: Number },
    budget: { type: String, enum: ['low', 'medium', 'high'] },

    weekNumber: { type: Number },
    saved: { type: Boolean, default: false },

    // Calculated nutrition values
    bmr: { type: Number },
    tdee: { type: Number },
    macroTargets: {
        protein: { type: Number },
        carbs: { type: Number },
        fats: { type: Number },
    },

    // New 7-day structured plan
    weeklyPlan: [DailyPlanSchema],

    reasoning: { type: String },
    lastGeneratedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('DietProfile', DietProfileSchema);

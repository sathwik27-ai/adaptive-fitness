const Meal = require('../models/Meal');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── BMR (Mifflin-St Jeor) ──────────────────────────
function calculateBMR({ age, gender, height, weight }) {
    if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
    return 10 * weight + 6.25 * height - 5 * age - 161;
}

// ─── TDEE ────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9,
};

function calculateTDEE(bmr, activityLevel = 'moderate') {
    return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
}

// ─── Calorie Adjustment ─────────────────────────────
function adjustCalories(tdee, goal) {
    if (goal === 'weight-loss') return Math.round(tdee * 0.85);
    if (goal === 'muscle-gain') return Math.round(tdee * 1.10);
    return tdee; // maintenance
}

// ─── Macro Calculation ──────────────────────────────
function calculateMacros(caloriesTarget, weightKg, goal) {
    // Protein: 1.6–2.2g/kg (higher for muscle gain)
    const proteinPerKg = goal === 'muscle-gain' ? 2.0 : goal === 'weight-loss' ? 1.8 : 1.6;
    const proteinG = Math.round(proteinPerKg * weightKg);
    const proteinCal = proteinG * 4;

    // Fats: 25% of calories
    const fatCal = Math.round(caloriesTarget * 0.25);
    const fatG = Math.round(fatCal / 9);

    // Carbs: remaining
    const carbCal = caloriesTarget - proteinCal - fatCal;
    const carbG = Math.round(carbCal / 4);

    return { protein: proteinG, carbs: carbG, fats: fatG };
}

// ─── Single Meal Generator ──────────────────────────
const MEAL_TYPES = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
const CALORIE_SPLIT = { breakfast: 0.25, morning_snack: 0.08, lunch: 0.30, afternoon_snack: 0.07, dinner: 0.30 };
const ALTERNATIVE_MEALS = {
    veg: ['Greek yogurt and berry bowl', 'Cottage cheese and fruit plate', 'Chickpea and grain bowl', 'Lentil and roasted vegetable plate', 'Paneer and spinach bowl'],
    'non-veg': ['Egg and vegetable breakfast bowl', 'Turkey and fruit snack plate', 'Chicken and grain bowl', 'Tuna and avocado snack plate', 'Chicken and roasted vegetable plate'],
    vegan: ['Tofu and berry breakfast bowl', 'Hummus and fruit snack plate', 'Chickpea and grain bowl', 'Edamame and vegetable snack plate', 'Lentil and roasted vegetable plate'],
    keto: ['Egg and avocado breakfast bowl', 'Cheese and olive snack plate', 'Chicken and greens bowl', 'Avocado and seed snack plate', 'Salmon and roasted vegetable plate'],
    paleo: ['Egg and fruit breakfast bowl', 'Turkey and fruit snack plate', 'Chicken and vegetable bowl', 'Nuts and berries snack plate', 'Salmon and roasted vegetable plate'],
};

const createAlternativeOption = (primary, mealType, dietType) => {
    const mealTypeIndex = MEAL_TYPES.indexOf(mealType);
    const alternatives = ALTERNATIVE_MEALS[dietType] || ALTERNATIVE_MEALS.veg;
    const title = alternatives[mealTypeIndex] || alternatives[0];
    const calories = Math.max(0, Math.round(primary.calories * 0.95));

    return {
        title: title === primary.title ? `${title} with vegetables` : title,
        calories,
        protein: Math.max(0, Math.round(primary.protein * 1.05)),
        carbs: Math.max(0, Math.round(primary.carbs * 0.95)),
        fats: Math.max(0, Math.round(primary.fats * 1.05)),
        ingredients: [{ name: title.replace(/ bowl| plate/gi, ''), quantity: '1 serving' }],
        instructions: 'Prepare the ingredients and serve as a balanced alternative meal.',
    };
};

const generateSingleMeal = async (dietType, mealType, dailyCalorieTarget) => {
    const targetType = mealType.includes('snack') ? 'snacks' : mealType;
    const perMealCal = Math.round(dailyCalorieTarget * (CALORIE_SPLIT[mealType] || 0.20));

    // Try finding from DB
    const candidates = await Meal.find({
        tags: { $all: [dietType, targetType] },
        calories: { $gte: perMealCal - 150, $lte: perMealCal + 150 }
    });

    let meal = candidates.length > 0 ? pick(candidates) : await Meal.findOne({ tags: { $all: [dietType, targetType] } });

    if (meal) {
        const m = meal.toObject();
        return { ...m, isSwapped: false, mealSlot: mealType };
    }

    // Fallback: generate a placeholder meal with correct macros
    const macroRatio = CALORIE_SPLIT[mealType];
    return {
        name: `${mealType.replace('_', ' ')} option`,
        calories: perMealCal,
        protein: Math.round(perMealCal * 0.3 / 4),
        carbs: Math.round(perMealCal * 0.45 / 4),
        fats: Math.round(perMealCal * 0.25 / 9),
        ingredients: [],
        isSwapped: false,
        mealSlot: mealType,
    };
};

// ─── 7-Day Plan Generator ───────────────────────────
const generateWeeklyPlan = async ({ dietType, dailyCalorieTarget }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyPlan = [];

    for (const day of days) {
        const meals = [];
        for (const type of MEAL_TYPES) {
            const meal = await generateSingleMeal(dietType, type, dailyCalorieTarget);
            meals.push(meal);
        }
        const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
        const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
        const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
        const totalFats = meals.reduce((s, m) => s + (m.fats || 0), 0);
        weeklyPlan.push({ day, meals, totals: { calories: totalCal, protein: totalProtein, carbs: totalCarbs, fats: totalFats } });
    }

    return weeklyPlan;
};

// ─── Legacy single-day generator (kept for compatibility) ─
const generateMealPlan = async ({ dietType, region, dailyCalorieTarget = 2000 }) => {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const plan = {};
    for (const type of mealTypes) {
        const meal = await generateSingleMeal(dietType, type, dailyCalorieTarget);
        plan[type] = meal ? [{ ...meal, isSwapped: false }] : [];
    }
    return plan;
};

module.exports = {
    calculateBMR, calculateTDEE, adjustCalories, calculateMacros,
    generateMealPlan, generateSingleMeal, generateWeeklyPlan,
    MEAL_TYPES, CALORIE_SPLIT, ACTIVITY_MULTIPLIERS, createAlternativeOption,
};

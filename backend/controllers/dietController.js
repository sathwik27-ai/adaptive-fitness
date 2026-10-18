const DietProfile = require('../models/DietProfile');
const FoodLog = require('../models/FoodLog');
const User = require('../models/User');
const {
    calculateBMR, calculateTDEE, adjustCalories, calculateMacros,
    generateWeeklyPlan, createAlternativeOption,
} = require('../utils/mealGenerator');
const StatsService = require('../services/StatsService');
const axios = require('axios');

// Get ISO week number
const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const ANIMAL_INGREDIENTS = /\b(chicken|turkey|beef|lamb|pork|fish|salmon|tuna|shrimp|prawn|seafood|egg|eggs)\b/i;
const DAIRY_INGREDIENTS = /\b(milk|cheese|yogurt|butter|cream|whey|paneer|ghee)\b/i;
const normalizeMealOption = (option = {}) => ({
    title: option.title || option.name || '',
    calories: Number(option.calories) || 0,
    protein: Number(option.protein) || 0,
    carbs: Number(option.carbs) || 0,
    fats: Number(option.fats) || 0,
    ingredients: (Array.isArray(option.ingredients) ? option.ingredients : [])
        .map((ingredient) => typeof ingredient === 'string'
            ? { name: ingredient, quantity: '1 serving' }
            : { name: ingredient?.name || '', quantity: ingredient?.quantity || '1 serving' })
        .filter((ingredient) => ingredient.name),
    instructions: option.instructions || '',
});

const normalizeGeneratedPlan = (plan) => {
    if (!Array.isArray(plan) || plan.length !== 7) return null;
    return plan.map((day) => ({
        day: day.day,
        meals: (Array.isArray(day.meals) ? day.meals : []).map((meal, mealIndex) => {
            const primaryOption = normalizeMealOption(meal.primaryOption || meal);
            return {
                mealType: meal.mealType || ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'][mealIndex],
                primaryOption,
                alternativeOptions: (Array.isArray(meal.alternativeOptions) ? meal.alternativeOptions : [])
                    .map(normalizeMealOption)
                    .filter((option) => option.title),
                selectedOptionIndex: Number(meal.selectedOptionIndex) || 0,
            };
        }),
        totals: day.totals,
    }));
};

const structureGeneratedPlan = (plan, dietType) => plan.map((day) => ({
    ...day,
    meals: day.meals.map((meal) => {
        const primaryOption = {
            title: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            ingredients: (meal.ingredients || []).map((ingredient) => ({ name: ingredient, quantity: 'As per target' })),
            instructions: meal.instructions,
        };
        const mealType = meal.mealSlot || 'lunch';
        return {
            mealType,
            primaryOption,
            alternativeOptions: [createAlternativeOption(primaryOption, mealType, dietType)],
            selectedOptionIndex: 0,
        };
    }),
}));

const isGeneratedPlanSuitable = (plan, dietType) => {
    if (!Array.isArray(plan) || plan.length !== 7) return false;
    const dailyIngredientSignatures = [];

    for (const day of plan) {
        if (!Array.isArray(day.meals) || day.meals.length !== 5) return false;
        let animalMealCount = 0;
        const dayIngredients = [];

        for (const meal of day.meals) {
            const option = meal.primaryOption;
            if (!option?.title || !Array.isArray(option.ingredients) || option.ingredients.length === 0) return false;
            const ingredientText = `${option.title} ${option.ingredients.map((ingredient) => ingredient.name).join(' ')}`;
            if (ANIMAL_INGREDIENTS.test(ingredientText)) animalMealCount += 1;
            if (dietType === 'veg' && ANIMAL_INGREDIENTS.test(ingredientText)) return false;
            if (dietType === 'vegan' && (ANIMAL_INGREDIENTS.test(ingredientText) || DAIRY_INGREDIENTS.test(ingredientText) || /\bhoney\b/i.test(ingredientText))) {
                return false;
            }
            dayIngredients.push(...option.ingredients.map((ingredient) => ingredient.name.trim().toLowerCase()));
        }

        if (dietType === 'non-veg' && animalMealCount < 3) return false;
        dailyIngredientSignatures.push([...new Set(dayIngredients)].sort().join('|'));
    }

    return new Set(dailyIngredientSignatures).size === 7;
};

const callHuggingFaceDiet = async (prompt) => {
    try {
        if (!process.env.HUGGING_FACE_API_KEY) return null;
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}` } }
        );
        return response.data[0]?.generated_text || null;
    } catch (err) {
        console.error('HF Diet Error:', err.message);
        return null;
    }
};

// POST /api/diet/generate
const generateDiet = async (req, res, next) => {
    try {
        const { dietType, goal, region, restrictions, dailyCalorieTarget, budget, activityLevel } = req.body;
        const user = await User.findById(req.user._id);
        const p = user?.profile || {};
        const currentWeek = getWeekNumber(new Date());

        let profile = await DietProfile.findOne({ userId: req.user._id });

        let calorieTarget = dailyCalorieTarget;
        let bmr = null, tdee = null, macroTargets = null;

        if (p.age && p.gender && p.height && p.weight) {
            bmr = Math.round(calculateBMR({ age: p.age, gender: p.gender, height: p.height, weight: p.weight }));
            tdee = calculateTDEE(bmr, activityLevel || 'moderate');
            calorieTarget = adjustCalories(tdee, goal || p.goal || 'maintenance');
            macroTargets = calculateMacros(calorieTarget, p.weight, goal || p.goal);
        } else {
            calorieTarget = calorieTarget || 2000;
            macroTargets = calculateMacros(calorieTarget, 70, goal || 'maintenance');
        }

        const aiPrompt = `Generate a structured 7-day meal plan for Week ${currentWeek}. 
        Profile: ${dietType} diet, ${goal} goal, ${calorieTarget} kcal, region: ${region || 'international'}, restrictions: ${restrictions || 'none'}.
        For each day, provide 5 meals (breakfast, morning_snack, lunch, afternoon_snack, dinner).
        Each meal MUST have:
        - primaryOption: { title, calories, protein, carbs, fats, ingredients: [{name, quantity}], instructions }
        - alternativeOptions: Array of 1 similar option with ingredients.
        Return ONLY valid JSON: { "weeklyPlan": [ { "day": "Monday", "meals": [...] } ], "reasoning": "..." }`;

        let weeklyPlan = null;
        let aiReasoning = "";

        const hfResponse = await callHuggingFaceDiet(aiPrompt);
        if (hfResponse) {
            try {
                const jsonMatch = hfResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    const candidatePlan = normalizeGeneratedPlan(parsed.weeklyPlan);
                    if (isGeneratedPlanSuitable(candidatePlan, dietType)) {
                        weeklyPlan = candidatePlan;
                        aiReasoning = parsed.reasoning;
                    } else {
                        console.warn(`AI meal plan did not satisfy the ${dietType} diet or weekday variety requirements; using the local meal planner.`);
                    }
                }
            } catch (e) { console.warn("HF JSON Parse failed, falling back to template."); }
        }

        if (!weeklyPlan) {
            const generatedPlan = await generateWeeklyPlan({ dietType, dailyCalorieTarget: calorieTarget });
            weeklyPlan = structureGeneratedPlan(generatedPlan, dietType);
            if (!isGeneratedPlanSuitable(weeklyPlan, dietType)) {
                const variedPlan = await generateWeeklyPlan({ dietType, dailyCalorieTarget: calorieTarget, useDatabase: false });
                weeklyPlan = structureGeneratedPlan(variedPlan, dietType);
            }
        }

        // Backend re-calculation of totals to ensure source of truth
        weeklyPlan.forEach(day => {
            day.totals = {
                calories: day.meals.reduce((s, m) => s + m.primaryOption.calories, 0),
                protein: day.meals.reduce((s, m) => s + m.primaryOption.protein, 0),
                carbs: day.meals.reduce((s, m) => s + m.primaryOption.carbs, 0),
                fats: day.meals.reduce((s, m) => s + m.primaryOption.fats, 0),
            };
        });

        profile = await DietProfile.findOneAndUpdate(
            { userId: req.user._id },
            {
                userId: req.user._id,
                dietType, goal, region, restrictions, budget,
                activityLevel: activityLevel || 'moderate',
                dailyCalorieTarget: calorieTarget,
                bmr, tdee, macroTargets,
                weeklyPlan,
                weekNumber: currentWeek,
                saved: false,
                reasoning: aiReasoning || "Variation generated for Week " + currentWeek,
                lastGeneratedAt: new Date(),
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        await StatsService.triggerRefresh(req.user._id);
        res.json({ success: true, profile });
    } catch (err) {
        next(err);
    }
};

// GET /api/diet
const getDiet = async (req, res, next) => {
    try {
        const profile = await DietProfile.findOne({ userId: req.user._id });
        if (!profile) return res.status(404).json({ success: false, message: 'No diet profile found' });
        res.json({ success: true, profile });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/diet/swap-meal
const swapMeal = async (req, res, next) => {
    try {
        const { dayIndex, mealIndex, selectedOptionIndex } = req.body;
        const profile = await DietProfile.findOne({ userId: req.user._id });
        if (!profile) return res.status(404).json({ success: false, message: 'No profile' });

        if (!Number.isInteger(dayIndex) || !Number.isInteger(mealIndex) || !Number.isInteger(selectedOptionIndex)) {
            return res.status(400).json({ success: false, message: 'Day, meal, and option indexes must be whole numbers.' });
        }
        const day = profile.weeklyPlan[dayIndex];
        if (!day || !day.meals[mealIndex]) return res.status(400).json({ success: false, message: 'Invalid meal' });

        const meal = day.meals[mealIndex];
        if (!meal.alternativeOptions.length) {
            meal.alternativeOptions.push(createAlternativeOption(meal.primaryOption, meal.mealType, profile.dietType));
        }
        if (selectedOptionIndex < 0 || selectedOptionIndex > meal.alternativeOptions.length) {
            return res.status(400).json({ success: false, message: 'Invalid meal option.' });
        }
        meal.selectedOptionIndex = selectedOptionIndex;

        // Backend re-calculation of daily totals based on selection
        day.totals = {
            calories: day.meals.reduce((s, m) => {
                const opt = m.selectedOptionIndex === 0 ? m.primaryOption : m.alternativeOptions[m.selectedOptionIndex - 1];
                return s + (opt?.calories || 0);
            }, 0),
            protein: day.meals.reduce((s, m) => {
                const opt = m.selectedOptionIndex === 0 ? m.primaryOption : m.alternativeOptions[m.selectedOptionIndex - 1];
                return s + (opt?.protein || 0);
            }, 0),
            carbs: day.meals.reduce((s, m) => {
                const opt = m.selectedOptionIndex === 0 ? m.primaryOption : m.alternativeOptions[m.selectedOptionIndex - 1];
                return s + (opt?.carbs || 0);
            }, 0),
            fats: day.meals.reduce((s, m) => {
                const opt = m.selectedOptionIndex === 0 ? m.primaryOption : m.alternativeOptions[m.selectedOptionIndex - 1];
                return s + (opt?.fats || 0);
            }, 0),
        };

        profile.markModified('weeklyPlan');
        await profile.save();
        res.json({ success: true, profile });
    } catch (err) {
        next(err);
    }
};

// POST /api/diet/save
const savePlan = async (req, res, next) => {
    try {
        const profile = await DietProfile.findOneAndUpdate(
            { userId: req.user._id },
            { saved: true },
            { new: true }
        );
        res.json({ success: true, profile });
    } catch (err) {
        next(err);
    }
};

// POST /api/diet/log
const logFood = async (req, res, next) => {
    try {
        const { mealType, name, calories, protein, carbs, fats, targetCalories, date: dateKey, planDay } = req.body;
        const mealTypes = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'snack'];
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const numericValues = [calories, protein, carbs, fats, targetCalories].filter((value) => value !== undefined && value !== null && value !== '');
        if (!mealTypes.includes(mealType) || typeof name !== 'string' || !name.trim() || !Number.isFinite(Number(calories)) || Number(calories) < 0
            || numericValues.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) {
            return res.status(400).json({ success: false, message: 'Enter a valid meal type, description, and non-negative calorie amount.' });
        }
        if (dateKey && !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            return res.status(400).json({ success: false, message: 'Meal log date must use YYYY-MM-DD format.' });
        }
        if (planDay && !weekDays.includes(planDay)) {
            return res.status(400).json({ success: false, message: 'Meal plan day must be a weekday.' });
        }

        const logDate = dateKey ? new Date(`${dateKey}T00:00:00.000Z`) : new Date();
        if (Number.isNaN(logDate.getTime()) || (dateKey && logDate.toISOString().slice(0, 10) !== dateKey)) {
            return res.status(400).json({ success: false, message: 'Meal log date is invalid.' });
        }
        if (!dateKey) logDate.setUTCHours(0, 0, 0, 0);
        const nextDay = new Date(logDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        let foodLog = await FoodLog.findOne({ userId: req.user._id, date: { $gte: logDate, $lt: nextDay } });
        if (!foodLog) {
            foodLog = new FoodLog({ userId: req.user._id, date: logDate, entries: [], targetCalories });
        }
        foodLog.entries.push({ mealType, name: name.trim(), calories, protein, carbs, fats, planDay });
        foodLog.totalCalories = foodLog.entries.reduce((sum, e) => sum + (e.calories || 0), 0);
        foodLog.totalProtein = foodLog.entries.reduce((sum, e) => sum + (e.protein || 0), 0);
        foodLog.totalCarbs = foodLog.entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
        foodLog.totalFats = foodLog.entries.reduce((sum, e) => sum + (e.fats || 0), 0);
        await foodLog.save();

        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        const recentLogs = await FoodLog.countDocuments({ userId: req.user._id, date: { $gte: weekAgo } });
        if (recentLogs >= 7) {
            const user = await User.findById(req.user._id);
            if (!user.badges.some(b => b.badgeId === 'diet_7day')) {
                user.badges.push({ badgeId: 'diet_7day' });
                await user.save();
            }
        }

        await StatsService.triggerRefresh(req.user._id);
        res.status(201).json({ success: true, foodLog });
    } catch (err) {
        next(err);
    }
};

// GET /api/diet/log
const getFoodLog = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const filter = { userId: req.user._id };
        if (from || to) {
            filter.date = {};
            if (from) {
                filter.date.$gte = new Date(from);
                if (Number.isNaN(filter.date.$gte.getTime())) {
                    return res.status(400).json({ success: false, message: 'Start date must be a valid date.' });
                }
            }
            if (to) {
                filter.date.$lte = new Date(to);
                if (Number.isNaN(filter.date.$lte.getTime())) {
                    return res.status(400).json({ success: false, message: 'End date must be a valid date.' });
                }
            }
            if (filter.date.$gte && filter.date.$lte < filter.date.$gte) {
                return res.status(400).json({ success: false, message: 'End date must not be before start date.' });
            }
        }
        const logs = await FoodLog.find(filter).sort('-date').limit(30);
        res.json({ success: true, logs });
    } catch (err) {
        next(err);
    }
};

module.exports = { generateDiet, getDiet, swapMeal, savePlan, logFood, getFoodLog };

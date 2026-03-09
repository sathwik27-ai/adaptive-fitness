const DietProfile = require('../models/DietProfile');
const FoodLog = require('../models/FoodLog');
const User = require('../models/User');
const {
    calculateBMR, calculateTDEE, adjustCalories, calculateMacros,
    generateWeeklyPlan,
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

        // Check if plan exists for this week and is not forced
        let profile = await DietProfile.findOne({ userId: req.user._id });
        if (profile && profile.weekNumber === currentWeek && !req.query.force) {
            return res.json({ success: true, profile, message: "Using existing plan for this week." });
        }

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
                    weeklyPlan = parsed.weeklyPlan;
                    aiReasoning = parsed.reasoning;
                }
            } catch (e) { console.warn("HF JSON Parse failed, falling back to template."); }
        }

        if (!weeklyPlan) {
            // Fallback to basic variation logic if AI fails
            weeklyPlan = await generateWeeklyPlan({ dietType, dailyCalorieTarget: calorieTarget });
            // Map legacy weekly plan to new structured format
            weeklyPlan = weeklyPlan.map(day => ({
                ...day,
                meals: day.meals.map(m => ({
                    mealType: m.mealSlot || 'lunch',
                    primaryOption: {
                        title: m.name,
                        calories: m.calories,
                        protein: m.protein,
                        carbs: m.carbs,
                        fats: m.fats,
                        ingredients: (m.ingredients || []).map(i => ({ name: i, quantity: "As per target" })),
                        instructions: m.instructions
                    },
                    alternativeOptions: [],
                    selectedOptionIndex: 0
                }))
            }));
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

        const day = profile.weeklyPlan[dayIndex];
        if (!day || !day.meals[mealIndex]) return res.status(400).json({ success: false, message: 'Invalid meal' });

        day.meals[mealIndex].selectedOptionIndex = selectedOptionIndex;

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
        const { mealType, name, calories, protein, carbs, fats, targetCalories } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let foodLog = await FoodLog.findOne({ userId: req.user._id, date: { $gte: today } });
        if (!foodLog) {
            foodLog = new FoodLog({ userId: req.user._id, date: new Date(), entries: [], targetCalories });
        }
        foodLog.entries.push({ mealType, name, calories, protein, carbs, fats });
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
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
        const logs = await FoodLog.find(filter).sort('-date').limit(30);
        res.json({ success: true, logs });
    } catch (err) {
        next(err);
    }
};

module.exports = { generateDiet, getDiet, swapMeal, savePlan, logFood, getFoodLog };

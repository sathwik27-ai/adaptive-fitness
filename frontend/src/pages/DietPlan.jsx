import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    useGenerateDietMutation, useGetDietQuery, useSwapMealMutation, useSaveDietMutation,
    useLogFoodMutation, useGetFoodLogsQuery, useGetStatsQuery
} from '../services/apiSlice';
import MealCard from '../components/ui/MealCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import {
    Sun, Moon, Apple, Coffee, Sparkles,
    Target, Activity, Flame, PieChart as PieIcon, Edit3,
    Download, ChevronRight, Info, AlertCircle, Bookmark, BookmarkCheck
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';

const dietSchema = z.object({
    dietType: z.enum(['veg', 'non-veg', 'vegan', 'keto', 'paleo']),
    goal: z.enum(['weight-loss', 'muscle-gain', 'maintenance']),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
    region: z.string().optional(),
    dailyCalorieTarget: z.coerce.number().min(800).max(10000).optional(),
    budget: z.enum(['low', 'medium', 'high']),
});

const MEAL_TYPES = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
const SECTION_LABELS = {
    breakfast: <span className="flex items-center gap-2 text-orange-600"><Coffee size={18} /> Breakfast</span>,
    morning_snack: <span className="flex items-center gap-2 text-yellow-600"><Apple size={18} /> Morning Snack</span>,
    lunch: <span className="flex items-center gap-2 text-blue-600"><Sun size={18} /> Lunch</span>,
    afternoon_snack: <span className="flex items-center gap-2 text-indigo-600"><Apple size={18} /> Afternoon Snack</span>,
    dinner: <span className="flex items-center gap-2 text-purple-600"><Moon size={18} /> Dinner</span>
};

const PIE_COLORS = ['#2F5D3A', '#E59A3A', '#8C6FAE'];

export default function DietPlan() {
    const { data: dietData, isLoading: dietLoading } = useGetDietQuery();
    const [generate, { isLoading: isGenerating }] = useGenerateDietMutation();
    const [swapMeal] = useSwapMealMutation();
    const [logFood] = useLogFoodMutation();
    const { data: logsData } = useGetFoodLogsQuery({});
    const { data: statsData } = useGetStatsQuery();

    const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const [showForm, setShowForm] = useState(false);
    const [logEntry, setLogEntry] = useState({ mealType: 'breakfast', name: '', calories: '', protein: '', carbs: '', fats: '' });

    const [saveDiet, { isLoading: isSaving }] = useSaveDietMutation();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(dietSchema),
        values: dietData?.profile || {
            dietType: 'veg',
            goal: 'weight-loss',
            activityLevel: 'moderate',
            budget: 'medium',
            dailyCalorieTarget: 2000
        }
    });

    const profile = dietData?.profile;
    const weeklyPlan = profile?.weeklyPlan || [];
    const currentDayPlan = weeklyPlan && activeDay >= 0 && activeDay < weeklyPlan.length ? weeklyPlan[activeDay] : null;
    const target = profile?.dailyCalorieTarget || 2000;

    const todayLog = logsData?.logs?.[0]; // Assume today's log is first
    const consumed = todayLog?.totalCalories || 0;
    const actualMacros = {
        protein: todayLog?.totalProtein || 0,
        carbs: todayLog?.totalCarbs || 0,
        fats: todayLog?.totalFats || 0
    };

    const macroCompareData = useMemo(() => {
        if (!profile?.macroTargets) return [];
        const { protein, carbs, fats } = profile.macroTargets;
        return [
            { name: 'Protein', target: protein, actual: actualMacros.protein },
            { name: 'Carbs', target: carbs, actual: actualMacros.carbs },
            { name: 'Fats', target: fats, actual: actualMacros.fats },
        ];
    }, [profile, actualMacros]);

    useEffect(() => {
        if (!dietLoading && !profile) setShowForm(true);
    }, [dietLoading, profile]);

    const onSubmit = async (data) => {
        try {
            await generate(data).unwrap();
            setShowForm(false);
        } catch (err) {
            console.error('Generation failed', err);
        }
    };

    const handleSwap = async (mealIndex) => {
        if (!currentDayPlan || !currentDayPlan.meals[mealIndex]) return;
        const meal = currentDayPlan.meals[mealIndex];
        const currentIdx = meal.selectedOptionIndex || 0;
        const totalOptions = (meal.alternativeOptions?.length || 0) + 1;
        const nextIndex = (currentIdx + 1) % totalOptions;

        try {
            await swapMeal({ dayIndex: activeDay, mealIndex, selectedOptionIndex: nextIndex }).unwrap();
        } catch (err) {
            console.error('Swap failed', err);
        }
    };

    const handleSavePlan = async () => {
        if (profile?.saved) return;
        try {
            await saveDiet().unwrap();
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    const handleLog = async () => {
        if (!logEntry.name || !logEntry.calories) return;
        try {
            await logFood({
                ...logEntry,
                calories: Number(logEntry.calories),
                protein: Number(logEntry.protein || 0),
                carbs: Number(logEntry.carbs || 0),
                fats: Number(logEntry.fats || 0),
                targetCalories: target
            }).unwrap();
            setLogEntry({ mealType: 'breakfast', name: '', calories: '', protein: '', carbs: '', fats: '' });
        } catch (err) {
            console.error('Logging failed', err);
        }
    };

    const adherence = consumed > 0 ? Math.min(Math.round((consumed / target) * 100), 120) : 0;

    if (dietLoading) return <div className="p-10 text-center animate-pulse">Analyzing Nutritional Path...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cta">Nutritional Engine</h1>
                    <p className="text-text-secondary mt-1">Smart, goal-oriented meal planning powered by TDEE logic.</p>
                </div>
                <div className="flex gap-2">
                    {profile && (
                        <Button variant={profile.saved ? "outline" : "primary"} size="sm" onClick={handleSavePlan} disabled={isSaving || profile.saved}>
                            {profile.saved ? <BookmarkCheck size={16} className="mr-2" /> : <Bookmark size={16} className="mr-2" />}
                            {profile.saved ? 'Plan Saved' : 'Save Current Plan'}
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'View Plan' : 'Update Preferences'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.print()}>
                        <Download size={16} className="mr-2" /> PDF Export
                    </Button>
                </div>
            </div>

            {showForm ? (
                <div className="bg-bg-card rounded-card shadow-card p-6 md:p-10 border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                        <Sparkles size={20} /> Tailor Your Diet
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input label="Diet Preference" select options={['veg', 'non-veg', 'vegan', 'keto', 'paleo']} {...register('dietType')} error={errors.dietType?.message} />
                        <Input label="Fitness Goal" select options={['weight-loss', 'muscle-gain', 'maintenance']} {...register('goal')} error={errors.goal?.message} />
                        <Input label="Activity Level" select options={['sedentary', 'light', 'moderate', 'active', 'very-active']} {...register('activityLevel')} error={errors.activityLevel?.message} />
                        <Input label="Regional Cuisine" placeholder="e.g. Indian, Mediterranean" {...register('region')} />
                        <Input label="Calorie Override (Optional)" type="number" {...register('dailyCalorieTarget')} />
                        <Input label="Budget Preference" select options={['low', 'medium', 'high']} {...register('budget')} />
                        <div className="md:col-span-2 lg:col-span-3 pt-4">
                            <Button type="submit" variant="primary" className="w-full" disabled={isGenerating}>
                                {isGenerating ? 'Recalculating...' : 'Generate AI Meal Plan'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : profile ? (
                <>
                    {/* Profile Overview & AI Reasoning */}
                    <div className="bg-bg-card rounded-card shadow-card p-6 md:p-8 border border-bg-surface">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary p-3 rounded-2xl text-white shadow-lg"><Activity size={24} /></div>
                                    <div>
                                        <h2 className="text-2xl font-black text-cta capitalize">{profile.dietType} • {profile.goal?.replace('-', ' ')}</h2>
                                        <p className="text-text-secondary font-medium">Calorie Target: <span className="text-primary font-bold">{target} kcal</span></p>
                                    </div>
                                </div>
                                {profile.reasoning && (
                                    <div className="bg-primary/5 p-4 rounded-card border-l-4 border-primary flex gap-4 text-sm text-text-secondary leading-relaxed">
                                        <Sparkles size={18} className="text-secondary shrink-0 mt-1" />
                                        <p className="italic">"{profile.reasoning}"</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="p-4 bg-bg-surface rounded-xl text-center flex flex-col justify-center border border-bg-surface">
                                    <p className="text-[10px] font-bold text-text-muted uppercase">TDEE</p>
                                    <p className="text-xl font-black text-cta">{profile.tdee || target}</p>
                                </div>
                                <div className="p-4 bg-bg-surface rounded-xl text-center flex flex-col justify-center border border-bg-surface">
                                    <p className="text-[10px] font-bold text-text-muted uppercase">BMR</p>
                                    <p className="text-xl font-black text-cta">{profile.bmr || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macro Tracker & Adherence */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-bg-card rounded-card shadow-card p-6 md:p-8 space-y-6">
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                <PieIcon size={20} /> Today's Adherence
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="h-48 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={macroCompareData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="actual" nameKey="name" paddingAngle={4}>
                                                {macroCompareData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Legend verticalAlign="bottom" align="center" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-2xl font-black text-cta">{adherence}%</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-tight">CALS</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {macroCompareData.map((m, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-text-secondary uppercase">{m.name}</span>
                                                <span className="text-cta">{Math.round(m.actual)} / {m.target}g</span>
                                            </div>
                                            <ProgressBar value={Math.min((m.actual / m.target) * 100, 100)} color={i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : 'bg-accent'} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Food Logging */}
                        <div className="bg-bg-card rounded-card shadow-card p-6 md:p-8 space-y-4 border border-secondary/10">
                            <h3 className="font-bold text-lg text-secondary flex items-center gap-2 underline decoration-secondary/30">
                                <Edit3 size={20} /> Log a Meal
                            </h3>
                            <div className="space-y-3">
                                <Input label="Meal Type" select options={MEAL_TYPES.map(m => m.replace('_', ' '))} value={logEntry.mealType} onChange={e => setLogEntry(p => ({ ...p, mealType: e.target.value.replace(' ', '_') }))} />
                                <Input label="Description" placeholder="e.g. Protein Shake" value={logEntry.name} onChange={e => setLogEntry(p => ({ ...p, name: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input label="Cals" type="number" value={logEntry.calories} onChange={e => setLogEntry(p => ({ ...p, calories: e.target.value }))} />
                                    <Input label="Prot" type="number" value={logEntry.protein} onChange={e => setLogEntry(p => ({ ...p, protein: e.target.value }))} />
                                </div>
                                <Button className="w-full mt-2" variant="green" size="sm" onClick={handleLog}>Log Entry</Button>
                            </div>
                        </div>
                    </div>

                    {/* 7-Day Weekly Navigator */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-xl font-black text-primary flex items-center gap-2 tracking-tight">
                                <Calendar size={20} /> Weekly Nutrition Path
                            </h2>
                            <div className="flex gap-1">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                    <button key={i} onClick={() => setActiveDay(i)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all text-sm
                                        ${activeDay === i ? 'bg-primary text-white shadow-primary/30 shadow-lg scale-110' : 'bg-bg-card hover:bg-bg-surface text-text-muted border border-bg-surface'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {currentDayPlan ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                {MEAL_TYPES.map((type, idx) => {
                                    const mealContainer = currentDayPlan.meals?.[idx];
                                    if (!mealContainer) return null;

                                    const selectedIdx = mealContainer.selectedOptionIndex || 0;
                                    const activeOption = selectedIdx === 0
                                        ? mealContainer.primaryOption
                                        : mealContainer.alternativeOptions?.[selectedIdx - 1];

                                    if (!activeOption) return null;

                                    // Map to a consistent format for MealCard
                                    const mealDisplay = {
                                        ...activeOption,
                                        name: activeOption.title || activeOption.name, // Support both formats
                                        ingredients: activeOption.ingredients?.map(i =>
                                            typeof i === 'string' ? i : `${i.name} (${i.quantity})`
                                        ) || []
                                    };

                                    return (
                                        <div key={type} className="group relative pl-10 pr-10">
                                            <div className="absolute -left-10 top-0 bottom-0 w-1 rounded-full bg-bg-surface transition-all group-hover:bg-primary/30"></div>
                                            <div className="mb-3 px-1 flex justify-between items-center">
                                                {SECTION_LABELS[type]}
                                                {selectedIdx > 0 && (
                                                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase ring-1 ring-secondary/20">
                                                        Alternative {selectedIdx}
                                                    </span>
                                                )}
                                            </div>
                                            <MealCard
                                                meal={mealDisplay}
                                                onSwap={() => handleSwap(idx)}
                                                mealType={type}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-bg-card rounded-card p-20 text-center border-2 border-dashed border-bg-surface">
                                <AlertCircle size={40} className="mx-auto text-text-muted mb-4 opacity-50" />
                                <p className="text-text-muted font-bold">No meal data for this day.</p>
                                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setShowForm(true)}>Relaunch AI Planner</Button>
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

function Calendar(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

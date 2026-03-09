import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateMeMutation } from '../services/apiSlice';
import { setCredentials, selectCurrentUser } from '../features/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import { CheckCircle } from 'lucide-react';

const steps = ['Personal Info', 'Body Metrics', 'Fitness Goals', 'Workout Setup'];

const EQUIPMENT_OPTIONS = [
    'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-Up Bar',
    'Yoga Mat', 'Kettlebell', 'Bench', 'None / Bodyweight',
];
const GENDERS = ['male', 'female', 'non-binary', 'prefer-not'];
const GOALS = ['weight-loss', 'muscle-gain', 'endurance', 'maintenance'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function Onboarding() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const [updateMe] = useUpdateMeMutation();

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [equipment, setEquipment] = useState([]);
    const [done, setDone] = useState(false);

    const schema = [
        z.object({ age: z.coerce.number().min(13).max(100), gender: z.enum(['male', 'female', 'non-binary', 'prefer-not']) }),
        z.object({ height: z.coerce.number().min(100).max(250, 'Height in cm'), weight: z.coerce.number().min(30).max(300, 'Weight in kg') }),
        z.object({ goal: z.enum(['weight-loss', 'muscle-gain', 'endurance', 'maintenance']), fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']) }),
        z.object({ location: z.enum(['home', 'gym']), timePerWorkout: z.coerce.number().min(10).max(180) }),
    ][step];

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({ resolver: zodResolver(schema) });

    const onNext = async (data) => {
        const merged = { ...formData, ...data };
        setFormData(merged);
        if (step < 3) { setStep(s => s + 1); return; }

        // Final step — save to backend
        try {
            const res = await updateMe({
                onboardingComplete: true,
                profile: {
                    age: merged.age, gender: merged.gender,
                    height: merged.height, weight: merged.weight,
                    goal: merged.goal, fitnessLevel: merged.fitnessLevel,
                    location: merged.location, equipment,
                    timePerWorkout: merged.timePerWorkout,
                },
            }).unwrap();
            dispatch(setCredentials(res.user));
            setDone(true);
        } catch { }
    };

    const toggleEquipment = (item) =>
        setEquipment(e => e.includes(item) ? e.filter(x => x !== item) : [...e, item]);

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-main px-4">
                <div className="text-center max-w-sm">
                    <div className="flex justify-center mb-6 animate-bounce">
                        <CheckCircle size={64} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-cta mb-3 flex items-center justify-center gap-2">
                        Your Plan Is Ready!
                    </h2>
                    <p className="text-text-secondary mb-8">We've built your personalized workout and meal plan based on your goals.</p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>Go to Dashboard →</Button>
                </div>
            </div>
        );
    }

    const progress = ((step) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-text-muted mb-2">
                        <span>Step {step + 1} of {steps.length}</span>
                        <span>{steps[step]}</span>
                    </div>
                    <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                    </div>
                </div>

                <div className="bg-bg-card rounded-card shadow-card p-8">
                    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                        {/* Step 1: Personal Info */}
                        {step === 0 && (
                            <>
                                <h2 className="text-2xl font-bold text-cta">Tell us about yourself</h2>
                                <Input label="Age" type="number" error={errors.age?.message} {...register('age')} />
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-secondary">Gender</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {GENDERS.map(g => (
                                            <label key={g} className={`flex items-center gap-2 p-3 rounded-btn border cursor-pointer transition
                        ${watch('gender') === g ? 'border-primary bg-primary/5' : 'border-bg-surface hover:border-accent-light'}`}>
                                                <input type="radio" value={g} {...register('gender')} className="accent-primary" />
                                                <span className="text-sm capitalize text-text-primary">{g.replace('-', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.gender && <p className="text-xs text-red-600">{errors.gender.message}</p>}
                                </div>
                            </>
                        )}

                        {/* Step 2: Body Metrics */}
                        {step === 1 && (
                            <>
                                <h2 className="text-2xl font-bold text-cta">Body metrics</h2>
                                <p className="text-text-secondary text-sm">Help us tailor your plan. This data stays private.</p>
                                <Input label="Height (cm)" type="number" error={errors.height?.message} {...register('height')} />
                                <Input label="Weight (kg)" type="number" error={errors.weight?.message} {...register('weight')} />
                            </>
                        )}

                        {/* Step 3: Fitness Goals */}
                        {step === 2 && (
                            <>
                                <h2 className="text-2xl font-bold text-cta">What's your goal?</h2>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-secondary">Primary Goal</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {GOALS.map(g => (
                                            <label key={g} className={`flex items-center gap-2 p-3 rounded-btn border cursor-pointer transition
                        ${watch('goal') === g ? 'border-primary bg-primary/5' : 'border-bg-surface hover:border-accent-light'}`}>
                                                <input type="radio" value={g} {...register('goal')} className="accent-primary" />
                                                <span className="text-sm capitalize text-text-primary">{g.replace('-', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.goal && <p className="text-xs text-red-600">{errors.goal.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-secondary">Fitness Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {LEVELS.map(l => (
                                            <label key={l} className={`flex items-center justify-center p-3 rounded-btn border cursor-pointer transition
                        ${watch('fitnessLevel') === l ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-bg-surface hover:border-accent-light text-text-secondary'}`}>
                                                <input type="radio" value={l} {...register('fitnessLevel')} className="sr-only" />
                                                <span className="text-sm capitalize">{l}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.fitnessLevel && <p className="text-xs text-red-600">{errors.fitnessLevel.message}</p>}
                                </div>
                            </>
                        )}

                        {/* Step 4: Workout Setup */}
                        {step === 3 && (
                            <>
                                <h2 className="text-2xl font-bold text-cta">Workout setup</h2>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-secondary">Workout Location</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['home', 'gym'].map(loc => (
                                            <label key={loc} className={`flex items-center justify-center p-3 rounded-btn border cursor-pointer transition text-sm
                        ${watch('location') === loc ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-bg-surface hover:border-accent-light text-text-secondary'}`}>
                                                <input type="radio" value={loc} {...register('location')} className="sr-only" />
                                                <span className="capitalize">{loc}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-secondary">Available Equipment (select all that apply)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EQUIPMENT_OPTIONS.map(eq => (
                                            <button
                                                key={eq} type="button"
                                                onClick={() => toggleEquipment(eq)}
                                                className={`px-3 py-1.5 text-sm rounded-full border transition
                          ${equipment.includes(eq) ? 'bg-accent-soft border-primary text-primary font-medium' : 'border-bg-surface text-text-secondary hover:border-accent-light'}`}
                                            >
                                                {eq}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-secondary">
                                        Time per workout: <span className="text-primary font-semibold">{watch('timePerWorkout') || 30} min</span>
                                    </label>
                                    <input type="range" min={10} max={120} step={5}
                                        className="accent-primary w-full"
                                        {...register('timePerWorkout')}
                                        defaultValue={30}
                                    />
                                    <div className="flex justify-between text-xs text-text-muted"><span>10m</span><span>120m</span></div>
                                </div>
                            </>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 pt-2">
                            {step > 0 && (
                                <Button type="button" variant="ghost" size="md" onClick={() => setStep(s => s - 1)}>
                                    ← Back
                                </Button>
                            )}
                            <Button type="submit" variant="primary" size="md" className="flex-1">
                                {step < 3 ? 'Continue →' : <span className="flex items-center gap-2 justify-center">Generate My Plan <CheckCircle size={18} /></span>}
                            </Button>
                            {step < 3 && (
                                <Button type="button" variant="ghost" size="md" onClick={() => setStep(s => s + 1)}>
                                    Skip
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

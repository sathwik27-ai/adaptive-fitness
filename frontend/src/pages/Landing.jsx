import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Dumbbell, Salad, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
    { icon: Dumbbell, title: 'Personalized Workouts', desc: 'AI-powered plans built around your equipment, level, and goals.' },
    { icon: Salad, title: 'Smart Meal Plans', desc: 'Budget-aware nutrition matched to your diet type and region.' },
    { icon: TrendingUp, title: 'Track Your Progress', desc: 'Visual charts and milestone badges keep you motivated daily.' },
];
const stats = [
    { value: '20+', label: 'Workout Programs' },
    { value: '50+', label: 'Meal Options' },
    { value: '4', label: 'Onboarding Steps' },
    { value: '∞', label: 'Adaptations' },
];

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero */}
            <section className="relative flex-1 flex items-center justify-center text-center px-4 py-24 overflow-hidden bg-gradient-to-br from-bg-main via-bg-secondary to-bg-main">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-chart-orange blur-3xl" />
                </div>

                <div className="relative max-w-3xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <span className="flex items-center gap-2 bg-accent-soft/30 text-primary text-sm font-semibold px-4 py-2 rounded-full border border-accent-soft">
                            <Leaf size={16} /> Earthy · Personal · Adaptive
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-cta mb-6 leading-tight">
                        Your fitness,<br />
                        <span className="text-primary">finally personal.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl mx-auto">
                        Adaptive Fitness Companion builds workouts and meal plans around your real life — equipment, budget, goals, and schedule.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button variant="primary" size="lg" className="group">
                                Start Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="ghost" size="lg">Log In</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-primary py-10 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {stats.map(s => (
                        <div key={s.label}>
                            <p className="text-3xl font-extrabold text-text-on-dark">{s.value}</p>
                            <p className="text-accent-soft text-sm mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 bg-bg-secondary">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">Everything you need to stay consistent</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-bg-card rounded-card shadow-card p-8 flex flex-col items-start gap-4 hover:shadow-lg transition-shadow">
                                <div className="p-3 bg-primary/10 rounded-xl"><Icon size={26} className="text-primary" /></div>
                                <h3 className="text-xl font-semibold text-cta">{title}</h3>
                                <p className="text-text-secondary">{desc}</p>
                                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-auto">
                                    <CheckCircle size={14} /> Included in free tier
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 bg-bg-main text-center">
                <h2 className="text-3xl font-bold text-cta mb-4">Ready to start your journey?</h2>
                <p className="text-text-secondary mb-8">Complete a 4-step onboarding and your first plan is ready in seconds.</p>
                <Link to="/register"><Button variant="green" size="lg">Get Your Plan Now</Button></Link>
            </section>

            {/* Footer */}
            <footer className="py-6 px-4 bg-bg-secondary border-t border-bg-surface text-center text-text-muted text-sm flex items-center justify-center gap-2">
                <Leaf size={14} className="text-primary" /> © 2026 Adaptive Fitness Companion · Built with care for your wellness
            </footer>
        </div>
    );
}

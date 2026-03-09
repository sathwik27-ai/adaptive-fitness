import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCurrentUser } from '../features/authSlice';
import { useGetStatsQuery, useGetInsightsQuery, useGetWorkoutsQuery, useRefreshStatsMutation, useSyncHealthMutation, useGetGoogleFitAuthQuery } from '../services/apiSlice';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import SpotifyMood from '../components/SpotifyMood';
import { Flame, Footprints, Clock, Trophy, Dumbbell, Bookmark, Sparkles, Brain, RefreshCcw, Activity } from 'lucide-react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function Dashboard() {
    const user = useSelector(selectCurrentUser);
    const { data: statsData, isLoading: statsLoading } = useGetStatsQuery();
    const { data: insightData } = useGetInsightsQuery();
    const [refreshStats, { isLoading: refreshing }] = useRefreshStatsMutation();
    const [syncHealth, { isLoading: syncing }] = useSyncHealthMutation();
    const { data: authData } = useGetGoogleFitAuthQuery(undefined, { skip: !!user?.googleFitTokens?.refreshToken });

    const stats = statsData?.stats || {};
    const insights = insightData?.insights || [];

    const handleConnectGoogleFit = () => {
        if (authData?.url) window.location.href = authData.url;
    };

    // Today's Recommendation
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayPlan = user?.workoutPlan?.schedule?.[today];
    const fitnessLevel = user?.profile?.fitnessLevel || 'beginner';

    const { data: recommendations } = useGetWorkoutsQuery({
        type: todayPlan?.rest ? '' : todayPlan?.type || '',
        level: fitnessLevel,
    }, { skip: !todayPlan });

    const recommendedWorkout = recommendations?.workouts?.[0];

    useEffect(() => {
        // Refresh stats on first mount if they seem empty
        if (!statsLoading && !stats.totalWorkouts && stats.totalWorkouts !== 0) {
            refreshStats();
        }
    }, [statsLoading, stats.totalWorkouts, refreshStats]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Greeting & Refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-cta flex items-center gap-2">
                        Welcome back, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-text-secondary mt-1">Here is your AI-integrated performance overview.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!user?.googleFitTokens?.refreshToken ? (
                        <Button variant="green" size="sm" onClick={handleConnectGoogleFit} className="shadow-sm">
                            <Activity size={16} className="mr-2" />
                            Connect Google Fit
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => syncHealth()} disabled={syncing} className="shadow-sm">
                            <RefreshCcw size={16} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                            Sync Health
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshStats()}
                        disabled={refreshing}
                        className="w-fit"
                    >
                        <RefreshCcw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Stats
                    </Button>
                </div>
            </div>

            {/* AI Insights Panel */}
            {insights.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-card p-4 md:p-6 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-primary/10 p-3 rounded-full h-fit w-fit">
                        <Brain className="text-primary" size={24} />
                    </div>
                    <div className="flex-1 space-y-3">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                            AI Coaching Insights
                            {/* { <Badge variant="blue" className="text-[10px] py-0">Powered by Hugging Face</Badge>} */}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="bg-white/50 p-3 rounded-lg text-sm text-text-secondary border border-primary/10 flex gap-3">
                                    <Sparkles size={16} className="text-secondary shrink-0 mt-0.5" />
                                    <p>{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <section aria-label="Performance metrics">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard icon={Flame} value={stats.totalCaloriesBurned || 0} label="Total Calories" unit="kcal" />
                    <StatCard icon={Footprints} value={stats.totalSteps || 0} label="Total Steps" unit="" />
                    <StatCard icon={Activity} value={stats.avgHeartRate || 0} label="Avg BPM" unit="bpm" color="text-red-500" />
                    <StatCard icon={Trophy} value={stats.currentStreak || 0} label="Current Streak" unit="days" color="text-orange-500" />
                    <StatCard icon={Activity} value={stats.avgPostureScore || 100} label="Avg Posture" unit="%" color="text-blue-500" />
                </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Weekly Chart */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-primary">Biometric Performance</h2>
                    <div className="bg-bg-card rounded-card shadow-card p-4 md:p-6 h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={stats.weeklyCalories || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCCB" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: '#F4EFE6', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="calories" name="Kcal" fill="#E59A3A" radius={[4, 4, 0, 0]} barSize={25} />
                                <Line type="monotone" dataKey="calories" stroke="#2F5D3A" strokeWidth={2} dot={{ r: 4, fill: '#2F5D3A' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spotify Mood Player */}
                <SpotifyMood />
            </div>

            {/* Quick Actions Navigation */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { to: '/workouts', label: 'Workouts', icon: <Dumbbell size={20} />, desc: 'Browse routines' },
                    { to: '/diet', label: 'Diet Plan', icon: <Clock size={20} />, desc: 'Nutritional path' },
                    { to: '/progress', label: 'Analytics', icon: <Trophy size={20} />, desc: 'Performance stats' },
                    { to: '/posture', label: 'Posture AI', icon: <Activity size={20} />, desc: 'Live check' },
                ].map(item => (
                    <Link key={item.to} to={item.to}
                        className="bg-bg-card rounded-card shadow-card p-5 hover:shadow-lg hover:border-primary/20 border border-transparent transition group flex flex-col items-center">
                        <div className="bg-bg-surface p-3 rounded-full mb-3 group-hover:bg-primary/10 transition">
                            <span className="text-primary">{item.icon}</span>
                        </div>
                        <p className="font-semibold text-cta group-hover:text-primary transition">{item.label}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
                    </Link>
                ))}
            </section>
        </div>
    );
}

// Sub-component Badge for AI label
function Badge({ children, variant = "default", className = "" }) {
    const variants = {
        default: "bg-bg-surface text-text-secondary",
        blue: "bg-blue-100 text-blue-700",
        primary: "bg-primary/20 text-primary"
    };
    return (
        <span className={`px-2 py-0.5 rounded-full font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

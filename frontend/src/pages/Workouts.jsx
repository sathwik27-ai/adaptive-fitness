import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetWorkoutsQuery } from '../services/apiSlice';
import { selectCurrentUser } from '../features/authSlice';
import WorkoutCard from '../components/ui/WorkoutCard';
import FilterChip from '../components/ui/FilterChip';
import Input from '../components/ui/Input';
import { Search, Sparkles, Dumbbell, Coffee, Sun, Moon, Apple, Edit3 } from 'lucide-react';

const FILTERS = ['All', 'Strength', 'Cardio', 'Yoga', 'HIIT', 'Flexibility'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const GOAL_TYPE_MAP = {
    'weight-loss': ['cardio', 'hiit'],
    'muscle-gain': ['strength'],
    'endurance': ['cardio', 'hiit'],
    'maintenance': ['strength', 'yoga', 'flexibility']
};

export default function Workouts() {
    const user = useSelector(selectCurrentUser);
    const [search, setSearch] = useState('');
    const [active, setActive] = useState('All');
    const [level, setLevel] = useState('All');
    const [forYou, setForYou] = useState(false);

    const params = {};
    if (active !== 'All') params.type = active.toLowerCase();
    if (level !== 'All') params.level = level.toLowerCase();
    if (search.trim()) params.search = search;

    const { data: rawData, isLoading, isError } = useGetWorkoutsQuery(params);
    const savedIds = user?.savedWorkouts?.map(w => w._id || w) || [];

    // Filter by 'For You' if active
    const data = useMemo(() => {
        if (!forYou || !rawData?.workouts) return rawData;

        const filtered = rawData.workouts.filter(w => {
            const matchesLevel = w.level === user?.profile?.fitnessLevel;
            const matchesGoal = GOAL_TYPE_MAP[user?.profile?.goal]?.includes(w.type);
            return matchesLevel || matchesGoal;
        });

        return { ...rawData, workouts: filtered, count: filtered.length };
    }, [rawData, forYou, user?.profile]);

    const recommendedWorkouts = useMemo(() => {
        if (!rawData?.workouts || !user?.profile) return [];

        return rawData.workouts.filter(w => {
            const matchesLevel = w.level === user.profile.fitnessLevel;
            const matchesGoal = GOAL_TYPE_MAP[user.profile.goal]?.includes(w.type);
            const userEquip = user.profile.equipment?.map(e => e.toLowerCase()) || [];
            const matchesEquip = w.equipment?.length === 0 ||
                w.equipment?.every(e => userEquip.includes(e.toLowerCase()));

            return matchesLevel && matchesGoal && matchesEquip;
        }).slice(0, 3);
    }, [rawData, user?.profile]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-cta">Workout Library</h1>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search workouts…"
                    className="w-full pl-10 pr-4 py-3 rounded-btn bg-bg-card border border-bg-surface text-text-primary
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
                    aria-label="Search workouts"
                />
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter workouts by type">
                {FILTERS.map(f => (
                    <FilterChip key={f} label={f} active={active === f} onClick={() => setActive(f)} />
                ))}
            </div>
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter workouts by difficulty">
                {LEVELS.map(l => (
                    <FilterChip key={l} label={l} active={level === l} onClick={() => setLevel(l)} />
                ))}
            </div>

            {/* Smart Toggle */}
            <div className="flex items-center justify-between bg-bg-card p-4 rounded-card border border-bg-surface">
                <div>
                    <h3 className="font-bold text-cta flex items-center gap-2">
                        <Sparkles size={16} className="text-primary" /> Personalized Feed
                    </h3>
                    <p className="text-xs text-text-muted">Show workouts matching your level and goals</p>
                </div>
                <button
                    onClick={() => setForYou(!forYou)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${forYou ? 'bg-primary' : 'bg-bg-surface'}`}
                    role="switch" aria-checked={forYou}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${forYou ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Recommended Section */}
            {!search && active === 'All' && !forYou && recommendedWorkouts.length > 0 && (
                <section className="bg-primary/5 rounded-card p-6 border border-primary/10">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <Sparkles size={20} />
                        <h2 className="text-xl font-bold text-cta">Perfect for Your Plan</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedWorkouts.map(workout => (
                            <div key={`rec-${workout._id}`} className="relative">
                                <span className="absolute -top-2 -right-2 z-10 bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg border-2 border-white animate-pulse">
                                    Target Match
                                </span>
                                <WorkoutCard
                                    workout={workout}
                                    isSaved={savedIds.includes(workout._id)}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Grid */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-bg-card rounded-card animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-card p-6 text-red-700">
                    Failed to load workouts. Please refresh the page.
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    <p className="text-sm text-text-muted">{data?.count || 0} workouts found</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.workouts?.map(workout => (
                            <WorkoutCard
                                key={workout._id}
                                workout={workout}
                                isSaved={savedIds.includes(workout._id)}
                            />
                        ))}
                    </div>
                    {data?.workouts?.length === 0 && (
                        <div className="text-center py-16 text-text-muted">
                            <div className="flex justify-center mb-4">
                                <Dumbbell size={48} className="text-bg-surface" />
                            </div>
                            <p className="text-lg font-medium">No workouts match your filters.</p>
                            <p className="text-sm">Try adjusting the search or filter chips.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

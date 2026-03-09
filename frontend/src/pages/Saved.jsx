import React, { useState } from 'react';
import { useGetMeQuery } from '../services/apiSlice';
import WorkoutCard from '../components/ui/WorkoutCard';
import MealCard from '../components/ui/MealCard';
import { Bookmark } from 'lucide-react';

const TABS = ['Workouts', 'Meals'];

export default function Saved() {
    const [activeTab, setActiveTab] = useState('Workouts');
    const { data } = useGetMeQuery();
    const user = data?.user;
    const savedWorkouts = user?.savedWorkouts || [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-cta">Saved</h1>

            {/* Tabs */}
            <div className="flex gap-2" role="tablist" aria-label="Saved content tabs">
                {TABS.map(tab => (
                    <button key={tab} role="tab" aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-btn text-sm font-medium transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
              ${activeTab === tab ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-surface border border-bg-surface'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Workouts tab */}
            {activeTab === 'Workouts' && (
                <div role="tabpanel">
                    {savedWorkouts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedWorkouts.map(workout => (
                                <WorkoutCard key={workout._id} workout={workout} isSaved />
                            ))}
                        </div>
                    ) : (
                        <EmptyState label="workouts" />
                    )}
                </div>
            )}

            {/* Meals tab */}
            {activeTab === 'Meals' && (
                <div role="tabpanel">
                    {(user?.savedMeals || []).length === 0 ? (
                        <EmptyState label="meals" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.savedMeals.map(meal => (
                                <MealCard key={meal._id} meal={meal} isSaved />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Articles tab */}
            {activeTab === 'Articles' && (
                <div role="tabpanel">
                    <EmptyState label="articles" />
                </div>
            )}
        </div>
    );
}

function EmptyState({ label }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bookmark size={48} className="text-text-muted mb-4 opacity-40" />
            <p className="text-lg font-medium text-text-secondary">Nothing saved yet</p>
            <p className="text-sm text-text-muted mt-2">Bookmark {label} to find them here quickly.</p>
        </div>
    );
}

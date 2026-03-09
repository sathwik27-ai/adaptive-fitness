import React, { useState } from 'react';
import { useGetWorkoutLogsQuery } from '../services/apiSlice';
import Badge from '../components/ui/Badge';
import { Clock, Flame, Calendar, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const levelColor = { beginner: 'green', intermediate: 'orange', advanced: 'purple' };

export default function WorkoutHistory() {
    const { data, isLoading } = useGetWorkoutLogsQuery();
    const logs = data?.logs || [];
    const [expandedId, setExpandedId] = useState(null);

    if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">Loading history…</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-cta">Workout History</h1>
                <Badge color="muted">{logs.length} session{logs.length !== 1 ? 's' : ''}</Badge>
            </div>

            {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Dumbbell size={48} className="text-text-muted mb-4 opacity-40" />
                    <p className="text-lg font-medium text-text-secondary">No workouts logged yet</p>
                    <p className="text-sm text-text-muted mt-2">Complete a workout to see your history here.</p>
                    <Link to="/workouts" className="mt-4 text-primary font-semibold hover:underline">Browse Workouts →</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map(log => {
                        const w = log.workoutId;
                        const expanded = expandedId === log._id;
                        return (
                            <div key={log._id} className="bg-bg-card rounded-card shadow-card overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(expanded ? null : log._id)}
                                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-bg-surface/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    {/* Thumbnail */}
                                    {w?.thumbnail && (
                                        <img src={w.thumbnail} alt={w?.title} className="w-14 h-14 rounded-btn object-cover shrink-0 hidden sm:block" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-cta truncate">{w?.title || 'Deleted workout'}</h3>
                                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(log.completedAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} />{log.durationMins} min</span>
                                            {log.caloriesBurned > 0 && <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" />{log.caloriesBurned} kcal</span>}
                                        </div>
                                    </div>
                                    {w?.type && <Badge color="muted" className="shrink-0 hidden sm:inline-flex">{w.type}</Badge>}
                                    {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                                </button>

                                {expanded && (
                                    <div className="px-4 pb-4 border-t border-bg-surface pt-3 space-y-2">
                                        {log.exercises?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-text-secondary">Exercises completed:</p>
                                                {log.exercises.map((ex, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm text-text-secondary bg-bg-secondary rounded-btn px-3 py-1.5">
                                                        <span>{ex.exerciseName}</span>
                                                        <span className="text-xs text-text-muted">{ex.setsCompleted}×{ex.repsCompleted}{ex.weightKg ? ` @ ${ex.weightKg}kg` : ''}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {log.notes && <p className="text-sm text-text-muted italic">"{log.notes}"</p>}
                                        <Link to={`/workouts/${w?._id}`} className="text-sm text-primary font-semibold hover:underline inline-block mt-1">
                                            View Workout →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

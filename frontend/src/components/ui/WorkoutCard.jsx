import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToggleSavedMutation } from '../../services/apiSlice';
import Badge from './Badge';
import Button from './Button';
import { Bookmark, BookmarkCheck, Clock, Dumbbell, Flame } from 'lucide-react';

const levelColor = { beginner: 'green', intermediate: 'orange', advanced: 'purple' };

export default function WorkoutCard({ workout, onStart, isSaved = false }) {
    const navigate = useNavigate();
    const [toggleSaved] = useToggleSavedMutation();

    const handleSave = async (e) => {
        e.stopPropagation();
        await toggleSaved({ type: 'workout', id: workout._id });
    };

    const handleClick = () => {
        navigate(`/workouts/${workout._id}`);
    };

    const handleStart = (e) => {
        e.stopPropagation();
        const defaultMins = workout.duration || 30;
        const input = prompt(`Enter preferred workout duration in minutes (5-120):`, defaultMins);

        if (input === null) return; // User cancelled

        let mins = parseInt(input);
        if (isNaN(mins) || input.trim() === "") {
            mins = defaultMins;
        }

        if (mins < 5 || mins > 120) {
            alert("Please enter a duration between 5 and 120 minutes.");
            return;
        }

        navigate(`/workouts/${workout._id}`, { state: { autoStart: true, customDuration: mins } });
    };

    return (
        <article
            onClick={handleClick}
            className="bg-bg-card rounded-card shadow-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
            aria-label={`${workout.title} workout`}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-bg-surface">
                <img
                    src={workout.thumbnail || `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400`}
                    alt={workout.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                    onClick={handleSave}
                    aria-label={isSaved ? 'Remove bookmark' : 'Save workout'}
                    className="absolute top-2 right-2 p-2 rounded-full bg-bg-card/80 hover:bg-bg-card transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {isSaved
                        ? <BookmarkCheck size={18} className="text-primary" />
                        : <Bookmark size={18} className="text-text-muted" />
                    }
                </button>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-semibold text-text-primary line-clamp-1">{workout.title}</h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge color={levelColor[workout.level] || 'muted'}>{workout.level}</Badge>
                    <Badge color="muted">{workout.type}</Badge>
                    {workout.targetMuscles?.slice(0, 2).map(m => (
                        <Badge key={m} color="blue" className="capitalize">{m}</Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 text-text-secondary text-xs">
                            <span className="flex items-center gap-1"><Clock size={12} className="text-primary" />{workout.duration} min</span>
                            <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" />{workout.calories || Math.floor(workout.duration * 8)} kcal</span>
                            {workout.equipment?.length > 0 && (
                                <span className="flex items-center gap-1"><Dumbbell size={12} className="text-primary" />{workout.equipment[0]}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    <Button variant="green" size="sm" className="w-full" onClick={handleStart}>
                        Start Workout
                    </Button>
                </div>
            </div>
        </article>
    );
}

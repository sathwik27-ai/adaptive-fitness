import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useGetWorkoutQuery, useLogWorkoutMutation } from '../services/apiSlice';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SessionTimer from '../components/workout/SessionTimer';
import Modal from '../components/ui/Modal';
import { ArrowLeft, Clock, Dumbbell, CheckCircle2, AlertTriangle, Play, Sparkles } from 'lucide-react';

const levelColor = { beginner: 'green', intermediate: 'orange', advanced: 'purple' };

export default function WorkoutDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { data, isLoading, isError } = useGetWorkoutQuery(id);
    const [logWorkout] = useLogWorkoutMutation();
    const [sessionActive, setSessionActive] = useState(false);
    const [doneModal, setDoneModal] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    const workout = data?.workout;

    React.useEffect(() => {
        if (location.state?.autoStart) {
            setSessionDuration(location.state.customDuration);
            setSessionActive(true);
            // Clear state to avoid re-triggering on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleStartWorkout = () => {
        const defaultMins = workout?.duration || 30;
        const input = prompt(`Enter preferred workout duration in minutes (5-120):`, defaultMins);

        if (input === null) return; // User cancelled prompt

        let mins = parseInt(input);
        if (isNaN(mins) || input.trim() === "") {
            mins = defaultMins;
        }

        if (mins < 5 || mins > 120) {
            alert("Please enter a duration between 5 and 120 minutes.");
            return;
        }

        setSessionDuration(mins);
        setSessionActive(true);
    };

    const handleComplete = async () => {
        try {
            const activeDuration = sessionDuration || workout?.duration || 30;
            const totalSeconds = activeDuration * 60;
            const elapsedSeconds = totalSeconds - remainingSeconds;
            const actualDurationMins = Math.floor(elapsedSeconds / 60);

            // Save actual duration (minimum 1 min if they spent any time)
            const durationToSave = elapsedSeconds > 0 ? Math.max(1, actualDurationMins) : 0;

            await logWorkout({
                workoutId: id,
                durationMins: durationToSave,
                caloriesBurned: Math.floor(durationToSave * 8),
            }).unwrap();
        } catch { }
        setSessionActive(false);
        setDoneModal(true);
    };

    if (isLoading) return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-bg-card rounded-card animate-pulse" />)}
        </div>
    );
    if (isError || !workout) return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted">
            <div className="flex justify-center mb-4"><AlertTriangle size={48} className="text-bg-surface" /></div>
            <p>Workout not found.</p>
            <Button variant="ghost" onClick={() => navigate('/workouts')}>← Back to library</Button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb">
                <Link to="/workouts" className="flex items-center gap-1 text-text-muted text-sm hover:text-primary transition">
                    <ArrowLeft size={14} /> Back to Workouts
                </Link>
            </nav>

            {/* Hero image */}
            <div className="aspect-video rounded-card overflow-hidden bg-bg-surface">
                <img src={workout.thumbnail} alt={workout.title} className="w-full h-full object-cover" />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                    <Badge color={levelColor[workout.level] || 'muted'}>{workout.level}</Badge>
                    <Badge color="muted">{workout.type}</Badge>
                    {workout.targetMuscles?.map(m => (
                        <Badge key={m} color="blue" className="capitalize flex items-center gap-1">
                            {m}
                        </Badge>
                    ))}
                    {workout.tags?.map(t => (
                        <Badge key={t} color="muted" className="capitalize">#{t}</Badge>
                    ))}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-cta pt-2">{workout.title}</h1>
                <div className="flex items-center gap-4 text-text-secondary text-sm">
                    <span className="flex items-center gap-1"><Clock size={14} />{workout.duration} min</span>
                    {workout.equipment?.length > 0 && (
                        <span className="flex items-center gap-1"><Dumbbell size={14} />{workout.equipment.join(', ')}</span>
                    )}
                </div>
            </div>

            {/* Session Timer (when active) */}
            {sessionActive && (
                <div className="bg-bg-card rounded-card shadow-card p-6 flex flex-col items-center gap-4">
                    <h2 className="text-lg font-semibold text-primary">Session In Progress</h2>
                    <SessionTimer
                        duration={sessionDuration || workout.duration}
                        onComplete={handleComplete}
                        onTick={(secs) => setRemainingSeconds(secs)}
                    />
                    <Button variant="danger" size="sm" onClick={handleComplete}>End Session</Button>
                </div>
            )}

            {/* Start button */}
            {!sessionActive && (
                <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleStartWorkout}>
                    <Play size={20} /> Start Workout
                </Button>
            )}

            {/* Exercise list */}
            <section>
                <h2 className="text-xl font-semibold text-primary mb-4">Exercise List</h2>
                <div className="space-y-4">
                    {workout.exercises?.map((ex, idx) => (
                        <div key={idx} className="bg-bg-card rounded-card shadow-card p-4 md:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{ex.name}</h3>
                                        <p className="text-sm text-text-muted">
                                            {ex.sets} sets × {ex.reps} {ex.restSeconds ? `· ${ex.restSeconds}s rest` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {ex.instructions?.length > 0 && (
                                <ol className="mt-3 space-y-1 pl-11">
                                    {ex.instructions.map((inst, i) => (
                                        <li key={i} className="text-sm text-text-secondary list-decimal">{inst}</li>
                                    ))}
                                </ol>
                            )}
                            {ex.mediaUrl && (
                                <div className="mt-3 pl-11">
                                    <img src={ex.mediaUrl} alt={`${ex.name} demo`} className="rounded-btn max-h-40 object-cover" loading="lazy" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Completion Modal */}
            <Modal isOpen={doneModal} onClose={() => setDoneModal(false)} title="Workout Complete!">
                <div className="text-center space-y-4">
                    <CheckCircle2 size={56} className="text-primary mx-auto" />
                    <p className="text-text-secondary">Great job finishing <strong>{workout.title}</strong>! Your stats have been updated.</p>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={() => { setDoneModal(false); navigate('/workouts'); }}>Browse More</Button>
                        <Button variant="green" className="flex-1" onClick={() => { setDoneModal(false); navigate('/progress'); }}>View Progress</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery, useUpdateMeMutation } from '../services/apiSlice';
import { setCredentials, selectCurrentUser } from '../features/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { User, Mail, Target, Dumbbell } from 'lucide-react';

export default function Profile() {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const { data } = useGetMeQuery();
    const user = data?.user || currentUser;
    const [updateMe, { isLoading }] = useUpdateMeMutation();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');

    const handleSave = async () => {
        const res = await updateMe({ name }).unwrap();
        dispatch(setCredentials(res.user));
        setEditing(false);
    };

    const profile = user?.profile || {};
    const goalLabel = profile.goal?.replace('-', ' ') || '–';
    const levelColor = { beginner: 'green', intermediate: 'orange', advanced: 'purple' };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-cta">Profile</h1>

            {/* Avatar + name */}
            <div className="bg-bg-card rounded-card shadow-card p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                    {editing ? (
                        <div className="flex gap-3 items-center">
                            <Input label="" value={name} onChange={e => setName(e.target.value)} className="flex-1" />
                            <Button variant="green" size="sm" onClick={handleSave} disabled={isLoading}>Save</Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-xl font-bold text-cta">{user?.name}</p>
                                <p className="text-sm text-text-muted">{user?.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setName(user?.name || ''); setEditing(true); }}>Edit</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body Stats */}
            <div className="bg-bg-card rounded-card shadow-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-primary">Body Stats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Age', value: profile.age, unit: 'yr' },
                        { label: 'Height', value: profile.height, unit: 'cm' },
                        { label: 'Weight', value: profile.weight, unit: 'kg' },
                        { label: 'Gender', value: profile.gender?.replace('-', ' '), unit: '' },
                    ].map(item => (
                        <div key={item.label} className="bg-bg-secondary rounded-card p-3 text-center">
                            <p className="text-xl font-bold text-primary">{item.value || '–'}<span className="text-sm font-normal text-text-muted ml-0.5">{item.unit}</span></p>
                            <p className="text-xs text-text-muted mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fitness Plan */}
            <div className="bg-bg-card rounded-card shadow-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-primary">Fitness Plan</h2>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Target size={16} className="text-primary" />
                        Goal: <span className="capitalize font-medium text-text-primary">{goalLabel}</span>
                    </div>
                    {profile.fitnessLevel && (
                        <Badge color={levelColor[profile.fitnessLevel] || 'muted'} className="capitalize">{profile.fitnessLevel}</Badge>
                    )}
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Dumbbell size={16} className="text-primary" />
                        Location: <span className="capitalize font-medium text-text-primary">{profile.location || '–'}</span>
                    </div>
                </div>

                {profile.equipment?.length > 0 && (
                    <div>
                        <p className="text-sm text-text-muted mb-2">Equipment</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.equipment.map(eq => <Badge key={eq} color="muted" className="capitalize">{eq}</Badge>)}
                        </div>
                    </div>
                )}

                <p className="text-sm text-text-secondary">Time per workout: <span className="font-medium text-primary">{profile.timePerWorkout || '–'} min</span></p>
            </div>

            <p className="text-xs text-text-muted text-center">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '–'} · Onboarding {user?.onboardingComplete ? 'complete' : 'pending'}
            </p>
        </div>
    );
}

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/authSlice';
import { useGetStatsQuery, useAddProgressMutation } from '../services/apiSlice';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Flame, Trophy, Clock, Activity, TrendingUp, Target, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const TABS = ['Weight', 'Workouts', 'Steps', 'Heart Rate', 'Posture', 'Distribution'];
const PIE_COLORS = ['#2F5D3A', '#E59A3A', '#8C6FAE', '#4ea0b0', '#FF6B6B', '#d9534f'];

export default function Progress() {
    const user = useSelector(selectCurrentUser);
    const [activeTab, setActiveTab] = useState('Weight');
    const [showLogForm, setShowLogForm] = useState(false);
    const [logEntry, setLogEntry] = useState({ weight: '', steps: '', sleepHours: '', caloriesBurned: '' });

    const { data: statsData, isLoading } = useGetStatsQuery();
    const [addProgress] = useAddProgressMutation();

    const stats = statsData?.stats || {};

    const handleLog = async () => {
        const payload = {};
        if (logEntry.weight) payload.weight = Number(logEntry.weight);
        if (logEntry.steps) payload.steps = Number(logEntry.steps);
        if (logEntry.sleepHours) payload.sleepHours = Number(logEntry.sleepHours);
        if (logEntry.caloriesBurned) payload.caloriesBurned = Number(logEntry.caloriesBurned);
        await addProgress(payload).unwrap();
        setLogEntry({ weight: '', steps: '', sleepHours: '', caloriesBurned: '' });
        setShowLogForm(false);
    };

    const chartHeight = 350;
    const CHART_COLORS = { primary: '#2F5D3A', orange: '#E59A3A', purple: '#8C6FAE', blue: '#4F7C63' };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-cta">Analytics & Progress</h1>
                    <p className="text-text-secondary text-sm">Deep insights into your physical evolution.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('Distribution')}>
                        View Mix
                    </Button>
                    <Button variant="green" size="sm" onClick={() => setShowLogForm(s => !s)}>
                        {showLogForm ? 'Close Form' : '+ Log Metrics'}
                    </Button>
                </div>
            </div>

            {/* Log form */}
            {showLogForm && (
                <div className="bg-bg-card rounded-card shadow-card p-6 border border-primary/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <Input label="Weight (kg)" type="number" value={logEntry.weight} onChange={e => setLogEntry(p => ({ ...p, weight: e.target.value }))} />
                    <Input label="Steps" type="number" value={logEntry.steps} onChange={e => setLogEntry(p => ({ ...p, steps: e.target.value }))} />
                    <Input label="Sleep (hrs)" type="number" value={logEntry.sleepHours} onChange={e => setLogEntry(p => ({ ...p, sleepHours: e.target.value }))} />
                    <Input label="Calories Burned" type="number" value={logEntry.caloriesBurned} onChange={e => setLogEntry(p => ({ ...p, caloriesBurned: e.target.value }))} />
                    <div className="sm:col-span-2 lg:col-span-4 mt-2">
                        <Button variant="primary" className="w-full" onClick={handleLog}>Save Entry</Button>
                    </div>
                </div>
            )}

            {/* Summary Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Workouts', value: stats.totalWorkouts || 0, icon: <Dumbbell size={16} /> },
                    { label: 'Current Streak', value: `${stats.currentStreak || 0} Days`, icon: <Flame size={16} className="text-orange-500" /> },
                    { label: 'Avg Posture', value: `${stats.avgPostureScore || 100}%`, icon: <Activity size={16} className="text-blue-500" /> },
                    { label: 'Badges Won', value: user?.badges?.length || 0, icon: <Trophy size={16} className="text-yellow-500" /> },
                ].map((item, i) => (
                    <div key={i} className="bg-bg-card p-4 rounded-card shadow-card border border-bg-surface flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{item.label}</p>
                            <p className="text-2xl font-bold text-cta mt-1">{item.value}</p>
                        </div>
                        <div className="bg-bg-surface p-2 rounded-lg text-primary">{item.icon}</div>
                    </div>
                ))}
            </div>

            {/* Main Tabs Container */}
            <div className="space-y-4">
                <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide" role="tablist">
                    {TABS.map(tab => (
                        <button key={tab} role="tab" aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-card text-sm font-bold transition whitespace-nowrap
                ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-bg-card text-text-secondary hover:bg-bg-surface border border-bg-surface'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-bg-card rounded-card shadow-card p-4 md:p-8 min-h-[450px]" role="tabpanel">
                    {activeTab === 'Weight' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl text-cta">Weight Evolution</h3>
                                    <p className="text-xs text-text-muted mt-0.5">Historical tracking of your body mass index.</p>
                                </div>
                                <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    Target: {user?.profile?.targetWeight || '--'}kg
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.weightTrend?.map(t => ({ ...t, date: formatDate(t.date) })) || []}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DCCB" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: '#F4EFE6' }} />
                                        <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorWeight)" strokeWidth={4} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Workouts' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h3 className="font-bold text-xl text-cta">Activity Volume</h3>
                                <p className="text-xs text-text-muted mt-0.5">Historical tracking of minutes spent training.</p>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.workoutTrend?.map(t => ({ ...t, date: formatDate(t.date) })) || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DCCB" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(47, 93, 58, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', background: '#F4EFE6' }} />
                                        <Bar dataKey="duration" name="Minutes" fill={CHART_COLORS.orange} radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Steps' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-xl text-cta">Movement Trend</h3>
                                <div className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                    Incl. Wearable Data
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.stepsTrend?.map(t => ({ ...t, date: formatDate(t.date) })) || []}>
                                        <defs>
                                            <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DCCB" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#F4EFE6' }} />
                                        <Area type="monotone" dataKey="steps" name="Daily Steps" stroke={CHART_COLORS.blue} fill="url(#colorSteps)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Heart Rate' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl text-cta">Heart Rate Rhythm</h3>
                                    <p className="text-xs text-text-muted mt-0.5">Historical tracking from Google Fit sessions.</p>
                                </div>
                                <div className="text-sm font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 flex items-center gap-2">
                                    <Activity size={14} /> Avg: {stats.avgHeartRate || 0} BPM
                                </div>
                            </div>

                            {stats.heartRateTrend?.length > 0 ? (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.heartRateTrend?.map(t => ({ ...t, date: formatDate(t.date) })) || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DCCB" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#F4EFE6' }} />
                                            <Line type="step" dataKey="bpm" name="Heart Rate (BPM)" stroke="#FF6B6B" strokeWidth={4} dot={{ fill: '#FF6B6B', r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[350px] flex flex-col justify-center items-center text-center py-10 bg-bg-surface/30 rounded-xl border border-dashed border-bg-surface">
                                    <Activity size={40} className="text-text-muted mb-4 opacity-50" />
                                    <p className="text-text-muted font-bold">No heart rate data available.</p>
                                    <p className="text-xs text-text-muted mt-2">Connect Google Fit on Dashboard to sync metrics.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-bg-surface/50 rounded-xl border border-bg-surface">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avg Resting BPM</p>
                                    <p className="text-2xl font-black text-cta">{stats.avgHeartRate || 0}</p>
                                </div>
                                <div className="p-4 bg-bg-surface/50 rounded-xl border border-bg-surface">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Max Recorded</p>
                                    <p className="text-2xl font-black text-red-500">{stats.heartRateTrend?.length > 0 ? Math.max(...stats.heartRateTrend.map(t => t.bpm)) : '--'}</p>
                                </div>
                                <div className="p-4 bg-bg-surface/50 rounded-xl border border-bg-surface hidden md:block">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</p>
                                    <p className="text-lg font-bold text-cta">Healthy Range</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Posture' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl text-cta">Posture Integrity</h3>
                                    <p className="text-xs text-text-muted mt-0.5">Historical quality score from AI sessions.</p>
                                </div>
                                <div className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
                                    <Activity size={14} /> Avg: {stats.avgPostureScore || 100}%
                                </div>
                            </div>

                            {stats.postureTrend?.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.postureTrend?.map(t => ({ ...t, date: formatDate(t.date) })) || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DCCB" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#F4EFE6' }} />
                                            <Line type="monotone" dataKey="score" name="Posture Score (%)" stroke={CHART_COLORS.purple} strokeWidth={4} dot={{ fill: CHART_COLORS.purple, r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex flex-col justify-center items-center text-center py-10 bg-bg-surface/30 rounded-xl border border-dashed border-bg-surface">
                                    <Activity size={40} className="text-text-muted mb-4 opacity-50" />
                                    <p className="text-text-muted font-bold">No sessions logged yet.</p>
                                    <Link to="/posture" className="mt-4">
                                        <Button variant="ghost" size="sm">Launch Posture Check</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-bg-surface/50 rounded-xl border border-bg-surface">
                                    <p className="text-[10px] font-bold text-text-muted uppercase">Recent Average</p>
                                    <p className="text-2xl font-black text-cta">{stats.avgPostureScore || 100}%</p>
                                </div>
                                <div className="p-4 bg-bg-surface/50 rounded-xl border border-bg-surface">
                                    <p className="text-[10px] font-bold text-text-muted uppercase">Sessions Tracked</p>
                                    <p className="text-2xl font-black text-cta">{stats.totalPostureSessions || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Distribution' && (
                        <div className="grid md:grid-cols-2 gap-12 items-center animate-in fade-in duration-500">
                            <div className="h-[350px]">
                                <h3 className="font-bold text-xl text-cta mb-6">Training Variance</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.workoutDistribution || []} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label>
                                            {(stats.workoutDistribution || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 bg-primary/5 rounded-card border border-primary/10">
                                    <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                                        <Sparkles size={16} /> Training Summary
                                    </h4>
                                    <p className="text-sm text-text-secondary">You are showing a strong preference for <strong>{(stats.workoutDistribution || []).reduce((a, b) => a.count > b.count ? a : b, { type: 'N/A' }).type}</strong> training this month.</p>
                                </div>
                                <div className="space-y-3">
                                    {(stats.workoutDistribution || []).map((type, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-bg-surface/50 rounded-xl border border-bg-surface transition-colors hover:bg-bg-surface">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                                                <span className="text-sm font-bold capitalize text-cta">{type.type}</span>
                                            </div>
                                            <span className="text-xs font-black bg-white px-3 py-1 rounded-full shadow-sm text-primary">{type.count} SESSIONS</span>
                                        </div>
                                    ))}
                                    {(!stats.workoutDistribution || stats.workoutDistribution.length === 0) && (
                                        <p className="text-center text-text-muted py-10 italic">No data logged yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icons needed for highlights
function Dumbbell(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.4 14.4 9.6 9.6" /><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.767a2 2 0 1 1-2.829-2.828l-1.767 1.767a2 2 0 1 1-2.829-2.828l-1.767 1.767a2 2 0 1 1-2.829-2.828" /><path d="m21.5 2.5-11 11" /><path d="m2.5 21.5 11-11" /><path d="M18.657 2.515a2 2 0 1 0-2.829 2.828l-1.767-1.767a2 2 0 1 0-2.829 2.828l-1.767-1.767a2 2 0 1 0-2.829 2.828l-1.767-1.767a2 2 0 1 0-2.829 2.828" />
        </svg>
    );
}

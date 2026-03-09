import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWorkoutMutation } from '../services/apiSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Upload, Plus, X, Image as ImageIcon, CheckCircle2, AlertTriangle } from 'lucide-react';

const TYPES = ['strength', 'cardio', 'yoga', 'hiit', 'flexibility'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function AdminWorkout() {
    const navigate = useNavigate();
    const [createWorkout, { isLoading }] = useCreateWorkoutMutation();
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        title: '', description: '', type: 'strength', level: 'beginner',
        duration: '', calories: '', equipment: '', targetMuscles: '', tags: '',
    });

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
            setToast({ type: 'error', msg: 'Only JPG, PNG, or WebP images allowed' });
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setToast({ type: 'error', msg: 'Image must be under 5 MB' });
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('type', form.type);
        fd.append('level', form.level);
        fd.append('duration', form.duration);
        fd.append('calories', form.calories);
        fd.append('equipment', JSON.stringify(form.equipment.split(',').map(s => s.trim()).filter(Boolean)));
        fd.append('targetMuscles', JSON.stringify(form.targetMuscles.split(',').map(s => s.trim()).filter(Boolean)));
        fd.append('tags', JSON.stringify(form.tags.split(',').map(s => s.trim()).filter(Boolean)));
        if (file) fd.append('thumbnail', file);

        try {
            await createWorkout(fd).unwrap();
            setToast({ type: 'success', msg: 'Workout created successfully!' });
            setTimeout(() => navigate('/workouts'), 1500);
        } catch (err) {
            setToast({ type: 'error', msg: err?.data?.message || 'Failed to create workout' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-cta">Upload Workout</h1>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2 p-3 rounded-btn text-sm border ${toast.type === 'success' ? 'bg-accent-soft/20 border-primary text-primary' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {toast.msg}
                    <button className="ml-auto" onClick={() => setToast(null)}><X size={14} /></button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-bg-card rounded-card shadow-card p-6 space-y-5">
                {/* Image upload */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Thumbnail Image</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border border-dashed border-bg-surface rounded-btn hover:border-primary transition text-sm text-text-secondary">
                            <Upload size={16} /> Choose Image
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
                        </label>
                        {preview && (
                            <div className="relative w-24 h-16 rounded-btn overflow-hidden border border-bg-surface">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" className="absolute top-0.5 right-0.5 bg-bg-card rounded-full p-0.5" onClick={() => { setPreview(null); setFile(null); }}>
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        {!preview && <div className="w-24 h-16 rounded-btn bg-bg-surface flex items-center justify-center"><ImageIcon size={20} className="text-text-muted" /></div>}
                    </div>
                </div>

                {/* Title & Description */}
                <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                        className="w-full rounded-btn border border-bg-surface bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>

                {/* Type & Level */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                        <select name="type" value={form.type} onChange={handleChange}
                            className="w-full rounded-btn border border-bg-surface bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                            {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty</label>
                        <select name="level" value={form.level} onChange={handleChange}
                            className="w-full rounded-btn border border-bg-surface bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                            {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                        </select>
                    </div>
                </div>

                {/* Duration & Calories */}
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Duration (min)" type="number" name="duration" value={form.duration} onChange={handleChange} required />
                    <Input label="Calories (kcal)" type="number" name="calories" value={form.calories} onChange={handleChange} />
                </div>

                {/* Equipment, Muscles, Tags */}
                <Input label="Equipment (comma-separated)" name="equipment" value={form.equipment} onChange={handleChange} placeholder="dumbbells, bench, barbell" />
                <Input label="Target Muscles (comma-separated)" name="targetMuscles" value={form.targetMuscles} onChange={handleChange} placeholder="chest, triceps, shoulders" />
                <Input label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="push, upper-body, compound" />

                {/* Preview tags */}
                {form.tags && (
                    <div className="flex flex-wrap gap-1.5">
                        {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                            <Badge key={t} color="muted" className="text-xs">#{t}</Badge>
                        ))}
                    </div>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
                    {isLoading ? 'Uploading…' : <><Plus size={18} /> Create Workout</>}
                </Button>
            </form>
        </div>
    );
}

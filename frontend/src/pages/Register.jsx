import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterMutation } from '../services/apiSlice';
import { setCredentials } from '../features/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Leaf } from 'lucide-react';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [register] = useRegisterMutation();
    const { register: reg, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        try {
            const res = await register({ name: data.name, email: data.email, password: data.password }).unwrap();
            dispatch(setCredentials(res.user));
            navigate('/onboarding');
        } catch (err) {
            setError('root', { message: err.data?.message || 'Registration failed' });
        }
    };

    const GOOGLE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/google`;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-bg-main to-bg-secondary">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Leaf size={36} className="text-primary mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-cta">Create your account</h1>
                    <p className="text-text-secondary text-sm mt-1">Start your personalized fitness journey</p>
                </div>

                <div className="bg-bg-card rounded-card shadow-card p-8">
                    {errors.root && (
                        <div role="alert" className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-btn border border-red-200">
                            {errors.root.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <Input label="Full Name" type="text" error={errors.name?.message}    {...reg('name')} />
                        <Input label="Email" type="email" error={errors.email?.message}   {...reg('email')} />
                        <Input label="Password" type="password" error={errors.password?.message} {...reg('password')} hint="Minimum 8 characters" />
                        <Input label="Confirm Password" type="password" error={errors.confirm?.message} {...reg('confirm')} />
                        <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating account…' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-bg-surface" /></div>
                        <div className="relative flex justify-center text-xs text-text-muted bg-bg-card px-3">or sign up with</div>
                    </div>

                    <a href={GOOGLE_URL} className="w-full flex items-center justify-center gap-3 border border-bg-surface py-3 rounded-btn hover:bg-bg-secondary transition text-text-secondary text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Google
                    </a>

                    <a href="#" className="w-full mt-3 flex items-center justify-center gap-3 border border-bg-surface py-3 rounded-btn hover:bg-bg-secondary transition text-text-secondary text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        Facebook
                    </a>

                    <p className="text-center text-sm text-text-secondary mt-6">
                        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

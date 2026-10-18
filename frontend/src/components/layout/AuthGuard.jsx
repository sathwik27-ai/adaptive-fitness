import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthInitialized, selectCurrentUser, selectIsAuthenticated } from '../../features/authSlice';

export function ProtectedRoute() {
    const isInitialized = useSelector(selectAuthInitialized);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();
    if (!isInitialized) return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Checking your session…</div>;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    return <Outlet />;
}

export function OnboardingGuard() {
    const user = useSelector(selectCurrentUser);
    const isInitialized = useSelector(selectAuthInitialized);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    if (!isInitialized) return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Checking your session…</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
    return <Outlet />;
}

export function AdminRoute() {
    const user = useSelector(selectCurrentUser);
    if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return <Outlet />;
}

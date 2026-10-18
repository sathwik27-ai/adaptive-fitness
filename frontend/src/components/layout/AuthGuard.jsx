import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthInitialized, selectCurrentUser, selectIsAuthenticated, selectSessionExpired } from '../../features/authSlice';

export function ProtectedRoute() {
    const isInitialized = useSelector(selectAuthInitialized);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const sessionExpired = useSelector(selectSessionExpired);
    const location = useLocation();
    if (!isInitialized) return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Checking your session…</div>;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location, sessionExpired }} replace />;
    return <Outlet />;
}

export function OnboardingGuard() {
    const user = useSelector(selectCurrentUser);
    const isInitialized = useSelector(selectAuthInitialized);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const sessionExpired = useSelector(selectSessionExpired);
    const location = useLocation();
    if (!isInitialized) return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Checking your session…</div>;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location, sessionExpired }} replace />;
    if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
    return <Outlet />;
}

export function AdminRoute() {
    const user = useSelector(selectCurrentUser);
    if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return <Outlet />;
}

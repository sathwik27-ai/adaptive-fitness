import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../features/authSlice';

export function ProtectedRoute() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    return <Outlet />;
}

export function OnboardingGuard() {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
    return <Outlet />;
}

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, OnboardingGuard } from './components/layout/AuthGuard';
import AuthInitializer from './components/layout/AuthInitializer';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import DietPlan from './pages/DietPlan';
import Progress from './pages/Progress';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import AdminWorkout from './pages/AdminWorkout';
import WorkoutHistory from './pages/WorkoutHistory';

// Lazy-load heavy pages
const PostureDetection = lazy(() => import('./pages/PostureDetection'));

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <div className="min-h-screen bg-bg-main">
            <Navbar />
            <main className="pb-16 md:pb-0">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Auth required */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                </Route>

                {/* Auth + onboarding required */}
                <Route element={<OnboardingGuard />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/workouts/:id" element={<WorkoutDetail />} />
                  <Route path="/diet" element={<DietPlan />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin/workouts" element={<AdminWorkout />} />
                  <Route path="/history" element={<WorkoutHistory />} />
                  <Route path="/posture" element={
                    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-text-muted">Loading Posture Detection…</div>}>
                      <PostureDetection />
                    </Suspense>
                  } />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <BottomNav />
            <Toaster position="top-right" />
          </div>
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  );
}

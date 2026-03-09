import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, selectCurrentUser } from '../../features/authSlice';
import { useLogoutMutation } from '../../services/apiSlice';
import { Leaf, User, LogOut, ChevronDown, Sun, Moon, Activity, History } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const navLinks = [
    { to: '/workouts', label: 'Workouts' },
    { to: '/diet', label: 'Diet Plan' },
    { to: '/progress', label: 'Progress' },
    { to: '/saved', label: 'Saved' },
    { to: '/posture', label: 'Posture' },
];

export default function Navbar() {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logout] = useLogoutMutation();
    const [dropOpen, setDropOpen] = useState(false);
    const { dark, toggle } = useTheme();

    const handleLogout = async () => {
        await logout();
        dispatch(clearCredentials());
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 bg-bg-card border-b border-bg-surface shadow-sm hidden md:block">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
                {/* Logo */}
                <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-primary text-lg hover:text-primary-hover transition">
                    <Leaf size={22} />
                    <span>Adaptive Fitness</span>
                </NavLink>

                {/* Center links */}
                <ul className="flex items-center gap-1" role="list">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-btn text-sm font-medium transition-all duration-150 focus-ring
                   ${isActive ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-cta'}`
                                }
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Right: dark mode + avatar */}
                <div className="flex items-center gap-2">
                    {/* Dark mode toggle */}
                    <button onClick={toggle} aria-label="Toggle dark mode"
                        className="p-2 rounded-full hover:bg-bg-secondary transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        {dark ? <Sun size={18} className="text-chart-orange" /> : <Moon size={18} className="text-text-muted" />}
                    </button>

                    {/* Avatar & dropdown */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setDropOpen(d => !d)}
                                aria-haspopup="true" aria-expanded={dropOpen}
                                className="flex items-center gap-2 p-2 rounded-full hover:bg-bg-secondary transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <ChevronDown size={14} className="text-text-muted" />
                            </button>
                            {dropOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-bg-card rounded-card shadow-card border border-bg-surface overflow-hidden" role="menu">
                                    <NavLink to="/profile" role="menuitem" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-bg-secondary transition">
                                        <User size={16} /> Profile
                                    </NavLink>
                                    <NavLink to="/history" role="menuitem" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-bg-secondary transition">
                                        <History size={16} /> Workout History
                                    </NavLink>
                                    <NavLink to="/admin/workouts" role="menuitem" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-bg-secondary transition">
                                        <Activity size={16} /> Admin Upload
                                    </NavLink>
                                    <button onClick={handleLogout} role="menuitem" className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-bg-secondary transition text-left">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

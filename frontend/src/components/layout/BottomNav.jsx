import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Salad, TrendingUp, Bookmark } from 'lucide-react';

const tabs = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { to: '/diet', icon: Salad, label: 'Diet' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
];

export default function BottomNav() {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card border-t border-bg-surface md:hidden"
            aria-label="Mobile navigation"
        >
            <ul className="flex justify-around items-center h-16" role="list">
                {tabs.map(({ to, icon: Icon, label }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-0.5 p-2 min-w-[44px] min-h-[44px] justify-center rounded-lg transition-colors
                 ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`
                            }
                            aria-label={label}
                        >
                            <Icon size={22} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

import React from 'react';

export default function FilterChip({ label, active = false, onClick }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        ${active
                    ? 'bg-primary text-text-on-dark'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-surface border border-bg-surface'
                }`}
        >
            {label}
        </button>
    );
}

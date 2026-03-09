import React from 'react';

export default function ProgressBar({ value = 0, color = 'bg-primary', label, className = '' }) {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className={`w-full ${className}`}>
            {label && <p className="text-xs text-text-muted mb-1">{label}</p>}
            <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${clamped}%` }} />
            </div>
        </div>
    );
}

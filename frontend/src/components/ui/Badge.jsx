import React from 'react';

const colors = {
    green: 'bg-accent-soft/30 text-primary',
    orange: 'bg-chart-orange/20 text-chart-orange',
    purple: 'bg-chart-purple/20 text-chart-purple',
    muted: 'bg-bg-surface text-text-muted',
};

export default function Badge({ children, color = 'green', className = '' }) {
    return (
        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${colors[color]} ${className}`}>
            {children}
        </span>
    );
}

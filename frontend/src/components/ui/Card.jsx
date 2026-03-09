import React from 'react';

const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };
const shadows = { soft: 'shadow-card', none: '' };

export default function Card({ children, padding = 'md', shadow = 'soft', className = '' }) {
    return (
        <div className={`bg-bg-card rounded-card ${paddings[padding]} ${shadows[shadow]} ${className}`}>
            {children}
        </div>
    );
}

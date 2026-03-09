import React from 'react';

const variants = {
    primary: 'bg-cta text-text-on-dark hover:bg-cta/85 focus-ring',
    ghost: 'border border-primary text-primary hover:bg-primary/10 focus-ring',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-ring',
    green: 'bg-primary text-text-on-dark hover:bg-primary-hover focus-ring',
};
const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...rest }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] ${variants[variant]} ${sizes[size]} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

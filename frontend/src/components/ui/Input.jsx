import React from 'react';

export default function Input({ label, id, error, hint, type = 'text', className = '', ...rest }) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                aria-invalid={!!error}
                className={`w-full rounded-btn border px-4 py-2.5 text-text-primary bg-bg-surface placeholder:text-text-muted transition-all duration-150 min-h-[44px]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary
          ${error ? 'border-red-500' : 'border-bg-surface hover:border-accent-light'}`}
                {...rest}
            />
            {hint && !error && (
                <p id={`${inputId}-hint`} className="text-xs text-text-muted">{hint}</p>
            )}
            {error && (
                <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}

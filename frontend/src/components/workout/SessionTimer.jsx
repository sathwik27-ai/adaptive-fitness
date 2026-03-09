import React, { useState, useEffect, useCallback } from 'react';

export default function SessionTimer({ duration = 30, onComplete, onTick }) {
    const totalSeconds = duration * 60;
    const [remaining, setRemaining] = useState(totalSeconds);
    const [running, setRunning] = useState(false);

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = ((totalSeconds - remaining) / totalSeconds) * circumference;

    useEffect(() => {
        onTick?.(remaining);
    }, [remaining, onTick]);

    useEffect(() => {
        if (!running) return;
        if (remaining <= 0) { onComplete?.(); return; }
        const timer = setInterval(() => setRemaining(r => r - 1), 1000);
        return () => clearInterval(timer);
    }, [running, remaining, onComplete]);

    const formatTime = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const reset = useCallback(() => { setRemaining(totalSeconds); setRunning(false); }, [totalSeconds]);

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width="130" height="130" viewBox="0 0 120 120" aria-label={`Timer: ${formatTime(remaining)} remaining`} role="img">
                {/* Track */}
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#CBBDA6" strokeWidth="8" />
                {/* Progress */}
                <circle
                    cx="60" cy="60" r={radius}
                    fill="none" stroke="#2F5D3A" strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={circumference - progress}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                <text x="60" y="65" textAnchor="middle" className="text-xl font-bold" fill="#1E1E1E" fontSize="20">
                    {formatTime(remaining)}
                </text>
            </svg>

            <div className="flex gap-3">
                <button
                    onClick={() => setRunning(r => !r)}
                    className="px-6 py-2.5 rounded-btn bg-primary text-white font-semibold hover:bg-primary-hover transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={running ? 'Pause timer' : 'Start timer'}
                >
                    {running ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={reset}
                    className="px-4 py-2.5 rounded-btn border border-primary text-primary font-semibold hover:bg-primary/10 transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Reset timer"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

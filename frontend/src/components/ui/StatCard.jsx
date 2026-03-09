import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ icon: Icon, value, label, trend, unit = '' }) {
    const trendIcon =
        trend > 0 ? <TrendingUp size={14} className="text-primary" /> :
            trend < 0 ? <TrendingDown size={14} className="text-red-500" /> :
                <Minus size={14} className="text-text-muted" />;

    return (
        <div className="bg-bg-card rounded-card shadow-card p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                {Icon && <div className="p-2 bg-primary/10 rounded-xl"><Icon size={20} className="text-primary" /></div>}
                {trend !== undefined && (
                    <span className="flex items-center gap-0.5 text-xs text-text-muted">{trendIcon}{Math.abs(trend)}{unit}</span>
                )}
            </div>
            <p className="text-2xl font-bold text-primary mt-1">{value}<span className="text-lg font-normal text-text-muted ml-1">{unit}</span></p>
            <p className="text-sm text-text-secondary">{label}</p>
        </div>
    );
}

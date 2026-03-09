import React, { useState } from 'react';
import MacroBar from './MacroBar';
import Badge from './Badge';
import Button from './Button';
import { ChevronDown, ChevronUp, RefreshCw, Bookmark, BookmarkCheck } from 'lucide-react';
import { useToggleSavedMutation } from '../../services/apiSlice';

export default function MealCard({ meal, onSwap, mealType, isSaved = false }) {
    const [expanded, setExpanded] = useState(false);
    const [toggleSaved] = useToggleSavedMutation();

    const handleSave = async (e) => {
        e.stopPropagation();
        await toggleSaved({ type: 'meal', id: meal._id });
    };

    return (
        <div className="bg-bg-card rounded-card shadow-card p-4 flex flex-col gap-3 relative group">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h4 className="text-base font-semibold text-text-primary">{meal.name}</h4>
                    <Badge color="orange" className="mt-1">{meal.calories} kcal</Badge>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleSave}
                        className="p-1.5 rounded-full hover:bg-bg-surface transition text-cta"
                        aria-label={isSaved ? "Remove from saved" : "Save meal"}
                    >
                        {isSaved ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} className="text-text-muted" />}
                    </button>
                    {onSwap && (
                        <Button variant="ghost" size="sm" onClick={onSwap} aria-label="Swap this meal">
                            <RefreshCw size={14} /> Swap
                        </Button>
                    )}
                </div>
            </div>

            <MacroBar protein={meal.protein} carbs={meal.carbs} fats={meal.fats} />

            <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-expanded={expanded}
            >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expanded ? 'Hide' : 'View'} ingredients
            </button>

            {expanded && (
                <div className="border-t border-bg-surface pt-3 space-y-2">
                    {meal.ingredients && meal.ingredients.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                            {meal.ingredients.map((ing, i) => (
                                <li key={i} className="bg-bg-secondary text-text-secondary text-xs px-2 py-1 rounded-full border border-bg-surface/50">
                                    {typeof ing === 'string' ? ing : `${ing.name} (${ing.quantity})`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-text-muted italic">No ingredient details available.</p>
                    )}
                    {meal.instructions && (
                        <p className="text-sm text-text-secondary leading-relaxed bg-bg-surface/30 p-2 rounded-lg">{meal.instructions}</p>
                    )}
                </div>
            )}
        </div>
    );
}

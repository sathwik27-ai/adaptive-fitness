import React from 'react';

export default function MacroBar({ protein = 0, carbs = 0, fats = 0 }) {
  const total = protein + carbs + fats || 1;
  const pW = (protein / total) * 100;
  const cW = (carbs   / total) * 100;
  const fW = (fats    / total) * 100;

  return (
    <div className="w-full">
      <div className="h-2 flex rounded-full overflow-hidden gap-px" role="group" aria-label="Macro breakdown">
        <div style={{ width: `${pW}%` }} className="bg-primary transition-all" title={`Protein ${protein}g`} />
        <div style={{ width: `${cW}%` }} className="bg-chart-orange transition-all" title={`Carbs ${carbs}g`} />
        <div style={{ width: `${fW}%` }} className="bg-chart-purple transition-all" title={`Fats ${fats}g`} />
      </div>
      <div className="flex gap-4 mt-1">
        <span className="text-xs text-text-muted"><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />{protein}g P</span>
        <span className="text-xs text-text-muted"><span className="inline-block w-2 h-2 rounded-full bg-chart-orange mr-1" />{carbs}g C</span>
        <span className="text-xs text-text-muted"><span className="inline-block w-2 h-2 rounded-full bg-chart-purple mr-1" />{fats}g F</span>
      </div>
    </div>
  );
}

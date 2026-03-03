'use client';

import { useState } from 'react';

interface CrewCostInputProps {
  onChange: (cost: number) => void;
}

export default function CrewCostInput({ onChange }: CrewCostInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [workers, setWorkers] = useState(0);
  const [ratePerDay, setRatePerDay] = useState(400);
  const [crewDays, setCrewDays] = useState(1);

  const total = workers * ratePerDay * crewDays;

  const handleChange = (w: number, r: number, d: number) => {
    const newTotal = w * r * d;
    onChange(newTotal);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-left border border-neutral-200 bg-white rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
      >
        <span className="text-sm text-neutral-500 group-hover:text-blue-600 font-medium transition-colors">
          👷 + Agregar costo de Crew (freelancers)
        </span>
      </button>
    );
  }

  return (
    <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-800">👷 Crew (Freelancers)</span>
        <button
          onClick={() => {
            setExpanded(false);
            setWorkers(0);
            onChange(0);
          }}
          className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
        >
          Quitar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1"># Trabajadores</label>
          <input
            type="number"
            value={workers}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              setWorkers(v);
              handleChange(v, ratePerDay, crewDays);
            }}
            min="0"
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">$/día c/u</label>
          <input
            type="number"
            value={ratePerDay}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              setRatePerDay(v);
              handleChange(workers, v, crewDays);
            }}
            min="0"
            step="50"
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Días crew</label>
          <input
            type="number"
            value={crewDays}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 1);
              setCrewDays(v);
              handleChange(workers, ratePerDay, v);
            }}
            min="1"
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {total > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
          <span className="text-sm text-blue-700">
            {workers} personas × ${ratePerDay.toLocaleString()} × {crewDays} día{crewDays > 1 ? 's' : ''}
          </span>
          <span className="font-bold text-blue-800">${total.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

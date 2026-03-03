'use client';

import { useState } from 'react';

interface ShippingConfig {
  distance_a_cost: number;
  distance_b_cost: number;
  distance_c_cost: number;
  loading_hourly_rate: number;
  insurance_pct: number;
  fuel_per_km: number;
}

interface ShippingModuleProps {
  equipmentValue: number;
  onChange: (cost: number) => void;
}

const DEFAULT_CONFIG: ShippingConfig = {
  distance_a_cost: 50,
  distance_b_cost: 100,
  distance_c_cost: 200,
  loading_hourly_rate: 30,
  insurance_pct: 0.02,
  fuel_per_km: 0.50,
};

export default function ShippingModule({ equipmentValue, onChange }: ShippingModuleProps) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState<'A' | 'B' | 'C'>('A');
  const [distance, setDistance] = useState(10);
  const [loadingHours, setLoadingHours] = useState(1);

  const cfg = DEFAULT_CONFIG;
  const distanceCosts = { A: cfg.distance_a_cost, B: cfg.distance_b_cost, C: cfg.distance_c_cost };

  const calculate = (cat: 'A' | 'B' | 'C', dist: number, hours: number) => {
    const baseCost = distanceCosts[cat];
    const fuelCost = dist * cfg.fuel_per_km;
    const loadingCost = hours * cfg.loading_hourly_rate;
    const insurance = equipmentValue * cfg.insurance_pct;
    return baseCost + fuelCost + loadingCost + insurance;
  };

  const total = calculate(category, distance, loadingHours);

  const handleUpdate = (cat: 'A' | 'B' | 'C', dist: number, hours: number) => {
    onChange(calculate(cat, dist, hours));
  };

  if (!expanded) {
    return (
      <button
        onClick={() => {
          setExpanded(true);
          handleUpdate(category, distance, loadingHours);
        }}
        className="w-full text-left border border-neutral-200 bg-white rounded-xl px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
      >
        <span className="text-sm text-neutral-500 group-hover:text-emerald-600 font-medium transition-colors">
          🚚 + Agregar costo de envío
        </span>
      </button>
    );
  }

  return (
    <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-emerald-800">🚚 Envío</span>
        <button
          onClick={() => {
            setExpanded(false);
            onChange(0);
          }}
          className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
        >
          Quitar
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Categoría de Distancia</label>
        <select
          value={category}
          onChange={(e) => {
            const v = e.target.value as 'A' | 'B' | 'C';
            setCategory(v);
            handleUpdate(v, distance, loadingHours);
          }}
          className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="A">Cat A (0-20 km) — ${cfg.distance_a_cost}</option>
          <option value="B">Cat B (20-50 km) — ${cfg.distance_b_cost}</option>
          <option value="C">Cat C (50+ km) — ${cfg.distance_c_cost}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Distancia (km)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              setDistance(v);
              handleUpdate(category, v, loadingHours);
            }}
            min="0"
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Horas carga/descarga</label>
          <input
            type="number"
            value={loadingHours}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              setLoadingHours(v);
              handleUpdate(category, distance, v);
            }}
            min="0"
            step="0.5"
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="border-t border-emerald-200 pt-2 space-y-1 text-xs">
        <div className="flex justify-between text-neutral-500">
          <span>Flete base (Cat {category})</span>
          <span>${distanceCosts[category].toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Gasolina ({distance} km)</span>
          <span>${(distance * cfg.fuel_per_km).toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Carga/Descarga ({loadingHours}h)</span>
          <span>${(loadingHours * cfg.loading_hourly_rate).toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Seguro ({(cfg.insurance_pct * 100).toFixed(0)}%)</span>
          <span>${(equipmentValue * cfg.insurance_pct).toFixed(0)}</span>
        </div>
        <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-emerald-200">
          <span>Total Envío</span>
          <span>${total.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

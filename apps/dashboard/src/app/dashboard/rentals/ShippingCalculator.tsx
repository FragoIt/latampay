'use client';

import { useState, useEffect } from 'react';

interface ShippingConfig {
  distance_a_cost: number;
  distance_b_cost: number;
  distance_c_cost: number;
  loading_hourly_rate: number;
  insurance_pct: number;
  fuel_per_km: number;
}

interface ShippingBreakdown {
  baseCost: number;
  fuelCost: number;
  loadingCost: number;
  insurance: number;
  total: number;
}

interface ShippingCalculatorProps {
  equipmentValue: number;
  onChange: (cost: number, breakdown: ShippingBreakdown) => void;
  config?: ShippingConfig;
}

const DEFAULT_CONFIG: ShippingConfig = {
  distance_a_cost: 50,
  distance_b_cost: 100,
  distance_c_cost: 200,
  loading_hourly_rate: 30,
  insurance_pct: 0.02,
  fuel_per_km: 0.50,
};

export default function ShippingCalculator({ equipmentValue, onChange, config }: ShippingCalculatorProps) {
  const cfg = config || DEFAULT_CONFIG;
  const [category, setCategory] = useState<'A' | 'B' | 'C'>('A');
  const [distance, setDistance] = useState(10);
  const [loadingHours, setLoadingHours] = useState(1);

  const distanceCosts = { A: cfg.distance_a_cost, B: cfg.distance_b_cost, C: cfg.distance_c_cost };

  useEffect(() => {
    const baseCost = distanceCosts[category];
    const fuelCost = distance * cfg.fuel_per_km;
    const loadingCost = loadingHours * cfg.loading_hourly_rate;
    const insurance = equipmentValue * cfg.insurance_pct;
    const total = baseCost + fuelCost + loadingCost + insurance;

    const breakdown = { baseCost, fuelCost, loadingCost, insurance, total };
    onChange(total, breakdown);
  }, [category, distance, loadingHours, equipmentValue, cfg]);

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 font-semibold text-blue-800">
        🚚 Calculadora de Envío
      </div>

      {/* Categoría de Distancia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de Distancia</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as 'A' | 'B' | 'C')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="A">Categoría A (0-20 km) — ${cfg.distance_a_cost}</option>
          <option value="B">Categoría B (20-50 km) — ${cfg.distance_b_cost}</option>
          <option value="C">Categoría C (50+ km) — ${cfg.distance_c_cost}</option>
        </select>
      </div>

      {/* Distancia Exacta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Distancia al Destino (km)</label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value) || 0)}
          min="0"
          step="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-1">Gasolina: ${cfg.fuel_per_km}/km</p>
      </div>

      {/* Horas de Carga/Descarga */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horas de Carga/Descarga</label>
        <input
          type="number"
          value={loadingHours}
          onChange={(e) => setLoadingHours(Number(e.target.value) || 0)}
          min="0"
          step="0.5"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-1">Tarifa: ${cfg.loading_hourly_rate}/hora</p>
      </div>

      {/* Desglose de Costos */}
      <div className="border-t border-blue-200 pt-3 space-y-1">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Flete base (Cat. {category})</span>
          <span>${distanceCosts[category].toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Gasolina ({distance} km)</span>
          <span>${(distance * cfg.fuel_per_km).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Carga/Descarga ({loadingHours}h)</span>
          <span>${(loadingHours * cfg.loading_hourly_rate).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Seguro ({(cfg.insurance_pct * 100).toFixed(0)}% de ${equipmentValue.toLocaleString()})</span>
          <span>${(equipmentValue * cfg.insurance_pct).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2 text-blue-700">
          <span>Total Envío</span>
          <span>
            ${(distanceCosts[category] + distance * cfg.fuel_per_km + loadingHours * cfg.loading_hourly_rate + equipmentValue * cfg.insurance_pct).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

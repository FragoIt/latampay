'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SelectedItem {
  id: string;
  name: string;
  qty: number;
  daily_rate: number;
  isKit: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  daily_rate: number;
  category: string;
  kit_contents: { name: string; qty: number; daily_rate: number }[] | null;
}

interface ItemSelectorProps {
  items: SelectedItem[];
  onChange: (items: SelectedItem[]) => void;
}

export default function ItemSelector({ items, onChange }: ItemSelectorProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .order('category', { ascending: false }) // kits first
      .order('name');
    if (data) setInventory(data);
  };

  const kits = inventory.filter(i => i.category === 'kit');
  const allItems = inventory.filter(i => i.category === 'item');

  const filteredItems = allItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (item: InventoryItem) => {
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      onChange(items.map(i =>
        i.id === item.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      onChange([
        ...items,
        {
          id: item.id,
          name: item.name,
          qty: 1,
          daily_rate: item.daily_rate,
          isKit: item.category === 'kit',
        },
      ]);
    }
    setSearch('');
    setShowSearch(false);
  };

  const updateQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      onChange(items.filter(i => i.id !== id));
    } else {
      onChange(items.map(i => i.id === id ? { ...i, qty: newQty } : i));
    }
  };

  const removeItem = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
        📦 Equipos
      </label>

      {/* Kit Quick-Select Grid */}
      {kits.length > 0 && items.length === 0 && (
        <div className="mb-3">
          <p className="text-xs text-neutral-400 mb-2 font-medium uppercase tracking-wider">Kits Rápidos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {kits.map(kit => (
              <button
                key={kit.id}
                onClick={() => addItem(kit)}
                className="text-left bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 hover:shadow-md hover:border-amber-300 transition-all group"
              >
                <p className="font-semibold text-sm text-neutral-800 group-hover:text-amber-700 transition-colors">
                  📦 {kit.name}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ${kit.daily_rate.toLocaleString()}/día
                </p>
                {kit.kit_contents && (
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {kit.kit_contents.map(c => `${c.qty}× ${c.name}`).join(', ')}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected items */}
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-800 truncate">
                  {item.isKit ? '📦' : '🔧'} {item.name}
                </p>
                <p className="text-xs text-neutral-400">${item.daily_rate.toLocaleString()}/día</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-lg transition-colors flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-neutral-800">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-lg transition-colors flex items-center justify-center"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add item button / search */}
      {!showSearch ? (
        <button
          onClick={() => setShowSearch(true)}
          className="w-full border-2 border-dashed border-neutral-200 rounded-xl py-3 text-sm text-neutral-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50 transition-all font-medium"
        >
          + Agregar equipo
        </button>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
          <input
            type="text"
            placeholder="Buscar equipo... (ej: MK 10ft, Motor)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none border-b border-neutral-100"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors border-b border-neutral-50 last:border-0 flex justify-between items-center"
              >
                <span className="text-sm text-neutral-700">🔧 {item.name}</span>
                <span className="text-xs text-neutral-400 font-medium">${item.daily_rate.toLocaleString()}/día</span>
              </button>
            ))}
            {filteredItems.length === 0 && search && (
              <p className="px-4 py-3 text-sm text-neutral-400">Sin resultados para "{search}"</p>
            )}
          </div>
          <button
            onClick={() => { setShowSearch(false); setSearch(''); }}
            className="w-full px-4 py-2 text-xs text-neutral-400 hover:text-neutral-600 border-t border-neutral-100"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

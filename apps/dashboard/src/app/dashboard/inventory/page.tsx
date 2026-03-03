'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InventoryItem {
  id: string;
  name: string;
  daily_rate: number;
  category: string;
  kit_contents: { name: string; qty: number; daily_rate: number }[] | null;
  created_at: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'item' | 'kit'>('all');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .order('category', { ascending: false })
      .order('name');
    if (data) setItems(data);
    setLoading(false);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const handleCreate = async () => {
    if (!newName.trim() || !newRate) return;
    setSaving(true);
    const { error } = await supabase.from('inventory_items').insert({
      name: newName.trim(),
      daily_rate: Number(newRate),
      category: 'item',
    });
    if (!error) {
      loadItems();
      setShowForm(false);
      setNewName('');
      setNewRate('');
    }
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    await supabase.from('inventory_items').delete().eq('id', id);
    loadItems();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Inventario</h1>
          <p className="text-sm text-neutral-400">{items.length} equipos y kits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors"
        >
          + Nuevo Equipo
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-4 w-fit">
        {(['all', 'kit', 'item'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                ? 'bg-white shadow-sm text-neutral-800'
                : 'text-neutral-500 hover:text-neutral-700'
              }`}
          >
            {f === 'all' ? '📁 Todos' : f === 'kit' ? '📦 Kits' : '🔧 Items'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 space-y-3">
          <p className="font-semibold text-amber-800 text-sm">Nuevo Equipo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre del equipo (ej: MK 10ft)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">$</span>
              <input
                type="number"
                placeholder="Tarifa diaria"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                min="0"
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-sm text-neutral-400">/día</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim() || !newRate}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-amber-600 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-neutral-500 text-sm hover:text-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-neutral-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${item.category === 'kit' ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30' : 'border-neutral-200'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">
                    {item.category === 'kit' ? '📦' : '🔧'} {item.name}
                  </p>
                  <p className="text-lg font-bold text-neutral-800 mt-1">
                    ${item.daily_rate.toLocaleString()}
                    <span className="text-xs text-neutral-400 font-normal">/día</span>
                  </p>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-neutral-300 hover:text-red-500 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {item.kit_contents && (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                  <p className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider mb-1">Contenido del Kit</p>
                  {item.kit_contents.map((c, idx) => (
                    <p key={idx} className="text-xs text-neutral-500">
                      {c.qty}× {c.name} <span className="text-neutral-300">(${c.daily_rate}/día)</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

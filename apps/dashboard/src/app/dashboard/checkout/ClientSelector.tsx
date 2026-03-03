'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  discount_rate: number;
}

interface ClientSelectorProps {
  value: Client | null;
  onChange: (client: Client | null) => void;
}

export default function ClientSelector({ value, onChange }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    if (data) setClients(data);
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleCreateClient = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('clients')
      .insert({ name: newName.trim(), phone: newPhone.trim(), discount_rate: 0 })
      .select()
      .single();

    if (data && !error) {
      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(data);
      setShowNewForm(false);
      setNewName('');
      setNewPhone('');
      setIsOpen(false);
    }
    setSaving(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
        👤 Cliente
      </label>

      {value ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div>
            <p className="font-semibold text-neutral-800">{value.name}</p>
            <p className="text-sm text-neutral-500">{value.phone}</p>
            {value.discount_rate > 0 && (
              <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {(value.discount_rate * 100).toFixed(0)}% descuento
              </span>
            )}
          </div>
          <button
            onClick={() => { onChange(null); setSearch(''); }}
            className="text-neutral-400 hover:text-red-500 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
          />

          {isOpen && (
            <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-neutral-200 shadow-lg max-h-64 overflow-y-auto">
              {filtered.map(client => (
                <button
                  key={client.id}
                  onClick={() => { onChange(client); setIsOpen(false); setSearch(''); }}
                  className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-neutral-100 last:border-0"
                >
                  <p className="font-medium text-neutral-800 text-sm">{client.name}</p>
                  <p className="text-xs text-neutral-400">{client.phone}</p>
                </button>
              ))}

              {filtered.length === 0 && search && (
                <div className="px-4 py-3 text-sm text-neutral-400">
                  Sin resultados para "{search}"
                </div>
              )}

              {/* Botón crear nuevo */}
              <button
                onClick={() => {
                  setShowNewForm(true);
                  setNewName(search);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-amber-600 font-medium text-sm hover:bg-amber-50 transition-colors border-t border-neutral-200"
              >
                + Agregar nuevo cliente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Formulario inline de nuevo cliente */}
      {showNewForm && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="text-sm font-semibold text-amber-800">Nuevo Cliente</p>
          <input
            type="text"
            placeholder="Nombre completo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            autoFocus
          />
          <input
            type="tel"
            placeholder="+52 555 123 4567"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateClient}
              disabled={saving || !newName.trim() || !newPhone.trim()}
              className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-all"
            >
              {saving ? 'Guardando...' : '✓ Guardar'}
            </button>
            <button
              onClick={() => { setShowNewForm(false); setNewName(''); setNewPhone(''); }}
              className="px-4 py-2 text-neutral-500 bg-neutral-100 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

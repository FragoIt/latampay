'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  discount_rate: number;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDiscount, setNewDiscount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('name');
    if (data) setClients(data);
    setLoading(false);
  };

  const handleCreateClient = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('clients').insert({
      name: newName.trim(),
      phone: newPhone.trim(),
      discount_rate: newDiscount / 100,
    });

    if (!error) {
      loadClients();
      setShowForm(false);
      setNewName('');
      setNewPhone('');
      setNewDiscount(0);
    }
    setSaving(false);
  };

  const deleteClient = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await supabase.from('clients').delete().eq('id', id);
    loadClients();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Clientes</h1>
          <p className="text-sm text-neutral-400">{clients.length} registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 space-y-3">
          <p className="font-semibold text-amber-800 text-sm">Nuevo Cliente</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
            <input
              type="tel"
              placeholder="+52 555 123 4567"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Descuento %"
                value={newDiscount || ''}
                onChange={(e) => setNewDiscount(Number(e.target.value) || 0)}
                min="0"
                max="100"
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-sm text-neutral-400">%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateClient}
              disabled={saving || !newName.trim() || !newPhone.trim()}
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
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase px-4 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase px-4 py-3">Teléfono</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase px-4 py-3">Descuento</th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">{client.name}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{client.phone}</td>
                  <td className="px-4 py-3">
                    {client.discount_rate > 0 ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {(client.discount_rate * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="text-xs text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

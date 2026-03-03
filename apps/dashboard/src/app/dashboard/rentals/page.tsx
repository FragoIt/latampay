'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatOwnerMessage, formatClientMessage, generateWhatsAppURL, RentalData } from '@/lib/whatsapp';

interface Rental {
  id: string;
  order_number: number;
  client_name: string;
  client_phone: string;
  start_date: string;
  end_date: string;
  days: number;
  items_snapshot: { name: string; qty: number; daily_rate: number; subtotal: number }[];
  base_amount: number;
  shipping_cost: number;
  crew_cost: number;
  discount: number;
  final_amount: number;
  status: string;
  created_at: string;
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'returned' | 'all'>('active');

  useEffect(() => {
    loadRentals();
  }, [filter]);

  const loadRentals = async () => {
    setLoading(true);
    let query = supabase
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setRentals(data);
    setLoading(false);
  };

  const markReturned = async (id: string) => {
    await supabase.from('rentals').update({ status: 'returned' }).eq('id', id);
    loadRentals();
  };

  const resendWhatsApp = (rental: Rental, to: 'owner' | 'client') => {
    const rentalData: RentalData = {
      ...rental,
      items_snapshot: rental.items_snapshot,
    };
    const msg = to === 'owner' ? formatOwnerMessage(rentalData) : formatClientMessage(rentalData);
    const phone = to === 'owner' ? '+573014404962' : rental.client_phone;
    const url = generateWhatsAppURL(phone, msg);
    window.open(url, '_blank');
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate + 'T18:00:00') < new Date();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Rentas</h1>
          <p className="text-sm text-neutral-400">
            {rentals.length} renta{rentals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
          {(['active', 'returned', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                ? 'bg-white shadow-sm text-neutral-800'
                : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              {f === 'active' ? '📋 Activas' : f === 'returned' ? '✅ Devueltas' : '📁 Todas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neutral-400">Cargando...</div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-neutral-400">No hay rentas {filter === 'active' ? 'activas' : filter === 'returned' ? 'devueltas' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map(rental => (
            <div
              key={rental.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${rental.status === 'returned'
                ? 'border-neutral-200 opacity-60'
                : isOverdue(rental.end_date)
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-neutral-200'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-neutral-800">#{rental.order_number}</span>
                    <span className="text-sm text-neutral-600 font-medium">{rental.client_name}</span>
                    {rental.status === 'active' && isOverdue(rental.end_date) && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        Vencida
                      </span>
                    )}
                    {rental.status === 'returned' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        Devuelto
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-neutral-400 space-x-3">
                    <span>{rental.days} días</span>
                    <span>📞 {rental.client_phone}</span>
                    <span>Vence: {new Date(rental.end_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {rental.items_snapshot.map((item, idx) => (
                      <span key={idx} className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                        {item.qty}× {item.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-neutral-800">
                    ${rental.final_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {rental.status === 'active' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => resendWhatsApp(rental, 'owner')}
                    className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                  >
                    📲 WA Dueño
                  </button>
                  <button
                    onClick={() => resendWhatsApp(rental, 'client')}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    📲 WA Cliente
                  </button>
                  <button
                    onClick={() => markReturned(rental.id)}
                    className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg font-medium hover:bg-neutral-200 transition-colors ml-auto"
                  >
                    ✅ Marcar Devuelto
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

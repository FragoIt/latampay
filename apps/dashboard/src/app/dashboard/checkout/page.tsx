'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ClientSelector from './ClientSelector';
import ItemSelector, { SelectedItem } from './ItemSelector';
import ShippingModule from './ShippingModule';
import CrewCostInput from './CrewCostInput';
import {
  formatOwnerMessage,
  formatClientMessage,
  generateWhatsAppURL,
  logWhatsApp,
  RentalData,
} from '@/lib/whatsapp';

interface Client {
  id: string;
  name: string;
  phone: string;
  discount_rate: number;
}

export default function QuickCheckoutPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [days, setDays] = useState(3);
  const [shippingCost, setShippingCost] = useState(0);
  const [crewCost, setCrewCost] = useState(0);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [priceOverride, setPriceOverride] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedRental, setCompletedRental] = useState<RentalData | null>(null);

  // Calculations
  const baseAmount = items.reduce((sum, item) => sum + item.qty * item.daily_rate * days, 0);
  const clientDiscount = client?.discount_rate ? baseAmount * client.discount_rate : 0;
  const subtotal = baseAmount - clientDiscount - manualDiscount + shippingCost + crewCost;
  const finalAmount = priceOverride ? Number(priceOverride) : subtotal;
  const totalDiscount = clientDiscount + manualDiscount;

  const isValid = client && items.length > 0 && days > 0 && finalAmount > 0;

  const handleCheckout = async () => {
    if (!client || !isValid) return;
    setLoading(true);

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDateObj = new Date();
      endDateObj.setDate(endDateObj.getDate() + days);
      const endDate = endDateObj.toISOString().split('T')[0];

      const itemsSnapshot = items.map(item => ({
        name: item.name,
        qty: item.qty,
        daily_rate: item.daily_rate,
        subtotal: item.qty * item.daily_rate * days,
      }));

      const { data: rental, error } = await supabase
        .from('rentals')
        .insert({
          client_id: client.id,
          client_name: client.name,
          client_phone: client.phone,
          start_date: startDate,
          days,
          end_date: endDate,
          items_snapshot: itemsSnapshot,
          base_amount: baseAmount,
          shipping_cost: shippingCost,
          crew_cost: crewCost,
          discount: totalDiscount,
          final_amount: finalAmount,
          notes: notes || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const rentalData: RentalData = {
        id: rental.id,
        order_number: rental.order_number,
        client_name: client.name,
        client_phone: client.phone,
        start_date: startDate,
        end_date: endDate,
        days,
        items_snapshot: itemsSnapshot,
        base_amount: baseAmount,
        shipping_cost: shippingCost,
        crew_cost: crewCost,
        discount: totalDiscount,
        final_amount: finalAmount,
      };

      // Log WhatsApp messages
      await logWhatsApp(rental.id, 'owner', '+573014404962', formatOwnerMessage(rentalData));
      await logWhatsApp(rental.id, 'client', client.phone, formatClientMessage(rentalData));

      setCompletedRental(rentalData);
      toast.success(`✅ Renta #${rental.order_number} registrada!`);
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar la renta');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClient(null);
    setItems([]);
    setDays(3);
    setShippingCost(0);
    setCrewCost(0);
    setManualDiscount(0);
    setPriceOverride('');
    setNotes('');
    setCompletedRental(null);
  };

  // =============================================
  // SUCCESS STATE: Show WhatsApp buttons
  // =============================================
  if (completedRental) {
    const ownerURL = generateWhatsAppURL('+573014404962', formatOwnerMessage(completedRental));
    const clientURL = generateWhatsAppURL(completedRental.client_phone, formatClientMessage(completedRental));

    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Renta #{completedRental.order_number} Registrada
          </h1>
          <p className="text-neutral-500 mt-1">
            {completedRental.client_name} · {completedRental.days} días · ${completedRental.final_amount.toLocaleString()}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <a
            href={ownerURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-emerald-600 text-white py-4 rounded-2xl text-base font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <span className="text-xl">📲</span>
            Enviar WhatsApp al Dueño
          </a>

          <a
            href={clientURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <span className="text-xl">📲</span>
            Enviar WhatsApp al Cliente
          </a>
        </div>

        {/* Preview del mensaje */}
        <details className="bg-neutral-100 rounded-xl p-4 mb-6">
          <summary className="text-sm font-medium text-neutral-600 cursor-pointer">
            Ver mensaje del Dueño
          </summary>
          <pre className="mt-3 text-xs text-neutral-700 whitespace-pre-wrap bg-white rounded-lg p-3 border">
            {formatOwnerMessage(completedRental)}
          </pre>
        </details>

        <details className="bg-neutral-100 rounded-xl p-4 mb-6">
          <summary className="text-sm font-medium text-neutral-600 cursor-pointer">
            Ver mensaje del Cliente
          </summary>
          <pre className="mt-3 text-xs text-neutral-700 whitespace-pre-wrap bg-white rounded-lg p-3 border">
            {formatClientMessage(completedRental)}
          </pre>
        </details>

        <button
          onClick={handleReset}
          className="w-full py-3 text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-colors"
        >
          ← Nueva Renta
        </button>
      </div>
    );
  }

  // =============================================
  // CHECKOUT FORM
  // =============================================
  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-800 tracking-tight">
          Registrar Salida
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Registra la renta, calcula el precio y envía WhatsApp al instante
        </p>
      </div>

      <div className="space-y-5">
        {/* 1. Client */}
        <ClientSelector value={client} onChange={setClient} />

        {/* 2. Items */}
        <ItemSelector items={items} onChange={setItems} />

        {/* 3. Days */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            📅 Días de Renta
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${days === d
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-amber-300 hover:text-amber-600'
                  }`}
              >
                {d}
              </button>
            ))}
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
              min="1"
              className="w-20 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Otro"
            />
          </div>
        </div>

        {/* 4. Optional costs */}
        <div className="space-y-3">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Costos Adicionales (opcional)
          </p>
          <ShippingModule equipmentValue={baseAmount} onChange={setShippingCost} />
          <CrewCostInput onChange={setCrewCost} />
        </div>

        {/* 5. Notes */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            📝 Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas internas, dirección de entrega, etc."
            rows={2}
            className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {/* ========================================= */}
        {/* PRICING SUMMARY */}
        {/* ========================================= */}
        {items.length > 0 && (
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-5 text-white shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
              Resumen
            </h3>

            {/* Item breakdown */}
            <div className="space-y-1.5 mb-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-300">
                    {item.qty}× {item.name} × {days}d
                  </span>
                  <span className="text-neutral-200 font-medium">
                    ${(item.qty * item.daily_rate * days).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-700 pt-2 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Equipos</span>
                <span className="text-neutral-200">${baseAmount.toLocaleString()}</span>
              </div>

              {shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">🚚 Envío</span>
                  <span className="text-neutral-200">${shippingCost.toLocaleString()}</span>
                </div>
              )}

              {crewCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">👷 Crew</span>
                  <span className="text-neutral-200">${crewCost.toLocaleString()}</span>
                </div>
              )}

              {clientDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">
                    Desc. cliente ({((client?.discount_rate || 0) * 100).toFixed(0)}%)
                  </span>
                  <span className="text-emerald-400">-${clientDiscount.toLocaleString()}</span>
                </div>
              )}

              {manualDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Descuento manual</span>
                  <span className="text-emerald-400">-${manualDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Manual discount input */}
            <div className="mt-3 pt-3 border-t border-neutral-700">
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500 whitespace-nowrap">Descuento $</label>
                <input
                  type="number"
                  value={manualDiscount || ''}
                  onChange={(e) => setManualDiscount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  min="0"
                  className="flex-1 bg-neutral-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-4 pt-3 border-t border-neutral-600">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-amber-400">💰 TOTAL</span>
                <span className="text-2xl font-extrabold text-white">
                  ${finalAmount.toLocaleString()}
                </span>
              </div>

              {/* Override */}
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-neutral-500 whitespace-nowrap">
                  Override precio final $
                </label>
                <input
                  type="number"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  placeholder={subtotal.toString()}
                  min="0"
                  className="flex-1 bg-neutral-700 text-amber-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-neutral-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-6 p-4 md:p-0 bg-white/80 md:bg-transparent backdrop-blur-lg md:backdrop-blur-none border-t md:border-0 border-neutral-200 z-30">
        <button
          onClick={handleCheckout}
          disabled={!isValid || loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl text-lg font-extrabold hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-amber-200/50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registrando...
            </span>
          ) : (
            `💰 Registrar Salida${finalAmount > 0 ? ` · $${finalAmount.toLocaleString()}` : ''}`
          )}
        </button>
      </div>
    </div>
  );
}

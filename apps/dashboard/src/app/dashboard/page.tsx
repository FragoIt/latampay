'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateDailyReportData, formatDailyReportMessage, DailyReportData } from '@/lib/daily-report';
import { generateWhatsAppURL } from '@/lib/whatsapp';
import Link from 'next/link';

interface DashStats {
  activeRentals: number;
  todayRevenue: number;
  overdueCount: number;
  totalClients: number;
}

const OWNER_PHONE = '+573014404962'; // Configured with real owner number

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats>({
    activeRentals: 0,
    todayRevenue: 0,
    overdueCount: 0,
    totalClients: 0,
  });
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [activeRes, todayRes, overdueRes, clientsRes, recentRes] = await Promise.all([
      supabase.from('rentals').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('rentals').select('final_amount').gte('created_at', today + 'T00:00:00'),
      supabase.from('rentals').select('id', { count: 'exact', head: true }).eq('status', 'active').lt('end_date', today),
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('rentals').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    const todayRevenue = (todayRes.data || []).reduce((sum: number, r: any) => sum + (r.final_amount || 0), 0);

    setStats({
      activeRentals: activeRes.count || 0,
      todayRevenue,
      overdueCount: overdueRes.count || 0,
      totalClients: clientsRes.count || 0,
    });

    setRecentRentals(recentRes.data || []);
    setLoading(false);
  };

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const data = await generateDailyReportData();
      const message = formatDailyReportMessage(data);
      setReportData(data);
      setReportMessage(message);
    } catch (err) {
      console.error(err);
    }
    setLoadingReport(false);
  };

  const handleSendReport = () => {
    if (!reportMessage) return;
    const url = generateWhatsAppURL(OWNER_PHONE, reportMessage);
    window.open(url, '_blank');
  };

  const kpiCards = [
    { label: 'Rentas Activas', value: stats.activeRentals, icon: '📋', color: 'from-blue-500 to-blue-600' },
    { label: 'Facturado Hoy', value: `$${stats.todayRevenue.toLocaleString()}`, icon: '💰', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Vencidas', value: stats.overdueCount, icon: '⚠️', color: stats.overdueCount > 0 ? 'from-red-500 to-red-600' : 'from-neutral-400 to-neutral-500' },
    { label: 'Clientes', value: stats.totalClients, icon: '👥', color: 'from-purple-500 to-purple-600' },
  ];

  if (loading) {
    return (
      <div className="text-center py-20 text-neutral-400">Cargando dashboard...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Dashboard</h1>
          <p className="text-sm text-neutral-400">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/dashboard/checkout"
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200/50"
        >
          ⚡ Quick Checkout
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-800">{kpi.value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ============================== */}
      {/* DAILY REPORT PANEL */}
      {/* ============================== */}
      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-5 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              📊 Reporte Diario
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Genera y envía el resumen del día al dueño por WhatsApp
            </p>
          </div>
          {!reportData && (
            <button
              onClick={handleGenerateReport}
              disabled={loadingReport}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-all"
            >
              {loadingReport ? 'Generando...' : '📊 Generar Reporte'}
            </button>
          )}
        </div>

        {reportData && (
          <div className="animate-fade-in">
            {/* Report Preview */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{reportData.activeRentals}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Activas</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-amber-400">${reportData.weekRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Semana</p>
              </div>
              <div className={`bg-white/10 rounded-xl p-3 text-center ${reportData.overdueRentals.length > 0 ? 'ring-1 ring-red-500/50' : ''}`}>
                <p className={`text-2xl font-extrabold ${reportData.overdueRentals.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {reportData.overdueRentals.length}
                </p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Vencidas</p>
              </div>
            </div>

            {/* Overdue alerts */}
            {reportData.overdueRentals.length > 0 && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2">
                  🔴 Cobros Vencidos
                </p>
                {reportData.overdueRentals.map((r, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-neutral-300">#{r.order_number} {r.client_name}</span>
                    <span className="font-bold text-red-300">${r.final_amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Due today */}
            {reportData.todayReturns.length > 0 && (
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  ⚠️ Vencen Hoy
                </p>
                {reportData.todayReturns.map((r, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-neutral-300">#{r.order_number} {r.client_name}</span>
                    <span className="font-bold text-amber-300">${r.final_amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Message preview */}
            <details className="mb-4">
              <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-300 transition-colors">
                Ver mensaje completo
              </summary>
              <pre className="mt-2 text-xs text-neutral-300 whitespace-pre-wrap bg-black/30 rounded-lg p-3 max-h-48 overflow-y-auto">
                {reportMessage}
              </pre>
            </details>

            {/* Send buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSendReport}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">📲</span>
                Enviar al Dueño por WhatsApp
              </button>
              <button
                onClick={() => { setReportData(null); setReportMessage(''); }}
                className="px-4 py-3 bg-white/10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/20 transition-all text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access */}
      <div className="mb-6">
        <Link
          href="/dashboard/checkout"
          className="block w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <p className="text-3xl mb-2">⚡</p>
          <p className="text-lg font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
            Registrar Nueva Salida
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            Calcula precio automático y envía WhatsApp al instante
          </p>
        </Link>
      </div>

      {/* Recent Rentals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Rentas Recientes</h2>
          <Link href="/dashboard/rentals" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
            Ver todas →
          </Link>
        </div>

        {recentRentals.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-neutral-200">
            <p className="text-neutral-400 text-sm">No hay rentas registradas aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRentals.map((rental) => (
              <div
                key={rental.id}
                className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${rental.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`} />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      #{rental.order_number} — {rental.client_name}
                    </p>
                    <p className="text-xs text-neutral-400">{rental.days} días</p>
                  </div>
                </div>
                <span className="font-bold text-neutral-800">${rental.final_amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

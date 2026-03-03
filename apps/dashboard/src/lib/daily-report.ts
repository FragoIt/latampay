import { supabase } from './supabase';
import { generateWhatsAppURL } from './whatsapp';

// =============================================
// Daily Report Generator
// Genera el reporte diario matutino para el dueño
// =============================================

export interface DailyReportData {
  date: string;
  activeRentals: number;
  overdueRentals: { order_number: number; client_name: string; end_date: string; final_amount: number }[];
  todayReturns: { order_number: number; client_name: string; final_amount: number }[];
  weekRevenue: number;
  totalOutstanding: number;
  recentRentals: { order_number: number; client_name: string; final_amount: number; days: number; created_at: string }[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()}-${months[date.getMonth()]}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Consulta Supabase y genera los datos del reporte diario
 */
export async function generateDailyReportData(): Promise<DailyReportData> {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [activeRes, overdueRes, todayReturnsRes, weekRevenueRes, recentRes] = await Promise.all([
    // Active rentals count
    supabase.from('rentals').select('id', { count: 'exact', head: true }).eq('status', 'active'),

    // Overdue rentals (active but past end_date)
    supabase
      .from('rentals')
      .select('order_number, client_name, end_date, final_amount')
      .eq('status', 'active')
      .lt('end_date', today)
      .order('end_date', { ascending: true }),

    // Rentals due today
    supabase
      .from('rentals')
      .select('order_number, client_name, final_amount')
      .eq('status', 'active')
      .eq('end_date', today),

    // Revenue this week
    supabase
      .from('rentals')
      .select('final_amount')
      .gte('created_at', weekAgo + 'T00:00:00'),

    // Most recent rentals
    supabase
      .from('rentals')
      .select('order_number, client_name, final_amount, days, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const weekRevenue = (weekRevenueRes.data || []).reduce((sum, r) => sum + (r.final_amount || 0), 0);

  // Total outstanding (all active rentals)
  const { data: allActive } = await supabase
    .from('rentals')
    .select('final_amount')
    .eq('status', 'active');
  const totalOutstanding = (allActive || []).reduce((sum, r) => sum + (r.final_amount || 0), 0);

  return {
    date: today,
    activeRentals: activeRes.count || 0,
    overdueRentals: overdueRes.data || [],
    todayReturns: todayReturnsRes.data || [],
    weekRevenue,
    totalOutstanding,
    recentRentals: recentRes.data || [],
  };
}

/**
 * Formatea el reporte como texto para WhatsApp
 */
export function formatDailyReportMessage(data: DailyReportData): string {
  const dateStr = formatDate(data.date);

  let msg = `📊 *REPORTE DIARIO — ${dateStr}*\n\n`;
  msg += `📋 Rentas activas: ${data.activeRentals}\n`;
  msg += `💰 Facturado esta semana: ${formatCurrency(data.weekRevenue)}\n`;
  msg += `💵 Total por cobrar (activas): ${formatCurrency(data.totalOutstanding)}\n`;

  // Overdue section
  if (data.overdueRentals.length > 0) {
    msg += `\n🔴 *VENCIDAS (${data.overdueRentals.length}):*\n`;
    for (const r of data.overdueRentals) {
      msg += `• #${r.order_number} ${r.client_name} — ${formatCurrency(r.final_amount)} (venció ${formatDate(r.end_date)})\n`;
    }
  } else {
    msg += `\n✅ Sin rentas vencidas\n`;
  }

  // Due today
  if (data.todayReturns.length > 0) {
    msg += `\n⚠️ *VENCEN HOY (${data.todayReturns.length}):*\n`;
    for (const r of data.todayReturns) {
      msg += `• #${r.order_number} ${r.client_name} — ${formatCurrency(r.final_amount)}\n`;
    }
  }

  // Recent activity
  if (data.recentRentals.length > 0) {
    msg += `\n📈 *Últimas rentas:*\n`;
    for (const r of data.recentRentals) {
      msg += `• #${r.order_number} ${r.client_name} — ${formatCurrency(r.final_amount)} (${r.days}d)\n`;
    }
  }

  msg += `\n—\n_Reporte generado por Rentazt_`;

  return msg;
}

/**
 * Genera la URL de WhatsApp con el reporte diario pre-formateado
 */
export async function generateDailyReportWhatsAppURL(ownerPhone: string): Promise<{ url: string; data: DailyReportData; message: string }> {
  const data = await generateDailyReportData();
  const message = formatDailyReportMessage(data);
  const url = generateWhatsAppURL(ownerPhone, message);
  return { url, data, message };
}

import { supabase } from './supabase';

// =============================================
// WhatsApp Native Link Generator + Message Formatter
// Usa wa.me para envío nativo desde el dispositivo del operador
// =============================================

export interface RentalData {
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
}

const OWNER_PHONE = '+573014404962'; // Owner's real number

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()}-${months[date.getMonth()]}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatOwnerMessage(rental: RentalData): string {
  const itemsList = rental.items_snapshot
    .map(item => `• ${item.qty} ${item.name}`)
    .join('\n');

  let desglose = `Equipos: ${formatCurrency(rental.base_amount)}`;
  if (rental.shipping_cost > 0) {
    desglose += `\nEnvío: ${formatCurrency(rental.shipping_cost)}`;
  }
  if (rental.crew_cost > 0) {
    desglose += `\nCrew: ${formatCurrency(rental.crew_cost)}`;
  }
  if (rental.discount > 0) {
    desglose += `\nDescuento: -${formatCurrency(rental.discount)}`;
  }

  return `🔔 *NUEVA RENTA #${rental.order_number}*

Cliente: ${rental.client_name}
📞 ${rental.client_phone}

Equipos:
${itemsList}

Periodo: ${formatDate(rental.start_date)} a ${formatDate(rental.end_date)} (${rental.days} días)

💰 *TOTAL A COBRAR: ${formatCurrency(rental.final_amount)}*

Desglose:
${desglose}

Vence: ${formatDate(rental.end_date)} a las 6:00 PM`;
}

export function formatClientMessage(rental: RentalData): string {
  const itemsList = rental.items_snapshot
    .map(item => `• ${item.qty} ${item.name}`)
    .join('\n');

  const firstName = rental.client_name.split(' ')[0];

  return `✅ *Renta Confirmada - Orden #${rental.order_number}*

Hola ${firstName},

Equipos rentados:
${itemsList}

Periodo: ${formatDate(rental.start_date)} a ${formatDate(rental.end_date)}

💰 Total: ${formatCurrency(rental.final_amount)}

⚠️ Devolver antes: ${formatDate(rental.end_date)} 6:00 PM
Multa por retraso: $150/día adicional

¿Preguntas? Responde este mensaje.`;
}

/**
 * Genera URL wa.me con texto pre-codificado
 * Se abre en la app nativa de WhatsApp del operador
 */
export function generateWhatsAppURL(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
}

/**
 * Abre WhatsApp nativo para enviar mensaje al dueño
 */
export function sendToOwner(rental: RentalData): string {
  const message = formatOwnerMessage(rental);
  return generateWhatsAppURL(OWNER_PHONE, message);
}

/**
 * Abre WhatsApp nativo para enviar mensaje al cliente
 */
export function sendToClient(rental: RentalData): string {
  const message = formatClientMessage(rental);
  return generateWhatsAppURL(rental.client_phone, message);
}

/**
 * Guarda log del envío de WhatsApp en la base de datos
 */
export async function logWhatsApp(
  rentalId: string,
  recipient: 'owner' | 'client',
  phone: string,
  message: string
) {
  const { error } = await supabase.from('whatsapp_log').insert({
    rental_id: rentalId,
    recipient,
    phone,
    message,
  });

  if (error) {
    console.error('Error logging WhatsApp:', error);
  }
}


import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'rentazt_verify_token';
// In production, these should be env vars
// const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
// const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

serve(async (req) => {
  const method = req.method;
  const url = new URL(req.url);

  // 1. Verification Request (GET)
  if (method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // 2. Incoming Messages (POST)
  if (method === 'POST') {
    try {
      const body = await req.json();

      // Basic logging of the payload
      console.log('Incoming webhook:', JSON.stringify(body, null, 2));

      // Handle entries
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value;

            // Handle messages
            if (value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              const from = message.from; // Phone number
              const type = message.type;
              let content = {};

              if (type === 'text') {
                content = { text: message.text.body };
                const command = message.text.body.toLowerCase().trim();

                // Initialize Supabase client
                const supabase = createClient(
                  Deno.env.get('SUPABASE_URL') ?? '',
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );

                // Log inbound message
                await supabase.from('whatsapp_log').insert({
                  phone_number: from,
                  direction: 'inbound',
                  message_type: 'text',
                  content: content,
                  external_id: message.id,
                  status: 'delivered'
                });

                // --- BOT LOGIC START ---
                // Simulación de respuesta automática (en prod, usaríamos Meta Cloud API para responder)
                // Por ahora, solo logueamos qué responderíamos

                let responseText = '';

                if (command.includes('resumen')) {
                  // Calculate simplified stats
                  const { count: activeCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'active');
                  const { data: overdue } = await supabase.from('rentals').select('id').eq('status', 'active').lt('end_date', new Date().toISOString().split('T')[0]);
                  responseText = `📊 *Resumen Rentazt*\n\n✅ Activas: ${activeCount}\n⚠️ Vencidas: ${overdue?.length || 0}\n\nEscribe *vencidas* para ver detalles.`;
                } else if (command.includes('vencidas')) {
                  const { data: rentals } = await supabase.from('rentals')
                    .select('*, clients(name)')
                    .eq('status', 'active')
                    .lt('end_date', new Date().toISOString().split('T')[0])
                    .limit(5);

                  if (!rentals || rentals.length === 0) {
                    responseText = '✅ No tienes rentas vencidas por cobrar.';
                  } else {
                    responseText = '⚠️ *Rentas Vencidas*:\n\n' + rentals.map(r => `• ${r.clients?.name}: Venció ${r.end_date}`).join('\n');
                  }
                } else if (command.includes('cobrar')) {
                  const { data: pending } = await supabase.from('rentals')
                    .select('total_amount, clients(name)')
                    .neq('payment_status', 'paid')
                    .limit(5);

                  const total = pending?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
                  if (total === 0) {
                    responseText = '💰 Todo al día. No hay cobros pendientes.';
                  } else {
                    responseText = `💰 *Por Cobrar*: $${total.toLocaleString()}\n\nPendientes recientes:\n` + pending?.map(r => `• ${r.clients?.name}: $${(r.total_amount || 0).toLocaleString()}`).join('\n');
                  }
                } else {
                  responseText = '🤖 *Rentazt Bot*\n\nComandos disponibles:\n• *resumen*: Estado general\n• *vencidas*: Lista de alertas\n• *cobrar*: Dinero pendiente';
                }

                // Log outbound response (simulated)
                console.log(`[BOT RESPONSE] To ${from}: ${responseText}`);
                await supabase.from('whatsapp_log').insert({
                  phone_number: from,
                  direction: 'outbound',
                  message_type: 'text',
                  content: { text: responseText },
                  status: 'sent'
                });
                // --- BOT LOGIC END ---

              }
            }
          }
        }
      }

      return new Response('OK', { status: 200 });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return new Response('Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});

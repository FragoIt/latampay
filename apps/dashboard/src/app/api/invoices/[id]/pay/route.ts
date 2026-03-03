import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a public Supabase client for unauthenticated access
// The payer is NOT authenticated - they just have the invoice link
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validate tx_hash format (basic check for Ethereum-style hash)
function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

// Validate Ethereum address format
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// POST /api/invoices/[id]/pay - Mark invoice as paid (called by payer after blockchain tx)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { tx_hash, payer_address, chain_id } = body;

    // Validate required fields
    if (!tx_hash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Validate tx_hash format
    if (!isValidTxHash(tx_hash)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }

    // Validate payer_address if provided
    if (payer_address && !isValidAddress(payer_address)) {
      return NextResponse.json(
        { error: 'Invalid payer address format' },
        { status: 400 }
      );
    }

    // First, verify the invoice exists and is still pending
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, tx_hash')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if already paid (idempotency)
    if (existingInvoice.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Invoice already marked as paid',
        invoice: existingInvoice,
      });
    }

    // Check if invoice is cancelled
    if (existingInvoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot pay a cancelled invoice' },
        { status: 400 }
      );
    }

    // Update invoice status to paid
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        tx_hash: tx_hash,
        paid_at: new Date().toISOString(),
        payer_address: payer_address || null,
      })
      .eq('id', params.id)
      .eq('status', 'pending') // Double-check status to prevent race conditions
      .select()
      .single();

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      );
    }

    // Log the payment confirmation for audit trail
    // This is fire-and-forget, we don't block the response
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    supabase
      .from('payment_confirmations')
      .insert({
        invoice_id: params.id,
        tx_hash: tx_hash,
        payer_address: payer_address || null,
        chain_id: chain_id || null,
        ip_address: clientIp,
        user_agent: userAgent,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to log payment confirmation:', error);
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      invoice: updatedInvoice,
    });

  } catch (error) {
    console.error('Error processing payment confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

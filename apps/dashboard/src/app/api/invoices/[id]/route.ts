import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a public client for unauthenticated access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Return invoice data (without sensitive user info)
    return NextResponse.json({
      id: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      status: invoice.status,
      client_email: invoice.client_email,
      created_at: invoice.created_at,
      payment_id: invoice.payment_id,
      tx_hash: invoice.tx_hash,
      // Add merchant info if available
      merchant_address: invoice.merchant_address,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for invoice creation
const createInvoiceSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1_000_000, 'Amount cannot exceed 1,000,000'),
  currency: z.enum(['USDC', 'USDT'], {
    errorMap: () => ({ message: 'Currency must be USDC or USDT' }),
  }),
  description: z.string().max(500, 'Description too long').optional(),
  client_email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = createInvoiceSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, currency, description, client_email } = validation.data;

    // Create authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get merchant profile to get wallet address
    const { data: merchantProfile, error: profileError } = await supabase
      .from('merchant_profiles')
      .select('wallet_address, business_name')
      .eq('id', user.id)
      .single();

    if (profileError || !merchantProfile) {
      return NextResponse.json(
        { 
          error: 'Please configure your wallet address in settings before creating invoices',
          code: 'WALLET_NOT_CONFIGURED'
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!merchantProfile.wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(merchantProfile.wallet_address)) {
      return NextResponse.json(
        { 
          error: 'Invalid wallet address configured. Please update your settings.',
          code: 'INVALID_WALLET'
        },
        { status: 400 }
      );
    }

    // Create the invoice
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        amount,
        currency,
        description: description || null,
        client_email,
        status: 'pending',
        merchant_address: merchantProfile.wallet_address,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invoice:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    // Generate payment link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentLink = `${baseUrl}/pay/${invoice.id}`;

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        description: invoice.description,
        client_email: invoice.client_email,
        status: invoice.status,
        created_at: invoice.created_at,
        payment_link: paymentLink,
      },
      message: 'Invoice created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: List invoices for authenticated user
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('invoices')
      .select('id, amount, currency, description, status, client_email, created_at, tx_hash, paid_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoices: invoices || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

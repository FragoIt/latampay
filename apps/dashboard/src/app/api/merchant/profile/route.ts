import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for merchant profile
const merchantProfileSchema = z.object({
  wallet_address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
  business_name: z.string().max(200).optional(),
  business_type: z.enum(['freelancer', 'agency', 'saas', 'ecommerce', 'other']).optional(),
  country: z.string().length(2).optional(), // ISO country code
  tax_id: z.string().max(50).optional(),
});

// GET: Fetch merchant profile
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from('merchant_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching merchant profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: profile || null,
      hasProfile: !!profile,
    });

  } catch (error) {
    console.error('Error in GET /api/merchant/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update merchant profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = merchantProfileSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { wallet_address, business_name, business_type, country, tax_id } = validation.data;

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Upsert profile (insert or update)
    const { data: profile, error } = await supabase
      .from('merchant_profiles')
      .upsert({
        id: user.id,
        wallet_address,
        business_name: business_name || null,
        business_type: business_type || null,
        country: country || 'MX',
        tax_id: tax_id || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving merchant profile:', error);
      
      // Check for specific constraint violations
      if (error.code === '23514') { // check_violation
        return NextResponse.json(
          { error: 'Invalid wallet address format' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile,
      message: 'Profile saved successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/merchant/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

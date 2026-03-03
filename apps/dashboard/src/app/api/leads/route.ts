import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, companyName, monthlyVolume, currentFeePercent, calculatedSavings, source, utmSource, utmMedium, utmCampaign } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email válido requerido' },
        { status: 400 }
      );
    }

    // Insert lead
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          email,
          company_name: companyName || null,
          monthly_volume: monthlyVolume || null,
          current_fee_percent: currentFeePercent || null,
          calculated_savings: calculatedSavings || null,
          source: source || 'calculator',
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      return NextResponse.json(
        { error: 'Error guardando información' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '¡Gracias! Te contactaremos pronto.',
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

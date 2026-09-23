import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from('liste_attente_maillot').upsert({ email }, { onConflict: 'email' });
  }

  return NextResponse.json({ ok: true });
}

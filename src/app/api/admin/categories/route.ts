import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const supabase = getAdminSupabase();
    
    // Check if duplicate prefix or name
    const { data: existing } = await supabase.from('categories')
      .select('id')
      .or(`nome.ilike.${json.nome},prefixo.ilike.${json.prefixo}`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Já existe uma categoria com esse nome ou prefixo.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        nome: json.nome,
        prefixo: json.prefixo.toUpperCase(),
        icone: json.icone || 'folder',
        cor: json.cor || '#00BCFF',
        descricao: json.descricao || null
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

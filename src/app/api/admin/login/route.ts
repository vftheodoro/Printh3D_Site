import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { verifyPassword, createAdminSession } from '@/lib/admin-auth';

// Simple in-memory rate limiting (for demo/small scale)
const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const rateLimit = rateLimits.get(ip);
    
    // Check rate limit: max 5 attempts per 15 mins
    if (rateLimit && now < rateLimit.expiresAt && rateLimit.count >= 5) {
      return NextResponse.json({ error: 'Muitas tentativas falhas. Tente novamente em 15 minutos.' }, { status: 429 });
    }

    const { email: rawEmail, password } = await request.json();

    if (!rawEmail || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    const supabase = getAdminSupabase();
    
    // Fetch user from admin_users
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Record failed attempt
      const count = rateLimit && now < rateLimit.expiresAt ? rateLimit.count + 1 : 1;
      rateLimits.set(ip, { count, expiresAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Verify password using bcrypt
    const isValid = await verifyPassword(password, user.senha_hash);

    if (!isValid) {
      const count = rateLimit && now < rateLimit.expiresAt ? rateLimit.count + 1 : 1;
      rateLimits.set(ip, { count, expiresAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Reset rate limit on success
    rateLimits.delete(ip);

    // Create JWT Session string
    const token = await createAdminSession(user.id, user.email);

    // Set cookie on response
    const response = NextResponse.json({ success: true, user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo } });
    
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    if (
      typeof error?.message === 'string' &&
      (error.message.includes('Missing required environment variable') ||
        (error.message.includes('Missing ') && error.message.includes('environment variable')))
    ) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta. Defina as variáveis de ambiente do Supabase e ADMIN_JWT_SECRET e tente novamente.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

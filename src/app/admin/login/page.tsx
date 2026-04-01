'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShake(false);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar login');
      }

      window.location.href = '/admin';
      
    } catch (err: any) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-logo">
          <div className="logo-icon-wrap">
            <Box size={28} strokeWidth={2} />
          </div>
          <h1>Printh3D <span>PRO</span></h1>
          <p>Sistema de Gestão Integrado</p>
        </div>

        {error && <div className="login-error" style={{ display: 'block' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@printh3d.com" 
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha de acesso" 
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <LogIn size={15} /> {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="login-info">
          <p>
            Acesso restrito para administradores e equipe <strong>Printh3D</strong>.<br />
            Certifique-se de estar em uma rede segura.
          </p>
        </div>
      </div>
    </div>
  );
}

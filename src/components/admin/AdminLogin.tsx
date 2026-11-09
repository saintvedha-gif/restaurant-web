import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setLoading(true);
    setError('');

    try {
      await apiFetch<{ email: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      window.location.href = '/admin';
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  const input =
    'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3 px-5">
      <h1 className="title-pixel text-center text-2xl text-white">Panel Mucha Mazorca 🌽</h1>
      <input className={input} type="email" placeholder="Correo" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input
        className={input}
        type="password"
        placeholder="Contraseña"
        autoComplete="current-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className="rounded-xl bg-yellow-400 py-3 text-base font-black text-black disabled:opacity-50 active:scale-95"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </div>
  );
}

import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="relative">
        <input
          className={`${input} pr-12`}
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(visible => !visible)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/60 hover:text-yellow-300"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            {showPassword ? (
              <>
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.9M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.4 3.8-.9" />
              </>
            )}
          </svg>
        </button>
      </div>
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

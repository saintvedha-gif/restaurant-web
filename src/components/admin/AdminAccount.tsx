import { useState, type FormEvent } from 'react';
import { apiFetch } from '../../lib/api';

interface Props {
  email: string;
  onEmailChange: (email: string) => void;
}

const input =
  'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';
const label = 'mb-1 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow-300';

export default function AdminAccount({ email, onEmailChange }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!newEmail.trim() && !newPassword) {
      setError('Escribe un correo nuevo, una contrasena nueva o ambos.');
      return;
    }
    if (newPassword && newPassword.length < 12) {
      setError('La nueva contrasena debe tener al menos 12 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmacion de la contrasena no coincide.');
      return;
    }

    setSaving(true);
    try {
      const updated = await apiFetch<{ email: string }>('/api/auth/credentials', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          ...(newEmail.trim() ? { newEmail: newEmail.trim() } : {}),
          ...(newPassword ? { newPassword, confirmPassword } : {}),
        }),
      });
      onEmailChange(updated.email);
      setCurrentPassword('');
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Datos de acceso actualizados. Esta sesión sigue activa.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron actualizar los datos.');
    } finally {
      setSaving(false);
    }
  }

  function passwordField(
    id: string,
    value: string,
    onChange: (value: string) => void,
    visible: boolean,
    toggleVisibility: () => void,
    options: { autoComplete?: string; required?: boolean; disabled?: boolean; minLength?: number; describedBy?: string } = {}
  ) {
    return (
      <div className="relative">
        <input
          id={id}
          className={`${input} pr-12`}
          type={visible ? 'text' : 'password'}
          autoComplete={options.autoComplete}
          value={value}
          onChange={event => onChange(event.target.value)}
          required={options.required}
          disabled={options.disabled}
          minLength={options.minLength}
          aria-describedby={options.describedBy}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          disabled={options.disabled}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/60 hover:text-yellow-300 disabled:opacity-40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            {visible ? (
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
    );
  }

  return (
    <section className="space-y-4 pb-8">
      <div className="space-y-4 rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4">
        <div>
          <h1 className="title-pixel text-lg text-white">Cuenta del panel</h1>
          <p className="mt-2 text-sm text-white/60">Cambia el correo, la contrasena o ambos. Para confirmar cualquier cambio debes verificar tu contrasena actual.</p>
        </div>

        <div>
          <p className={label}>Correo actual</p>
          <p className="break-all rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-sm text-white/80">{email}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={label} htmlFor="account-current-password">Contrasena actual</label>
            {passwordField(
              'account-current-password',
              currentPassword,
              setCurrentPassword,
              visiblePasswords.current,
              () => setVisiblePasswords(state => ({ ...state, current: !state.current })),
              { autoComplete: 'current-password', required: true }
            )}
          </div>

          <div>
            <label className={label} htmlFor="account-new-email">Correo nuevo (opcional)</label>
            <input
              id="account-new-email"
              className={input}
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={event => setNewEmail(event.target.value)}
              placeholder="nuevo@correo.com"
            />
          </div>

          <div>
            <label className={label} htmlFor="account-new-password">Contrasena nueva (opcional)</label>
            {passwordField(
              'account-new-password',
              newPassword,
              setNewPassword,
              visiblePasswords.new,
              () => setVisiblePasswords(state => ({ ...state, new: !state.new })),
              { autoComplete: 'new-password', minLength: 12, describedBy: 'account-password-help' }
            )}
            <p id="account-password-help" className="mt-1 text-xs text-white/50">Usa al menos 12 caracteres.</p>
          </div>

          <div>
            <label className={label} htmlFor="account-confirm-password">Confirmar contrasena nueva</label>
            {passwordField(
              'account-confirm-password',
              confirmPassword,
              setConfirmPassword,
              visiblePasswords.confirm,
              () => setVisiblePasswords(state => ({ ...state, confirm: !state.confirm })),
              { autoComplete: 'new-password', disabled: !newPassword, required: Boolean(newPassword) }
            )}
          </div>

          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
          {message && <p className="text-sm text-[#00C853]" role="status">{message}</p>}

          <button
            type="submit"
            disabled={saving || !currentPassword}
            className="w-full rounded-xl bg-yellow-400 py-3 text-base font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar datos de acceso'}
          </button>
        </form>
      </div>
    </section>
  );
}

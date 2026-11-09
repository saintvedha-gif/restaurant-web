import { useEffect, useState } from 'react';
import { canPromptInstall, isIosDevice, isStandalone, promptInstall, subscribePwa } from '../lib/pwa';

interface Props {
  className?: string;
}

export default function InstallButton({ className = '' }: Props) {
  const [, setTick] = useState(0);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => subscribePwa(() => setTick(t => t + 1)), []);

  if (isStandalone()) return null;
  const ios = isIosDevice();
  if (!canPromptInstall() && !ios) return null;

  function handleClick() {
    if (canPromptInstall()) promptInstall();
    else setShowIos(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-yellow-300 transition-all active:scale-95 ${className}`}
      >
        ⬇️ Instalar app
      </button>

      {showIos && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowIos(false)}>
          <div className="w-full max-w-sm space-y-3 rounded-[24px] border border-yellow-400/30 bg-[#101014] p-5 text-white" onClick={e => e.stopPropagation()}>
            <p className="title-pixel text-base">Instala Mucha Mazorca 🌽</p>
            <p className="text-sm text-white/75">En iPhone se hace desde Safari:</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-white/85">
              <li>Toca el botón Compartir (el cuadrito con la flecha).</li>
              <li>Baja y toca "Agregar a inicio".</li>
              <li>Toca "Agregar". Listo, ya tienes el ícono.</li>
            </ol>
            <button type="button" onClick={() => setShowIos(false)} className="w-full rounded-xl bg-yellow-400 py-3 text-sm font-black text-black">
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

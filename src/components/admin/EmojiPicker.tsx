import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const EMOJIS = [
  '🌽', '🍔', '🍟', '🌭', '🥓', '🧀', '🍗', '🥩', '🥔', '🍌', '🥚', '🌶️',
  '🍕', '🌮', '🌯', '🥪', '🍿', '🍰', '🍩', '🍪', '🍫', '🍦', '🍹', '🥤',
  '🍋', '🍓', '🍍', '🥭', '🧋', '✨', '🔥', '💛', '❤️', '⭐', '🎉', '😋',
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  separator?: string;
  compact?: boolean;
  maxLength?: number;
}

export default function EmojiPicker({ value, onChange, separator = '', compact = false, maxLength }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !pickerRef.current?.contains(target)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    function closeOnViewportChange() {
      setOpen(false);
    }

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnViewportChange);
    window.addEventListener('scroll', closeOnViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnViewportChange);
      window.removeEventListener('scroll', closeOnViewportChange, true);
    };
  }, [open]);

  function togglePicker() {
    if (open) {
      setOpen(false);
      return;
    }
    const bounds = buttonRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const pickerHeight = 220;
    setPosition({
      top: window.innerHeight - bounds.bottom > pickerHeight ? bounds.bottom + 8 : Math.max(8, bounds.top - pickerHeight - 8),
      left: Math.min(bounds.left, window.innerWidth - 264),
    });
    setOpen(true);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePicker}
        aria-expanded={open}
        aria-label="Elegir emoji"
        className={`flex h-[50px] ${compact ? 'w-12 shrink-0' : 'w-full'} items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0c0c10] px-3 text-xl text-white hover:border-yellow-300/60`}
      >
        <span aria-hidden="true">☺️</span>
        {!compact && <span className="text-xs font-bold text-white/65">Emojis</span>}
      </button>
      {open && position && createPortal(
        <div
          ref={pickerRef}
          style={{ top: position.top, left: position.left }}
          className="fixed z-[11000] w-64 rounded-2xl border border-white/10 bg-[#141419] p-2 shadow-2xl"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white/60">Elige uno o varios</span>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-cyan-400 px-2 py-1 text-xs font-black text-black">Listo</button>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {EMOJIS.map(emoji => {
              const nextValue = `${value}${value ? separator : ''}${emoji}`;
              const disabled = maxLength !== undefined && nextValue.length > maxLength;
              return (
                <button
                  key={emoji}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(nextValue)}
                  aria-label={`Agregar ${emoji}`}
                  className="rounded-lg p-2 text-xl hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

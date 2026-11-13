import { useRef, useState } from 'react';
import { apiFetch } from '../../lib/api';
import {
  ACCENT_SWATCHES,
  BODY_FONTS,
  DEFAULT_SETTINGS,
  DEFAULT_WA_TEMPLATE,
  TEXT_FIELDS,
  TITLE_FONTS,
  WA_PLACEHOLDERS,
  siteSettings,
} from '../../data/siteSettings';
import { applyTheme, fontFamilyValue, hexToRgb, loadFont, luminance } from '../../lib/theme';
import { buildWhatsAppText } from '../../utils/whatsappMessage';
import { DAY_LABELS, DAY_ORDER, applyHours } from '../../data/openingHours';
import type { DayKey, HoursSetting } from '../../data/openingHours';

const input =
  'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/30 focus:border-yellow-300 focus:outline-none';
const label = 'mb-1 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow-300';
const card = 'space-y-3 rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4';

const SAMPLE = {
  productos: '2 x Salchipapita\n   - Extra queso\n\n1 x Maicito Milenial',
  promo: '🎁 Promo: Miércoles de promo (-$8.000)',
  total: '$72.000',
  datos: '📦 Tipo: Domicilio\n👤 Nombre: Juan\n📞 Teléfono: 3001234567\n🏠 Dirección: Calle 1 #2-3',
  nombre: 'Juan',
};

const SETTINGS_SECTIONS = [
  { id: 'principal', label: 'Página principal', description: 'Bienvenida y botones' },
  { id: 'menu', label: 'Menú', description: 'Título y descripción' },
  { id: 'whatsapp', label: 'WhatsApp', description: 'Mensaje de pedidos' },
  { id: 'appearance', label: 'Diseño', description: 'Colores y tipografías' },
  { id: 'business', label: 'Negocio', description: 'Contacto y modalidades' },
  { id: 'hours', label: 'Horarios', description: 'Atención semanal' },
  { id: 'footer', label: 'Pie de página', description: 'Frase final' },
] as const;

type SettingsSection = typeof SETTINGS_SECTIONS[number]['id'];

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('principal');
  const [accent, setAccent] = useState(siteSettings.accent);
  const [titleFont, setTitleFont] = useState(siteSettings.titleFont);
  const [bodyFont, setBodyFont] = useState(siteSettings.bodyFont);
  const [texts, setTexts] = useState<Record<string, string>>({ ...siteSettings.texts });
  const [template, setTemplate] = useState(siteSettings.whatsappTemplate);
  const [whatsappNumber, setWhatsappNumber] = useState(siteSettings.whatsappNumber);
  const [deliveryEnabled, setDeliveryEnabled] = useState(siteSettings.deliveryEnabled);
  const [pickupEnabled, setPickupEnabled] = useState(siteSettings.pickupEnabled);
  const [address, setAddress] = useState(siteSettings.address);
  const [city, setCity] = useState(siteSettings.city);
  const [mapsLink, setMapsLink] = useState(siteSettings.mapsLink);
  const [hours, setHours] = useState<Record<DayKey, HoursSetting>>(() => {
    const copy = {} as Record<DayKey, HoursSetting>;
    for (const d of DAY_ORDER) copy[d] = { ...siteSettings.hours[d] };
    return copy;
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const templateRef = useRef<HTMLTextAreaElement>(null);

  const validAccent = hexToRgb(accent) !== null;
  const tooDark = validAccent && luminance(accent) < 0.25;

  function insertPlaceholder(tag: string) {
    const el = templateRef.current;
    if (!el) return setTemplate(template + tag);
    const start = el.selectionStart ?? template.length;
    const end = el.selectionEnd ?? template.length;
    setTemplate(template.slice(0, start) + tag + template.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    });
  }

  function pickTitleFont(name: string) {
    loadFont(name);
    setTitleFont(name);
  }
  function pickBodyFont(name: string) {
    loadFont(name);
    setBodyFont(name);
  }

  function setDay(day: DayKey, patch: Partial<HoursSetting>) {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  function copyMondayToAll() {
    setHours(prev => {
      const next = { ...prev };
      for (const d of DAY_ORDER) next[d] = { ...prev.lunes };
      return next;
    });
  }

  function resetDesign() {
    setAccent(DEFAULT_SETTINGS.accent);
    setTitleFont(DEFAULT_SETTINGS.titleFont);
    setBodyFont(DEFAULT_SETTINGS.bodyFont);
  }

  async function handleSave() {
    setError('');
    setMsg('');
    if (!validAccent) return setError('El color no es válido');
    if (tooDark) return setError('Ese color es muy oscuro: el texto de los botones no se leería. Elige uno más claro.');
    if (!template.includes('{productos}')) return setError('El mensaje de WhatsApp debe incluir {productos}');

    const waDigits = whatsappNumber.replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(waDigits)) return setError('El WhatsApp debe tener código de país y solo números (ej: 573503384530)');
    if (address.trim().length < 5) return setError('Escribe la dirección del restaurante');
    if (city.trim().length < 2) return setError('Escribe la ciudad');
    if (mapsLink.trim() && !/^https?:\/\//.test(mapsLink.trim())) return setError('El link de Google Maps debe empezar por https://');
    for (const d of DAY_ORDER) {
      const h = hours[d];
      if (!h.closed && (!h.open || !h.close || h.open === h.close)) {
        return setError(`Revisa el horario del ${DAY_LABELS[d]}: la hora de abrir y cerrar no pueden ser iguales`);
      }
    }

    const cleanTexts: Record<string, string> = {};
    for (const f of TEXT_FIELDS) {
      const v = (texts[f.key] ?? '').trim();
      if (v) cleanTexts[f.key] = v;
    }
    const data = {
      accent,
      titleFont,
      bodyFont,
      texts: cleanTexts,
      whatsappTemplate: template.trim(),
      whatsappNumber: waDigits,
      deliveryEnabled,
      pickupEnabled,
      address: address.trim(),
      city: city.trim(),
      mapsLink: mapsLink.trim(),
      hours,
    };

    setSaving(true);
    try {
      const saved = await apiFetch<Record<string, unknown>>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const finalData = (saved && Object.keys(saved).length > 0 ? saved : data) as typeof data;
      Object.assign(siteSettings, finalData);
      applyHours(hours);
      applyTheme(siteSettings);
      setMsg('✅ Guardado. Ya se ve en la página.');
    } catch (err) {
      return setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  const preview = buildWhatsAppText(template, SAMPLE);
  const currentSection = SETTINGS_SECTIONS.find(section => section.id === activeSection) ?? SETTINGS_SECTIONS[0];
  const textFor = (key: string) => texts[key]?.trim() || TEXT_FIELDS.find(field => field.key === key)?.default || '';
  const sectionTextKeys: Partial<Record<SettingsSection, string[]>> = {
    principal: ['heroText', 'heroButton1', 'heroButton2', 'topTitleA', 'topTitleB'],
    menu: ['menuTitle', 'menuSubtitle'],
    whatsapp: ['confirmMessage'],
    footer: ['footerSlogan'],
  };
  const visibleTextFields = TEXT_FIELDS.filter(field => sectionTextKeys[activeSection]?.includes(field.key));

  return (
    <div className="space-y-4 pb-28">
      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Secciones de personalización">
        {SETTINGS_SECTIONS.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            aria-pressed={activeSection === section.id}
            className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
              activeSection === section.id
                ? 'border-yellow-300 bg-yellow-400 text-black'
                : 'border-white/10 bg-[#111116] text-white/65 hover:border-yellow-400/40'
            }`}
          >
            <span className="block text-xs font-black">{section.label}</span>
            <span className={`mt-0.5 block text-[10px] ${activeSection === section.id ? 'text-black/65' : 'text-white/40'}`}>{section.description}</span>
          </button>
        ))}
      </nav>

      <section className={`${card} border-yellow-400/35`} aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={label}>Vista previa en tiempo real</p>
            <p className="text-xs text-white/45">Página · {currentSection.label}. Los cambios aquí aún no se publican.</p>
          </div>
          <span className="rounded-full bg-[#00C853]/10 px-2.5 py-1 text-[10px] font-bold text-[#00C853]">BORRADOR</span>
        </div>
        <div
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#09090c] p-4 sm:p-5"
          style={{ fontFamily: fontFamilyValue(bodyFont) }}
        >
          {activeSection === 'principal' && (
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: validAccent ? accent : DEFAULT_SETTINGS.accent }}>Mucha Mazorca</p>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>MUCHA MAZORCA 🌽</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-white/70">{textFor('heroText')}</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full px-4 py-2 text-xs font-black text-black" style={{ backgroundColor: validAccent ? accent : DEFAULT_SETTINGS.accent }}>{textFor('heroButton1')}</span>
                <span className="rounded-full border px-4 py-2 text-xs font-black" style={{ borderColor: validAccent ? accent : DEFAULT_SETTINGS.accent, color: validAccent ? accent : DEFAULT_SETTINGS.accent }}>{textFor('heroButton2')}</span>
              </div>
              <p className="border-t border-white/10 pt-3 text-sm font-black text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>
                {textFor('topTitleA')} <span style={{ color: validAccent ? accent : DEFAULT_SETTINGS.accent }}>{textFor('topTitleB')}</span>
              </p>
            </div>
          )}
          {activeSection === 'menu' && (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: validAccent ? accent : DEFAULT_SETTINGS.accent }}>Nuestro menú</p>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>{textFor('menuTitle')}</h2>
              <p className="text-sm text-white/65">{textFor('menuSubtitle')}</p>
              <div className="flex gap-2 text-[10px] font-bold text-black">
                {['🌽 MAICITOS', '🍔 AMORGUESAS', '🍟 SALCHIPAPITAS'].map(category => (
                  <span key={category} className="rounded-full px-2 py-1" style={{ backgroundColor: validAccent ? accent : DEFAULT_SETTINGS.accent }}>{category}</span>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-bold text-white">Maicito especial</p>
                <p className="mt-1 text-xs text-white/55">Elige tus adicionales favoritos</p>
              </div>
            </div>
          )}
          {activeSection === 'whatsapp' && (
            <pre className="whitespace-pre-wrap text-sm leading-6 text-white/85">{preview}</pre>
          )}
          {activeSection === 'appearance' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>MUCHA MAZORCA</h2>
              <p className="text-sm text-white/70" style={{ fontFamily: fontFamilyValue(bodyFont) }}>Así se combinan los títulos, textos y elementos destacados.</p>
              <button type="button" className="rounded-full px-5 py-3 text-sm font-black text-black" style={{ backgroundColor: validAccent ? accent : DEFAULT_SETTINGS.accent }}>Botón principal</button>
            </div>
          )}
          {activeSection === 'business' && (
            <div className="space-y-3">
              <h2 className="text-xl font-black text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>Haz tu pedido</h2>
              <p className="text-sm text-white/70">{address}, {city}</p>
              <p className="text-xs text-white/50">WhatsApp: {whatsappNumber || 'Sin configurar'}</p>
              <div className="flex flex-wrap gap-2">
                {deliveryEnabled && <span className="rounded-full px-3 py-2 text-xs font-bold text-black" style={{ backgroundColor: validAccent ? accent : DEFAULT_SETTINGS.accent }}>🛵 Domicilio</span>}
                {pickupEnabled && <span className="rounded-full px-3 py-2 text-xs font-bold text-black" style={{ backgroundColor: validAccent ? accent : DEFAULT_SETTINGS.accent }}>🏃 Recoger</span>}
                {!deliveryEnabled && !pickupEnabled && <span className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/60">Pedido clásico por WhatsApp</span>}
              </div>
            </div>
          )}
          {activeSection === 'hours' && (
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>Horario de atención</h2>
              {DAY_ORDER.map(day => (
                <p key={day} className="flex justify-between gap-3 border-b border-white/5 pb-2 text-xs text-white/70">
                  <span>{DAY_LABELS[day]}</span>
                  <span>{hours[day].closed ? 'Cerrado' : `${hours[day].open} – ${hours[day].close}`}</span>
                </p>
              ))}
            </div>
          )}
          {activeSection === 'footer' && (
            <div className="space-y-3 border-t-2 pt-4" style={{ borderColor: validAccent ? accent : DEFAULT_SETTINGS.accent }}>
              <p className="text-sm font-bold text-white" style={{ fontFamily: fontFamilyValue(titleFont) }}>{textFor('footerSlogan')}</p>
              <p className="text-xs text-white/55">{address}, {city}</p>
            </div>
          )}
        </div>
      </section>

      {activeSection === 'whatsapp' && <div className={card}>
        <p className={label}>💬 Mensaje de WhatsApp</p>
        <p className="text-xs text-white/55">
          Así le llega el pedido al restaurante. Toca una etiqueta para meterla en el mensaje.
        </p>
        <textarea ref={templateRef} className={input} rows={7} value={template} onChange={e => setTemplate(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {WA_PLACEHOLDERS.map(p => (
            <button
              key={p.tag}
              type="button"
              title={p.help}
              onClick={() => insertPlaceholder(p.tag)}
              className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs font-black text-yellow-300"
            >
              {p.tag}
            </button>
          ))}
        </div>
        <ul className="space-y-1 text-[11px] text-white/45">
          {WA_PLACEHOLDERS.map(p => (
            <li key={p.tag}>
              <span className="font-bold text-white/60">{p.tag}</span> {p.help}
            </li>
          ))}
        </ul>
        <p className={label}>Vista previa</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-[#0c0c10] p-3 text-sm text-white/85">{preview}</pre>
        <button type="button" onClick={() => setTemplate(DEFAULT_WA_TEMPLATE)} className="text-xs font-semibold text-white/60 underline">
          Restaurar mensaje original
        </button>
      </div>}

      {activeSection === 'appearance' && <div className={card}>
        <p className={label}>🎨 Color principal</p>
        <p className="text-xs text-white/55">Se usa en botones, bordes y textos destacados. El fondo oscuro no cambia.</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_SWATCHES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setAccent(c)}
              style={{ backgroundColor: c }}
              className={`h-10 w-10 rounded-full border-2 ${accent.toLowerCase() === c.toLowerCase() ? 'border-white' : 'border-transparent'}`}
              aria-label={c}
            />
          ))}
          <input type="color" value={validAccent ? accent : '#FFD60A'} onChange={e => setAccent(e.target.value)} className="h-10 w-14 rounded-lg bg-transparent" />
        </div>
        <div className="flex items-center gap-3">
          <span style={{ backgroundColor: validAccent ? accent : '#FFD60A' }} className="rounded-full px-5 py-3 text-sm font-extrabold uppercase text-black">
            Así se ve un botón
          </span>
          <span style={{ color: validAccent ? accent : '#FFD60A' }} className="text-sm font-black">Texto destacado</span>
        </div>
        {tooDark && <p className="text-xs text-red-400">Muy oscuro: el texto negro del botón no se leería.</p>}
      </div>}

      {activeSection === 'appearance' && <div className={card}>
        <p className={label}>🔤 Tipografías</p>
        <div>
          <label className={label}>Letra de los títulos</label>
          <select className={input} value={titleFont} onChange={e => pickTitleFont(e.target.value)}>
            {TITLE_FONTS.map(f => (<option key={f} value={f}>{f}</option>))}
          </select>
          <p style={{ fontFamily: fontFamilyValue(titleFont) }} className="mt-2 text-xl text-white">MUCHA MAZORCA</p>
        </div>
        <div>
          <label className={label}>Letra del texto</label>
          <select className={input} value={bodyFont} onChange={e => pickBodyFont(e.target.value)}>
            {BODY_FONTS.map(f => (<option key={f} value={f}>{f}</option>))}
          </select>
          <p style={{ fontFamily: fontFamilyValue(bodyFont) }} className="mt-2 text-sm text-white/80">Tu antojo, tu combinación, tu Mucha Mazorca.</p>
        </div>
        <button type="button" onClick={resetDesign} className="text-xs font-semibold text-white/60 underline">
          Restaurar colores y letras originales
        </button>
      </div>}

      {activeSection === 'business' && <div className={card}>
        <p className={label}>📍 Datos del negocio</p>
        <div>
          <label className={label}>WhatsApp de pedidos</label>
          <input className={input} type="tel" inputMode="numeric" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="573503384530" />
          <p className="mt-1 text-xs text-white/50">Con código de país y sin espacios ni +. Colombia empieza por 57.</p>
        </div>
        <div className="space-y-2 rounded-xl border border-white/10 bg-[#0c0c10] p-3">
          <p className={label}>Opciones de pedido</p>
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input type="checkbox" className="h-5 w-5 accent-yellow-400" checked={deliveryEnabled} onChange={event => setDeliveryEnabled(event.target.checked)} />
            Domicilio habilitado
          </label>
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input type="checkbox" className="h-5 w-5 accent-yellow-400" checked={pickupEnabled} onChange={event => setPickupEnabled(event.target.checked)} />
            Recoger en el local habilitado
          </label>
          {!deliveryEnabled && !pickupEnabled && (
            <p className="text-xs leading-5 text-yellow-200/70">Si ambas opciones están apagadas, el sitio usará el pedido clásico por WhatsApp y no guardará datos personales ni pedidos en el panel.</p>
          )}
        </div>
        <div>
          <label className={label}>Dirección</label>
          <input className={input} value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div>
          <label className={label}>Ciudad</label>
          <input className={input} value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div>
          <label className={label}>Link de Google Maps (opcional)</label>
          <input className={input} value={mapsLink} onChange={e => setMapsLink(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
          <p className="mt-1 text-xs text-white/50">Si lo dejas vacío, el mapa se arma con la dirección.</p>
        </div>
      </div>}

      {activeSection === 'hours' && <div className={card}>
        <p className={label}>🕒 Horario de atención</p>
        <p className="text-xs text-white/55">Este horario mueve el "Abierto ahora / Cerrado", la página de contacto y el pie de página. Si cierran después de medianoche, pon la hora normal (ej. 01:00).</p>
        <div className="space-y-2">
          {DAY_ORDER.map(d => (
            <div key={d} className="grid grid-cols-[84px_1fr_1fr] items-center gap-2">
              <span className="text-sm font-bold text-white">{DAY_LABELS[d]}</span>
              {hours[d].closed ? (
                <label className="col-span-2 flex items-center gap-2 text-sm text-red-400">
                  <input type="checkbox" className="h-5 w-5" checked onChange={() => setDay(d, { closed: false })} />
                  Cerrado
                </label>
              ) : (
                <>
                  <input className={input} type="time" value={hours[d].open} onChange={e => setDay(d, { open: e.target.value })} />
                  <input className={input} type="time" value={hours[d].close} onChange={e => setDay(d, { close: e.target.value })} />
                </>
              )}
              {!hours[d].closed && (
                <label className="col-span-3 -mt-1 flex items-center gap-2 text-xs text-white/50">
                  <input type="checkbox" className="h-4 w-4" checked={false} onChange={() => setDay(d, { closed: true })} />
                  Cerrado este día
                </label>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={copyMondayToAll} className="text-xs font-semibold text-white/60 underline">
          Copiar el horario del lunes a todos los días
        </button>
      </div>}

      {visibleTextFields.length > 0 && <div className={card}>
        <p className={label}>✏️ Textos de la página</p>
        <p className="text-xs text-white/55">Si dejas un campo vacío, se usa el texto original (el que ves en gris).</p>
        {visibleTextFields.map(f => (
          <div key={f.key}>
            <label className={label}>{f.label}</label>
            {f.multiline ? (
              <textarea className={input} rows={5} placeholder={f.default} value={texts[f.key] ?? ''} onChange={e => setTexts({ ...texts, [f.key]: e.target.value })} />
            ) : (
              <input className={input} placeholder={f.default} value={texts[f.key] ?? ''} onChange={e => setTexts({ ...texts, [f.key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {msg && <p className="text-sm font-bold text-[#00C853]">{msg}</p>}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-yellow-400/20 bg-[#101014] p-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mx-auto block w-full max-w-2xl rounded-xl bg-yellow-400 py-3 text-base font-black text-black disabled:opacity-50 active:scale-95"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

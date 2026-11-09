import type { DayKey, HoursSetting } from './openingHours';

export interface SiteSettings {
  accent: string;
  titleFont: string;
  bodyFont: string;
  texts: Record<string, string>;
  whatsappTemplate: string;
  whatsappNumber: string;
  address: string;
  city: string;
  mapsLink: string;
  hours: Record<DayKey, HoursSetting>;
}

export interface TextField {
  key: string;
  label: string;
  default: string;
  multiline?: boolean;
}

export const DEFAULT_WA_TEMPLATE =
  '💛 Holaaaa, deseo ordenar este manjar de dioses:\n\n{productos}\n\n{promo}\n💰 Total: {total}\n\n{datos}';

export const WA_PLACEHOLDERS: { tag: string; help: string }[] = [
  { tag: '{productos}', help: 'Lista de productos del pedido (obligatorio)' },
  { tag: '{promo}', help: 'La promo aplicada (si no hay, no sale nada)' },
  { tag: '{total}', help: 'Total a pagar' },
  { tag: '{datos}', help: 'Tipo de pedido, nombre, teléfono y dirección' },
  { tag: '{nombre}', help: 'Nombre del cliente' },
];

export const TEXT_FIELDS: TextField[] = [
  {
    key: 'heroText',
    label: 'Texto de bienvenida (página principal)',
    multiline: true,
    default:
      'MM (Mucha Mazorca) está hecho para que pidas como quieras, todo se puede adicionar, todo se puede quitar, poner aparte, como tú quieras 😁\n\nLo más importante es que hacemos todo con mucho amor, gracias por estar aquí, buen provecho ❤️‍🩹',
  },
  { key: 'heroButton1', label: 'Botón principal', default: 'Explorar menú' },
  { key: 'heroButton2', label: 'Botón secundario', default: 'Contactate con MM' },
  { key: 'topTitleA', label: 'Título de destacados (parte blanca)', default: 'NUESTROS' },
  { key: 'topTitleB', label: 'Título de destacados (parte de color)', default: 'TOP 🔥' },
  { key: 'menuTitle', label: 'Título de la página del menú', default: 'Nuestro menú' },
  { key: 'menuSubtitle', label: 'Frase debajo del título del menú', default: 'Escoge tu favorito y pídelo por WhatsApp' },
  { key: 'footerSlogan', label: 'Frase del pie de página', default: '¡Tu antojo, tu combinacion, tu Mucha Mazorca!💛🌽' },
  {
    key: 'confirmMessage',
    label: 'Aviso antes de enviar el pedido',
    multiline: true,
    default:
      'Si llegas a tener algún problema con tu pedido comunícalo con nosotros para poder ayudarte, la idea es que tengas una buena experiencia ❤️‍🩹',
  },
];

export const DEFAULT_HOURS: Record<DayKey, HoursSetting> = {
  lunes: { open: '17:00', close: '22:00', closed: false },
  martes: { open: '17:00', close: '22:00', closed: false },
  miercoles: { open: '17:00', close: '22:00', closed: false },
  jueves: { open: '17:00', close: '22:00', closed: false },
  viernes: { open: '18:00', close: '23:00', closed: false },
  sabado: { open: '18:00', close: '23:00', closed: false },
  domingo: { open: '18:00', close: '23:00', closed: false },
};

export const DEFAULT_MAPS_LINK =
  'https://www.google.com/maps/place/Mucha+Mazorca/@7.8762,-72.4871,17z/data=!3m1!4b1!4m6!3m5!1s0x8e66458e17dc72f3:0xed6cddde4f839119!8m2!3d7.8762!4d-72.4871!16s%2Fg%2F11tmj5t69m?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D';

export const DEFAULT_SETTINGS: SiteSettings = {
  accent: '#FFD60A',
  titleFont: 'Press Start 2P',
  bodyFont: 'Sora',
  texts: {},
  whatsappTemplate: DEFAULT_WA_TEMPLATE,
  whatsappNumber: '573503384530',
  address: 'Cl. 41 #58, Barrio Bogota',
  city: 'Cúcuta, Norte de Santander',
  mapsLink: '',
  hours: DEFAULT_HOURS,
};

// Colores recomendados (claros, para que el texto negro de los botones se lea bien)
export const ACCENT_SWATCHES = ['#FFD60A', '#FF9F1C', '#FF5A5F', '#2EC4B6', '#4CC9F0', '#F72585', '#B8F34B'];

// wght = pesos que se piden a Google Fonts (undefined = fuente de un solo peso)
export const FONT_SPECS: Record<string, { wght?: string; fallback: string }> = {
  'Press Start 2P': { fallback: 'monospace' },
  Bangers: { fallback: 'cursive' },
  'Lilita One': { fallback: 'cursive' },
  Pacifico: { fallback: 'cursive' },
  'Bebas Neue': { fallback: 'sans-serif' },
  Fredoka: { wght: '400;600;700', fallback: 'sans-serif' },
  Rubik: { wght: '400;500;700;800', fallback: 'sans-serif' },
  Poppins: { wght: '400;500;600;700;800', fallback: 'sans-serif' },
  Sora: { wght: '400;500;600;700;800', fallback: 'sans-serif' },
  Inter: { wght: '400;500;600;700', fallback: 'sans-serif' },
  Nunito: { wght: '400;600;700;800', fallback: 'sans-serif' },
  Montserrat: { wght: '400;500;600;700', fallback: 'sans-serif' },
  'DM Sans': { wght: '400;500;700', fallback: 'sans-serif' },
  Roboto: { wght: '400;500;700', fallback: 'sans-serif' },
};

export const TITLE_FONTS = ['Press Start 2P', 'Bangers', 'Lilita One', 'Fredoka', 'Rubik', 'Poppins', 'Bebas Neue', 'Pacifico'];
export const BODY_FONTS = ['Sora', 'Inter', 'Poppins', 'Nunito', 'Montserrat', 'DM Sans', 'Roboto'];

// Ajustes en uso. Se llenan al cargar la pagina desde la API y se leen con getText().
export const siteSettings: SiteSettings = { ...DEFAULT_SETTINGS, texts: {} };

export function getText(key: string): string {
  const custom = siteSettings.texts[key];
  if (custom && custom.trim()) return custom;
  return TEXT_FIELDS.find(f => f.key === key)?.default ?? '';
}

function formatPhone(digits: string): string {
  if (/^57\d{10}$/.test(digits)) return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  return `+${digits}`;
}

// Datos de contacto listos para usar en la pagina (WhatsApp, direccion y mapa).
export function getContactInfo() {
  const s = siteSettings;
  const isDefaultPlace = s.address === DEFAULT_SETTINGS.address && s.city === DEFAULT_SETTINGS.city;
  const query = isDefaultPlace ? 'Mucha Mazorca, Cucuta, Norte de Santander' : `Mucha Mazorca ${s.address} ${s.city}`;
  const mapsLink = s.mapsLink.trim()
    ? s.mapsLink.trim()
    : isDefaultPlace
      ? DEFAULT_MAPS_LINK
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return {
    whatsappNumber: s.whatsappNumber,
    whatsappDisplay: formatPhone(s.whatsappNumber),
    address: s.address,
    city: s.city,
    mapsLink,
    mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
  };
}

export interface WaVars {
  productos: string;
  promo: string;
  total: string;
  datos: string;
  nombre: string;
}

export function buildWhatsAppText(template: string, vars: WaVars): string {
  let t = template.includes('{productos}') ? template : `${template}\n\n{productos}`;
  t = t
    .split('{productos}').join(vars.productos)
    .split('{promo}').join(vars.promo)
    .split('{total}').join(vars.total)
    .split('{datos}').join(vars.datos)
    .split('{nombre}').join(vars.nombre);
  // limpia espacios y saltos de linea de sobra (por ejemplo cuando no hay promo)
  return t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

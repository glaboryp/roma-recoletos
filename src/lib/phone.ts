export const BAD_MOBILE = 'Ese móvil no parece válido: deben ser 9 cifras y empezar por 6 o 7 (si es extranjero, ponlo con su prefijo, por ejemplo +33).';

// The number as we store it (9 digits for Spain, +<digits> from abroad), or null when it is not a mobile.
export const mobile = (raw: string) => {
  const s = raw.replace(/[\s.()-]/g, '');
  const es = s.match(/^(?:\+34|0034)?([67]\d{8})$/);
  if (es) return es[1];
  const abroad = s.match(/^(?:\+|00)(\d{8,15})$/);
  return abroad && !abroad[1].startsWith('34') ? `+${abroad[1]}` : null;
};

import type { Lang } from '../i18n';

export function fmtMoney(v: number, currency: string, lang: Lang): string {
  try {
    const digits = v !== 0 && Math.abs(v) < 1 ? 3 : 2;
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: digits }).format(v);
  } catch {
    return `${v.toFixed(2)} ${currency}`;
  }
}

export function fmtNumber(v: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 1 }).format(v);
}

/** Octets → « 12 Go » / « 12 GB » (unités décimales, comme la facturation du panel). */
export function fmtBytes(bytes: number, lang: Lang): string {
  const gb = bytes / 1e9;
  const unit = lang === 'fr' ? 'Go' : 'GB';
  if (gb >= 1) return `${fmtNumber(gb, lang)} ${unit}`;
  const mb = bytes / 1e6;
  return `${fmtNumber(mb, lang)} ${lang === 'fr' ? 'Mo' : 'MB'}`;
}

/** Nom du pays dans la langue du visiteur (Intl), repli sur le code. */
export function countryName(code: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Emoji drapeau (repli quand l'image CDN ne charge pas). */
export function flagEmoji(code: string): string {
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

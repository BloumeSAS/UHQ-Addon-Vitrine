import { useEffect } from 'react';
import { BASE } from './api';

/** Variables du thème du panel (format « H S% L% ») → variables de la vitrine. */
const THEME_MAP: Record<string, string> = {
  background: '--bg', foreground: '--fg', card: '--card', muted: '--bg2', 'muted-foreground': '--fg2', border: '--border', primary: '--primary', destructive: '--red',
};

function hsl(raw: string): string | null {
  const p = raw.trim().split(/\s+/);
  return p.length === 3 ? `hsl(${p[0]}, ${p[1]}, ${p[2]})` : null;
}

/** Applique le thème personnalisé du panel (Paramètres → Thème) : fond, texte, cartes, bordures et couleur principale. */
export function usePanelTheme(mode: 'light' | 'dark') {
  useEffect(() => {
    const root = document.documentElement.style;
    // Repart de la palette par défaut quand le mode change (sinon les variables du mode précédent restent).
    Object.values(THEME_MAP).forEach((v) => root.removeProperty(v));
    root.removeProperty('--primary-2');
    fetch(`${BASE}api/theme`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { themeColors: { light: Record<string, string>; dark: Record<string, string> } | null } | null) => {
        const colors = d?.themeColors?.[mode];
        if (!colors) return;
        for (const [k, v] of Object.entries(THEME_MAP)) {
          const val = colors[k] ? hsl(colors[k]) : null;
          if (val) root.setProperty(v, val);
        }
        // Seconde teinte du dégradé : la couleur principale décalée de 22° de teinte.
        const pr = colors.primary?.trim().split(/\s+/);
        if (pr?.length === 3) root.setProperty('--primary-2', `hsl(${(parseFloat(pr[0]) + 22) % 360}, ${pr[1]}, ${pr[2]})`);
      })
      .catch(() => undefined);
  }, [mode]);
}


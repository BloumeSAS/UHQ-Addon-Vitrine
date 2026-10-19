import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface VitrineConfig {
  /** Textes : vide = texte par défaut (FR / EN selon la langue du visiteur). */
  tagline: string;
  hero: { badge: string; title: string; highlight: string; subtitle: string; cta_primary: string; cta_secondary: string };
  sections: { stats: boolean; categories: boolean; countries: boolean; calculator: boolean; features: boolean; steps: boolean; faq: boolean; contact: boolean };
  show_prices: boolean;
  show_stock: boolean;
  /** Affiche le nombre de proxies disponibles par pays (sinon seulement les pays). */
  show_proxy_counts: boolean;
  /** Listes vides = contenu par défaut. */
  features: { icon: string; title: string; text: string }[];
  steps: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  contact: { discord: string; telegram: string; email: string; website: string };
  calculator: { avg_page_mb: number; default_gb: number };
  /** Surcharges par catégorie (clé = nom de la catégorie du panel ; '' = pool général). */
  categories: Record<string, { hidden: boolean; label: string; description: string; order: number }>;
  footer_text: string;
  seo: { title: string; description: string };
}

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bool = (v: unknown, d: boolean): boolean => (typeof v === 'boolean' ? v : d);
const num = (v: unknown, d: number, min: number, max: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
/** Liens de contact : https/http ou e-mail — jamais javascript: ni data:. */
const link = (v: unknown, kind: 'url' | 'email'): string => {
  const s = str(v, 200);
  if (!s) return '';
  if (kind === 'email') return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(s) ? s : '';
  return /^https?:\/\/[^\s<>"']+$/i.test(s) ? s : '';
};

/** Normalise une configuration reçue (admin ou import de sauvegarde) : types, longueurs, listes bornées. */
export function sanitizeConfig(input: any): VitrineConfig {
  const i = input && typeof input === 'object' ? input : {};
  const h = i.hero ?? {};
  const s = i.sections ?? {};
  const cats: VitrineConfig['categories'] = {};
  if (i.categories && typeof i.categories === 'object') {
    for (const [k, v] of Object.entries<any>(i.categories).slice(0, 200)) {
      cats[str(k, 120)] = { hidden: bool(v?.hidden, false), label: str(v?.label, 80), description: str(v?.description, 400), order: num(v?.order, 0, -999, 999) };
    }
  }
  return {
    tagline: str(i.tagline, 140),
    hero: { badge: str(h.badge, 80), title: str(h.title, 120), highlight: str(h.highlight, 80), subtitle: str(h.subtitle, 400), cta_primary: str(h.cta_primary, 40), cta_secondary: str(h.cta_secondary, 40) },
    sections: {
      stats: bool(s.stats, true), categories: bool(s.categories, true), countries: bool(s.countries, true),
      calculator: bool(s.calculator, true), features: bool(s.features, true), steps: bool(s.steps, true),
      faq: bool(s.faq, true), contact: bool(s.contact, true),
    },
    show_prices: bool(i.show_prices, true),
    show_stock: bool(i.show_stock, true),
    show_proxy_counts: bool(i.show_proxy_counts, false),
    features: (Array.isArray(i.features) ? i.features : []).slice(0, 12).map((f: any) => ({ icon: str(f?.icon, 8), title: str(f?.title, 80), text: str(f?.text, 300) })).filter((f: any) => f.title),
    steps: (Array.isArray(i.steps) ? i.steps : []).slice(0, 8).map((f: any) => ({ title: str(f?.title, 80), text: str(f?.text, 300) })).filter((f: any) => f.title),
    faq: (Array.isArray(i.faq) ? i.faq : []).slice(0, 20).map((f: any) => ({ q: str(f?.q, 160), a: str(f?.a, 1000) })).filter((f: any) => f.q && f.a),
    contact: { discord: link(i.contact?.discord, 'url'), telegram: link(i.contact?.telegram, 'url'), email: link(i.contact?.email, 'email'), website: link(i.contact?.website, 'url') },
    calculator: { avg_page_mb: num(i.calculator?.avg_page_mb, 2, 0.01, 500), default_gb: num(i.calculator?.default_gb, 10, 1, 100000) },
    categories: cats,
    footer_text: str(i.footer_text, 200),
    seo: { title: str(i.seo?.title, 70), description: str(i.seo?.description, 200) },
  };
}

/** Stockage JSON de la configuration (écriture atomique). */
@Injectable()
export class StoreService implements OnModuleInit {
  private readonly logger = new Logger(StoreService.name);
  private readonly file = process.env.DB_PATH ?? path.join(process.cwd(), 'vitrine-data.json');
  config: VitrineConfig = sanitizeConfig({});

  onModuleInit() {
    try {
      if (fs.existsSync(this.file)) this.config = sanitizeConfig(JSON.parse(fs.readFileSync(this.file, 'utf8'))?.config);
    } catch (e: any) {
      this.logger.warn(`Lecture de ${this.file} impossible : ${e?.message}`);
    }
  }

  save(config: VitrineConfig) {
    this.config = config;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ config, updated_at: new Date().toISOString() }, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, this.file);
  }
}

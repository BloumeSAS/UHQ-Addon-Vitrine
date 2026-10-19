import { Injectable, Logger } from '@nestjs/common';
import { StoreService, VitrineConfig } from './store.service';

interface PoolOverview {
  name: string;
  description: string | null;
  color: string | null;
  total: number;
  countries: { code: string; count: number }[];
}

interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number | null;
  pricing: 'fixed' | 'per_gb';
  per_gb: { min_gb: number; max_gb: number; step_gb: number } | null;
  renewal_enabled: boolean;
  specs: Record<string, any> | null;
  category: string;
}

interface Raw {
  site: { name: string; logo: string; registration: boolean; version: string };
  overview: { default: PoolOverview; pools: PoolOverview[] } | null;
  catalog: CatalogProduct[] | null;
}

const TTL_MS = 30_000;
const RANDOM_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6'];

/**
 * Agrège les données PUBLIQUES de la vitrine : identité du site (panel), catégories + pays réellement disponibles (panel,
 * clé API maître) et catalogue (addon Orders, clé du panel). Mise en cache 30 s : la page est publique, elle ne doit pas
 * déclencher un appel au panel / à Orders à chaque visite. Aucune donnée de livraison ni identifiant ne sort d'ici.
 */
@Injectable()
export class VitrineService {
  private readonly logger = new Logger(VitrineService.name);
  private cache: { at: number; raw: Raw } | null = null;
  private logoCache: { at: number; type: string; body: Buffer } | null = null;

  constructor(private readonly store: StoreService) {}

  private get panelUrl(): string {
    return (process.env.PANEL_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
  }
  private get ordersUrl(): string {
    return (process.env.ORDERS_URL ?? '').replace(/\/+$/, '');
  }
  private get key(): string {
    return process.env.PANEL_API_KEY ?? '';
  }

  private async getJson(url: string, headers: Record<string, string> = {}): Promise<any | null> {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json', ...headers }, signal: AbortSignal.timeout(6000) });
      if (!res.ok) return null;
      return await res.json();
    } catch (e: any) {
      this.logger.warn(`Appel ${url.replace(/\?.*$/, '')} impossible : ${e?.message ?? e}`);
      return null;
    }
  }

  private async fetchRaw(): Promise<Raw> {
    if (this.cache && Date.now() - this.cache.at < TTL_MS) return this.cache.raw;
    const [status, overview, catalog] = await Promise.all([
      this.getJson(`${this.panelUrl}/api/panel/setup/status`),
      this.key ? this.getJson(`${this.panelUrl}/api/v1/vitrine/overview`, { 'X-API-Key': this.key }) : Promise.resolve(null),
      this.ordersUrl && this.key ? this.getJson(`${this.ordersUrl}/api/internal/catalog`, { 'X-Panel-Key': this.key }) : Promise.resolve(null),
    ]);
    const raw: Raw = {
      site: {
        name: String(status?.siteName ?? 'UHQ Panel OS'),
        logo: String(status?.logoUrl ?? ''),
        registration: !!status?.registrationEnabled,
        version: String(status?.version ?? ''),
      },
      overview: overview?.data ?? null,
      catalog: Array.isArray(catalog?.products) ? catalog.products : null,
    };
    // En cas d'échec complet on garde la dernière bonne version (la vitrine reste affichable si le panel redémarre).
    if (!status && this.cache) return this.cache.raw;
    this.cache = { at: Date.now(), raw };
    return raw;
  }

  /** Logo du panel : URL externe (le navigateur la charge directement) ou chemin du panel (relayé par /api/logo). */
  private logoInfo(logo: string): { external: string | null; hasLogo: boolean } {
    if (/^https?:\/\//i.test(logo)) return { external: logo, hasLogo: true };
    return { external: null, hasLogo: true };
  }

  async publicData() {
    const raw = await this.fetchRaw();
    const cfg: VitrineConfig = this.store.config;
    const ordersActive = raw.catalog !== null;
    const overview = raw.overview;
    const poolByName = new Map<string, PoolOverview>();
    if (overview) {
      poolByName.set('', overview.default);
      for (const p of overview.pools) poolByName.set(p.name, p);
    }

    type Cat = {
      key: string; name: string; description: string; color: string; total: number;
      countries: { code: string; count: number }[]; country_count: number; products: CatalogProduct[]; order: number;
    };
    const cats = new Map<string, Cat>();
    const ensure = (key: string): Cat => {
      let c = cats.get(key);
      if (!c) {
        const pool = poolByName.get(key);
        const o = cfg.categories[key];
        c = {
          key,
          name: o?.label || key || '',
          description: o?.description || pool?.description || '',
          color: pool?.color || RANDOM_COLORS[cats.size % RANDOM_COLORS.length],
          total: pool?.total ?? 0,
          countries: pool?.countries ?? [],
          country_count: pool?.countries.length ?? 0,
          products: [],
          order: o?.order ?? 0,
        };
        cats.set(key, c);
      }
      return c;
    };

    if (ordersActive) {
      for (const p of raw.catalog!) ensure(p.category ?? '').products.push(p);
    } else if (overview) {
      // Sans Orders : on présente les catégories du panel qui ont des proxies (pays disponibles).
      for (const p of overview.pools) if (p.total > 0) ensure(p.name);
      if (overview.default.total > 0 && overview.pools.every((p) => p.total === 0)) ensure('');
    }

    const list = [...cats.values()]
      .filter((c) => !cfg.categories[c.key]?.hidden)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    for (const c of list) {
      c.products.sort((a, b) => a.price - b.price);
      if (!cfg.show_proxy_counts) c.countries = c.countries.map((x) => ({ code: x.code, count: 0 }));
    }

    const allCountries = new Set<string>();
    for (const c of list) for (const x of c.countries) allCountries.add(x.code);
    const currency = raw.catalog?.find((p) => p.currency)?.currency ?? 'EUR';

    return {
      site: { name: raw.site.name, registration: raw.site.registration, ...this.logoInfo(raw.site.logo) },
      config: cfg,
      currency,
      orders: ordersActive,
      geo: !!overview,
      categories: list.map((c) => ({
        key: c.key,
        name: c.name,
        description: c.description,
        color: c.color,
        country_count: c.country_count,
        countries: c.countries,
        proxies: cfg.show_proxy_counts ? c.total : 0,
        products: c.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          currency: p.currency,
          stock: cfg.show_stock ? p.stock : null,
          in_stock: p.stock === null || p.stock > 0,
          pricing: p.pricing,
          per_gb: p.per_gb,
          renewal: p.renewal_enabled,
          specs: p.specs,
        })),
      })),
      totals: {
        categories: list.length,
        countries: allCountries.size,
        products: list.reduce((s, c) => s + c.products.length, 0),
        proxies: cfg.show_proxy_counts ? list.reduce((s, c) => s + c.total, 0) : 0,
      },
    };
  }

  /** Toutes les catégories connues (panel + catalogue), y compris celles masquées : sert à l'éditeur admin. */
  async categoryKeys(): Promise<{ key: string; name: string }[]> {
    const raw = await this.fetchRaw();
    const keys = new Set<string>();
    if (raw.overview) {
      keys.add('');
      for (const p of raw.overview.pools) keys.add(p.name);
    }
    for (const p of raw.catalog ?? []) keys.add(p.category ?? '');
    return [...keys].map((k) => ({ key: k, name: k }));
  }

  /** Logo de chemin relatif du panel (ex. /static/logo.png), relayé ici car /static du panel n'est pas joignable depuis l'iframe embarquée. */
  async logo(): Promise<{ type: string; body: Buffer } | null> {
    if (this.logoCache && Date.now() - this.logoCache.at < 300_000) return this.logoCache;
    const raw = await this.fetchRaw();
    const path = raw.site.logo;
    if (!path || /^https?:\/\//i.test(path) || !path.startsWith('/')) return null;
    try {
      const res = await fetch(`${this.panelUrl}${path}`, { signal: AbortSignal.timeout(6000) });
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || !/^image\/(png|jpe?g|gif|webp|svg\+xml|x-icon|vnd\.microsoft\.icon)/i.test(type)) return null;
      const body = Buffer.from(await res.arrayBuffer());
      if (body.length > 2_000_000) return null;
      this.logoCache = { at: Date.now(), type, body };
      return this.logoCache;
    } catch {
      return null;
    }
  }
}

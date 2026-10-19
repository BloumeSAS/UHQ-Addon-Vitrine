import { useCallback, useEffect, useState } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number | null;
  in_stock: boolean;
  pricing: 'fixed' | 'per_gb';
  per_gb: { min_gb: number; max_gb: number; step_gb: number } | null;
  renewal: boolean;
  specs: {
    threads_limit?: number;
    traffic_limit_bytes?: number;
    variable_traffic?: boolean;
    bandwidth_limit?: number;
    expires_value?: number;
    expires_unit?: 'day' | 'month' | 'year';
    country_filter?: string;
    sticky_session_ttl?: number;
    manual_approval?: boolean;
  } | null;
}

export interface Category {
  key: string;
  name: string;
  description: string;
  color: string;
  country_count: number;
  countries: { code: string; count: number }[];
  proxies: number;
  products: Product[];
}

export interface VitrineConfig {
  tagline: string;
  hero: { badge: string; title: string; highlight: string; subtitle: string; cta_primary: string; cta_secondary: string };
  sections: { stats: boolean; categories: boolean; countries: boolean; calculator: boolean; features: boolean; steps: boolean; faq: boolean; contact: boolean };
  show_prices: boolean;
  show_stock: boolean;
  show_proxy_counts: boolean;
  features: { icon: string; title: string; text: string }[];
  steps: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  contact: { discord: string; telegram: string; email: string; website: string };
  calculator: { avg_page_mb: number; default_gb: number };
  categories: Record<string, { hidden: boolean; label: string; description: string; order: number }>;
  footer_text: string;
  seo: { title: string; description: string };
}

export interface PublicData {
  site: { name: string; registration: boolean; external: string | null; hasLogo: boolean };
  config: VitrineConfig;
  currency: string;
  orders: boolean;
  geo: boolean;
  categories: Category[];
  totals: { categories: number; countries: number; products: number; proxies: number };
}

/** BASE_URL = "/" en déploiement classique, "/addon-proxy/vitrine/" une fois embarqué : jamais de chemin absolu "/api/...". */
export const BASE = import.meta.env.BASE_URL;

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function apiRequest<T>(method: string, path: string, token?: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}api/${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const m = (data as any)?.message ?? `HTTP ${res.status}`;
    throw new ApiError(Array.isArray(m) ? m.join(', ') : String(m), res.status);
  }
  return data as T;
}

export function usePublicData() {
  const [data, setData] = useState<PublicData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    setError('');
    apiRequest<PublicData>('GET', 'public')
      .then(setData)
      .catch((e) => setError(String(e.message)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);
  return { data, error, loading, reload: load };
}

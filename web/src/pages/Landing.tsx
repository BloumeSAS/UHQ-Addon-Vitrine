import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BASE, Category, Product, PublicData, usePublicData } from '../lib/api';
import { countryName, flagEmoji, fmtBytes, fmtMoney, fmtNumber } from '../lib/format';
import { DEFAULT_FAQ, DEFAULT_FEATURES, DEFAULT_STEPS, Lang, translate } from '../i18n';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

/** Les liens du panel s'ouvrent en pleine page (la vitrine est affichée dans une iframe par le panel). */
const LOGIN = '/login';
const REGISTER = '/register';
const STATUS = '/status';

function detectLang(param: string | null): Lang {
  if (param === 'fr' || param === 'en') return param;
  try {
    const saved = localStorage.getItem('vitrine_lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch { /* stockage indisponible */ }
  return (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function detectTheme(param: string | null): 'light' | 'dark' {
  if (param === 'light' || param === 'dark') return param;
  try {
    const saved = localStorage.getItem('vitrine_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* stockage indisponible */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applique les couleurs du thème personnalisé du panel (relayées par l'API de l'addon). */
function usePanelTheme(mode: 'light' | 'dark') {
  useEffect(() => {
    fetch(`${BASE}api/theme`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { themeColors: { light: Record<string, string>; dark: Record<string, string> } | null } | null) => {
        const colors = d?.themeColors?.[mode];
        if (!colors?.primary) return;
        const parts = colors.primary.trim().split(/\s+/);
        if (parts.length === 3) document.documentElement.style.setProperty('--primary', `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`);
      })
      .catch(() => undefined);
  }, [mode]);
}

export default function Landing() {
  const [params] = useSearchParams();
  const [lang, setLang] = useState<Lang>(() => detectLang(params.get('lang')));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => detectTheme(params.get('theme')));
  const { data, error, loading, reload } = usePublicData();
  const t: TFn = useMemo(() => (k, v) => translate(lang, k, v), [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('vitrine_theme', theme); } catch { /* ok */ }
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('vitrine_lang', lang); } catch { /* ok */ }
  }, [lang]);
  usePanelTheme(theme);

  useEffect(() => {
    if (!data) return;
    const c = data.config;
    document.title = c.seo.title || (c.tagline ? `${data.site.name} — ${c.tagline}` : data.site.name);
    const desc = c.seo.description || c.hero.subtitle || t('hero.subtitle');
    let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = desc;
  }, [data, t]);

  if (loading && !data) return <div className="v-center"><div className="v-spinner" />{t('ui.loading')}</div>;
  if (!data) return <div className="v-center"><p>{t('ui.error')}</p>{error && <small>{error}</small>}<button className="v-btn" onClick={reload}>{t('ui.retry')}</button></div>;

  return <Page data={data} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} />;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────

function Page({ data, lang, setLang, theme, setTheme, t }: { data: PublicData; lang: Lang; setLang: (l: Lang) => void; theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void; t: TFn }) {
  const cfg = data.config;
  const s = cfg.sections;
  const hasProducts = data.totals.products > 0;
  const hasGeo = data.geo && data.totals.countries > 0;
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const features = cfg.features.length ? cfg.features : DEFAULT_FEATURES[lang];
  const steps = cfg.steps.length ? cfg.steps : DEFAULT_STEPS[lang];
  const faq = cfg.faq.length ? cfg.faq : DEFAULT_FAQ[lang];
  const showPricing = s.categories && data.orders;
  const showCoverage = s.countries && hasGeo;
  const showCalc = s.calculator && data.orders && hasProducts;
  const year = new Date().getFullYear();

  const nav = [
    showPricing && ['pricing', t('nav.pricing')],
    showCoverage && ['coverage', t('nav.coverage')],
    showCalc && ['calculator', t('nav.calculator')],
    s.features && ['features', t('nav.features')],
    s.faq && ['faq', t('nav.faq')],
  ].filter(Boolean) as [string, string][];

  const go = (id: string) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const logo = data.site.external ?? `${BASE}api/logo`;

  return (
    <div className="v-root">
      <header className={`v-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="v-wrap v-header-in">
          <a className="v-brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            {data.site.hasLogo && <img src={logo} alt="" className="v-logo" onError={(e) => ((e.currentTarget.style.display = 'none'))} />}
            <span>{data.site.name}</span>
          </a>
          <nav className={`v-nav ${menu ? 'open' : ''}`} aria-label="Navigation">
            {nav.map(([id, label]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>)}
          </nav>
          <div className="v-actions">
            <button className="v-icon-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} aria-label={t('ui.lang')} title={t('ui.lang')}>{lang.toUpperCase()}</button>
            <button className="v-icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={t('ui.theme')} title={t('ui.theme')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <a className="v-btn ghost v-hide-sm" href={LOGIN} target="_top">{t('nav.login')}</a>
            {data.site.registration && <a className="v-btn primary v-hide-sm" href={REGISTER} target="_top">{t('nav.register')}</a>}
            <button className="v-icon-btn v-burger" onClick={() => setMenu((v) => !v)} aria-label={t('ui.menu')} aria-expanded={menu}>☰</button>
          </div>
        </div>
        {menu && (
          <div className="v-mobile-menu">
            {nav.map(([id, label]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>)}
            <a href={LOGIN} target="_top">{t('nav.login')}</a>
            {data.site.registration && <a href={REGISTER} target="_top">{t('nav.register')}</a>}
          </div>
        )}
      </header>

      <main id="top">
        <Hero data={data} t={t} lang={lang} showPricing={showPricing} />
        {showPricing && <Pricing data={data} t={t} lang={lang} />}
        {showCoverage && <Coverage data={data} t={t} lang={lang} />}
        {showCalc && <Calculator data={data} t={t} lang={lang} />}
        {s.features && (
          <section id="features" className="v-section">
            <div className="v-wrap">
              <Head title={t('features.title')} sub={t('features.sub')} />
              <div className="v-grid v-grid-3">
                {features.map((f, i) => (
                  <div key={i} className="v-card v-feature">
                    <div className="v-ico">{f.icon || ['🛡️', '⚡', '📈', '🌍', '🚀', '💬'][i % 6]}</div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {s.steps && (
          <section id="steps" className="v-section alt">
            <div className="v-wrap">
              <Head title={t('steps.title')} sub={t('steps.sub')} />
              <ol className="v-steps">
                {steps.map((st, i) => (
                  <li key={i} className="v-card"><span className="v-step-n">{i + 1}</span><h3>{st.title}</h3><p>{st.text}</p></li>
                ))}
              </ol>
            </div>
          </section>
        )}
        {s.faq && (
          <section id="faq" className="v-section">
            <div className="v-wrap v-narrow">
              <Head title={t('faq.title')} />
              <div className="v-faq">
                {faq.map((f, i) => (
                  <details key={i} className="v-card v-faq-item">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="v-section">
          <div className="v-wrap">
            <div className="v-final">
              <h2>{t('final.title')}</h2>
              <p>{t('final.sub')}</p>
              <div className="v-cta">
                <a className="v-btn primary lg" href={data.site.registration ? REGISTER : LOGIN} target="_top">{data.site.registration ? t('nav.register') : t('nav.login')}</a>
                {data.site.registration && <a className="v-btn lg" href={LOGIN} target="_top">{t('nav.login')}</a>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="v-footer">
        <div className="v-wrap v-footer-grid">
          <div>
            <div className="v-brand">
              {data.site.hasLogo && <img src={logo} alt="" className="v-logo" onError={(e) => ((e.currentTarget.style.display = 'none'))} />}
              <span>{data.site.name}</span>
            </div>
            {cfg.tagline && <p className="v-muted v-foot-tag">{cfg.tagline}</p>}
          </div>
          <div>
            <h4>{t('footer.platform')}</h4>
            <ul>
              {nav.map(([id, label]) => <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a></li>)}
              <li><a href={LOGIN} target="_top">{t('nav.login')}</a></li>
              {data.site.registration && <li><a href={REGISTER} target="_top">{t('nav.register')}</a></li>}
            </ul>
          </div>
          <div>
            <h4>{t('footer.resources')}</h4>
            <ul><li><a href={STATUS} target="_top">{t('nav.status')}</a></li></ul>
          </div>
          {s.contact && (cfg.contact.discord || cfg.contact.telegram || cfg.contact.email || cfg.contact.website) && (
            <div>
              <h4>{t('footer.contact')}</h4>
              <ul>
                {cfg.contact.discord && <li><a href={cfg.contact.discord} target="_blank" rel="noopener noreferrer">Discord</a></li>}
                {cfg.contact.telegram && <li><a href={cfg.contact.telegram} target="_blank" rel="noopener noreferrer">Telegram</a></li>}
                {cfg.contact.email && <li><a href={`mailto:${cfg.contact.email}`}>{cfg.contact.email}</a></li>}
                {cfg.contact.website && <li><a href={cfg.contact.website} target="_blank" rel="noopener noreferrer">{cfg.contact.website.replace(/^https?:\/\//, '')}</a></li>}
              </ul>
            </div>
          )}
        </div>
        <div className="v-wrap v-copy">
          <span>© {year} {data.site.name}. {cfg.footer_text || t('footer.rights')}</span>
          <a href="https://bloume.fr" target="_blank" rel="noopener noreferrer">UHQ Panel OS by Bloume.fr</a>
        </div>
      </footer>
    </div>
  );
}

function Head({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="v-head">
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function Hero({ data, t, lang, showPricing }: { data: PublicData; t: TFn; lang: Lang; showPricing: boolean }) {
  const c = data.config;
  const h = c.hero;
  const stats = [
    data.totals.categories > 0 && { n: data.totals.categories, l: t('stats.categories') },
    data.totals.countries > 0 && { n: data.totals.countries, l: t('stats.countries') },
    data.totals.products > 0 && { n: data.totals.products, l: t('stats.products') },
    data.totals.proxies > 0 && { n: data.totals.proxies, l: t('stats.proxies') },
  ].filter(Boolean) as { n: number; l: string }[];
  return (
    <section className="v-hero">
      <div className="v-hero-bg" aria-hidden="true" />
      <div className="v-wrap v-hero-in">
        <span className="v-badge"><i className="v-dot" />{h.badge || t('hero.badge')}</span>
        <h1>{h.title || t('hero.title')} <span className="v-grad">{h.highlight || t('hero.highlight')}</span></h1>
        <p className="v-lead">{h.subtitle || t('hero.subtitle')}</p>
        <div className="v-cta">
          <a className="v-btn primary lg" href={data.site.registration ? REGISTER : LOGIN} target="_top">{h.cta_primary || t('cta.primary')}</a>
          {showPricing && <a className="v-btn lg" href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>{h.cta_secondary || t('cta.secondary')}</a>}
        </div>
        {c.sections.stats && stats.length > 0 && (
          <div className="v-stats">
            {stats.map((s) => <div key={s.l} className="v-stat"><b>{fmtNumber(s.n, lang)}</b><span>{s.l}</span></div>)}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Tarifs ─────────────────────────────────────────────────────────────────────────────────

function catLabel(c: Category, lang: Lang): string {
  return c.name || (lang === 'fr' ? 'Général' : 'General');
}

function Pricing({ data, t, lang }: { data: PublicData; t: TFn; lang: Lang }) {
  const cats = data.categories.filter((c) => c.products.length > 0);
  const [active, setActive] = useState(cats[0]?.key ?? '');
  const cat = cats.find((c) => c.key === active) ?? cats[0];
  return (
    <section id="pricing" className="v-section alt">
      <div className="v-wrap">
        <Head title={t('pricing.title')} sub={t('pricing.sub')} />
        {cats.length === 0 ? (
          <div className="v-empty"><b>{t('pricing.none')}</b><span>{t('pricing.noneSub')}</span></div>
        ) : (
          <>
            {cats.length > 1 && (
              <div className="v-tabs" role="tablist">
                {cats.map((c) => (
                  <button key={c.key} role="tab" aria-selected={cat?.key === c.key} className={`v-tab ${cat?.key === c.key ? 'on' : ''}`} onClick={() => setActive(c.key)}>
                    <i style={{ background: c.color }} />{catLabel(c, lang)}
                    {c.country_count > 0 && <em>{t('coverage.countries', { n: c.country_count })}</em>}
                  </button>
                ))}
              </div>
            )}
            {cat && (
              <>
                <div className="v-cat-head">
                  {cat.description && <p>{cat.description}</p>}
                  {cat.country_count > 0 && <span className="v-pill">🌍 {t('coverage.countries', { n: cat.country_count })}</span>}
                </div>
                <div className="v-grid v-grid-3">
                  {cat.products.map((p) => <ProductCard key={p.id} p={p} data={data} t={t} lang={lang} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function specList(p: Product, t: TFn, lang: Lang): string[] {
  const sp = p.specs;
  if (!sp) return [];
  const out: string[] = [];
  if (sp.variable_traffic) out.push(t('spec.variable'));
  else if (sp.traffic_limit_bytes) out.push(t('spec.traffic', { v: fmtBytes(sp.traffic_limit_bytes, lang) }));
  else out.push(t('spec.unlimited'));
  if (sp.threads_limit) out.push(t('spec.threads', { n: sp.threads_limit }));
  if (sp.bandwidth_limit) out.push(t('spec.bandwidth', { n: sp.bandwidth_limit }));
  out.push(sp.expires_value ? t('spec.validity', { n: sp.expires_value, u: t(`unit.${sp.expires_unit ?? 'day'}`) }) : t('spec.forever'));
  if (sp.country_filter) out.push(t('spec.country', { v: sp.country_filter.split(',').map((c) => countryName(c.trim().toUpperCase(), lang)).join(', ') }));
  if (sp.sticky_session_ttl) out.push(t('spec.sticky', { n: sp.sticky_session_ttl }));
  if (p.renewal) out.push(t('spec.renewal'));
  if (sp.manual_approval) out.push(t('spec.manual'));
  return out;
}

function ProductCard({ p, data, t, lang }: { p: Product; data: PublicData; t: TFn; lang: Lang }) {
  const showPrice = data.config.show_prices;
  const perGb = p.pricing === 'per_gb';
  const specs = specList(p, t, lang);
  const low = p.stock !== null && p.stock > 0 && p.stock <= 5;
  return (
    <article className="v-card v-product">
      <div className="v-product-top">
        <h3>{p.name}</h3>
        {low && <span className="v-pill warn">{t('stock.low', { n: p.stock! })}</span>}
      </div>
      {p.description && <p className="v-muted v-desc">{p.description}</p>}
      {showPrice && (
        <div className="v-price">
          {perGb && <small>{t('price.from')}</small>}
          <b>{fmtMoney(p.price, p.currency, lang)}</b>
          <span>{perGb ? t('price.perGb') : t('price.perUnit')}</span>
        </div>
      )}
      {perGb && p.per_gb && (
        <div className="v-muted v-range">{p.per_gb.max_gb > 0 ? t('price.range', { min: p.per_gb.min_gb, max: p.per_gb.max_gb }) : t('price.rangeMin', { min: p.per_gb.min_gb })}</div>
      )}
      <ul className="v-specs">{specs.map((s) => <li key={s}><i>✓</i>{s}</li>)}</ul>
      <a className="v-btn primary block" href={data.site.registration ? REGISTER : LOGIN} target="_top">{t('buy.login')}</a>
      <small className="v-muted v-center-t">{t('buy.hint')}</small>
    </article>
  );
}

// ─── Couverture ─────────────────────────────────────────────────────────────────────────────

function Flag({ code }: { code: string }) {
  const [bad, setBad] = useState(false);
  if (bad) return <span className="v-flag-emoji">{flagEmoji(code)}</span>;
  return <img className="v-flag" src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt="" loading="lazy" width={22} height={16} onError={() => setBad(true)} />;
}

function Coverage({ data, t, lang }: { data: PublicData; t: TFn; lang: Lang }) {
  const cats = data.categories.filter((c) => c.country_count > 0);
  const [active, setActive] = useState('__all');
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cats) if (active === '__all' || c.key === active) for (const x of c.countries) map.set(x.code, (map.get(x.code) ?? 0) + x.count);
    const needle = q.trim().toLowerCase();
    return [...map.entries()]
      .map(([code, count]) => ({ code, count, name: countryName(code, lang) }))
      .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.code.toLowerCase() === needle)
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  }, [cats, active, q, lang]);
  const showCounts = data.config.show_proxy_counts;
  return (
    <section id="coverage" className="v-section">
      <div className="v-wrap">
        <Head title={t('coverage.title')} sub={t('coverage.sub')} />
        <div className="v-tabs" role="tablist">
          <button className={`v-tab ${active === '__all' ? 'on' : ''}`} onClick={() => setActive('__all')}>{t('coverage.all')}<em>{t('coverage.countries', { n: data.totals.countries })}</em></button>
          {cats.map((c) => (
            <button key={c.key} className={`v-tab ${active === c.key ? 'on' : ''}`} onClick={() => setActive(c.key)}>
              <i style={{ background: c.color }} />{catLabel(c, lang)}<em>{t('coverage.countries', { n: c.country_count })}</em>
            </button>
          ))}
        </div>
        <div className="v-search"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('coverage.search')} aria-label={t('coverage.search')} /></div>
        {list.length === 0 ? (
          <div className="v-empty"><span>{t('coverage.none')}</span></div>
        ) : (
          <ul className="v-countries">
            {list.map((c) => (
              <li key={c.code} className="v-country">
                <Flag code={c.code} />
                <span>{c.name}</span>
                {showCounts && c.count > 0 && <em>{fmtNumber(c.count, lang)}</em>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ─── Simulateur ─────────────────────────────────────────────────────────────────────────────

function Calculator({ data, t, lang }: { data: PublicData; t: TFn; lang: Lang }) {
  const cats = data.categories.filter((c) => c.products.length > 0);
  const [catKey, setCatKey] = useState(cats[0]?.key ?? '');
  const cat = cats.find((c) => c.key === catKey) ?? cats[0];
  const [pid, setPid] = useState('');
  const product = cat?.products.find((p) => p.id === pid) ?? cat?.products[0];
  const [gb, setGb] = useState(data.config.calculator.default_gb);
  const [qty, setQty] = useState(1);
  const [req, setReq] = useState(5000);
  const [days, setDays] = useState(30);
  const [pageMb, setPageMb] = useState(data.config.calculator.avg_page_mb);
  const [note, setNote] = useState('');
  const pidRef = useRef('');

  const perGb = product?.pricing === 'per_gb' && !!product.per_gb;
  const lim = product?.per_gb ?? { min_gb: 1, max_gb: 0, step_gb: 1 };
  const max = lim.max_gb > 0 ? lim.max_gb : Math.max(lim.min_gb, 1000);
  const step = lim.step_gb > 0 ? lim.step_gb : 1;

  // Quand l'offre change : volume ramené dans ses limites.
  useEffect(() => {
    if (product && pidRef.current !== product.id) {
      pidRef.current = product.id;
      if (product.per_gb) setGb((g) => Math.min(max, Math.max(product.per_gb!.min_gb, g)));
      setNote('');
    }
  }, [product, max]);

  if (!cat || !product) return null;

  const clampGb = (v: number) => {
    const s = Math.ceil(v / step) * step;
    return Math.min(max, Math.max(lim.min_gb, s));
  };
  const needs = (req * pageMb * days) / 1000;
  const includedGb = product.specs?.traffic_limit_bytes ? product.specs.traffic_limit_bytes / 1e9 : 0;
  const total = perGb ? product.price * gb : product.price * qty;
  const effGb = perGb ? product.price : includedGb > 0 ? product.price / includedGb : 0;
  const volumeGb = perGb ? gb : includedGb * qty;
  const pages = volumeGb > 0 && pageMb > 0 ? Math.floor((volumeGb * 1000) / pageMb) : 0;

  const applyNeeds = () => {
    const v = clampGb(needs);
    setGb(v);
    setNote(Math.abs(v - needs) > step ? t('calc.clamped', { min: lim.min_gb, max: lim.max_gb > 0 ? lim.max_gb : '∞' }) : '');
  };

  return (
    <section id="calculator" className="v-section alt">
      <div className="v-wrap">
        <Head title={t('calc.title')} sub={t('calc.sub')} />
        <div className="v-calc">
          <div className="v-card v-calc-form">
            {cats.length > 1 && (
              <label>
                <span>{t('calc.category')}</span>
                <select value={cat.key} onChange={(e) => { setCatKey(e.target.value); setPid(''); }}>
                  {cats.map((c) => <option key={c.key} value={c.key}>{catLabel(c, lang)}</option>)}
                </select>
              </label>
            )}
            <label>
              <span>{t('calc.product')}</span>
              <select value={product.id} onChange={(e) => setPid(e.target.value)}>
                {cat.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>

            {perGb ? (
              <>
                <label>
                  <span>{t('calc.volume')} — <b>{fmtNumber(gb, lang)} {t('calc.gb')}</b></span>
                  <input type="range" min={lim.min_gb} max={max} step={step} value={Math.min(gb, max)} onChange={(e) => setGb(Number(e.target.value))} />
                  <div className="v-num">
                    <input type="number" min={lim.min_gb} max={max} step={step} value={gb} onChange={(e) => setGb(Number(e.target.value) || lim.min_gb)} onBlur={() => setGb(clampGb(gb))} />
                    <em>{t('calc.gb')}</em>
                  </div>
                </label>
                <details className="v-est">
                  <summary>{t('calc.estimate')}</summary>
                  <div className="v-est-grid">
                    <label><span>{t('calc.requests')}</span><input type="number" min={1} value={req} onChange={(e) => setReq(Math.max(1, Number(e.target.value) || 1))} /></label>
                    <label><span>{t('calc.pageMb')}</span><input type="number" min={0.01} step={0.1} value={pageMb} onChange={(e) => setPageMb(Math.max(0.01, Number(e.target.value) || 0.01))} /></label>
                    <label><span>{t('calc.days')}</span><input type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} /></label>
                  </div>
                  <div className="v-est-res">
                    <b>{t('calc.needs', { v: fmtNumber(needs, lang) })}</b>
                    <button className="v-btn sm" onClick={applyNeeds}>{t('calc.apply')}</button>
                  </div>
                  {note && <small className="v-muted">{note}</small>}
                </details>
              </>
            ) : (
              <label>
                <span>{t('calc.qty')}</span>
                <div className="v-num"><input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} /></div>
                <small className="v-muted">{t('calc.fixedNote')}</small>
              </label>
            )}
          </div>

          <div className="v-card v-calc-res">
            <div className="v-muted">{t('calc.total')}</div>
            <div className="v-total">{data.config.show_prices ? fmtMoney(total, product.currency, lang) : '—'}</div>
            {data.config.show_prices && effGb > 0 && <div className="v-muted">{t('calc.perGb', { v: fmtMoney(effGb, product.currency, lang) })}</div>}
            {!perGb && includedGb > 0 && <div className="v-pill">{t('calc.included', { v: fmtBytes(includedGb * 1e9 * qty, lang) })}</div>}
            {pages > 0 && <div className="v-muted v-pages">{t('calc.pages', { n: fmtNumber(pages, lang) })}</div>}
            <a className="v-btn primary block" href={data.site.registration ? REGISTER : LOGIN} target="_top">{t('calc.cta')}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

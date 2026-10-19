import { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest, BASE, VitrineConfig } from '../lib/api';
import { usePanelTheme } from '../lib/panelTheme';

const EMPTY: VitrineConfig = {
  tagline: '',
  hero: { badge: '', title: '', highlight: '', subtitle: '', cta_primary: '', cta_secondary: '' },
  sections: { stats: true, categories: true, countries: true, calculator: true, features: true, steps: true, faq: true, contact: true },
  show_prices: true, show_stock: true, show_proxy_counts: false,
  features: [], steps: [], faq: [],
  contact: { discord: '', telegram: '', email: '', website: '' },
  calculator: { avg_page_mb: 2, default_gb: 10 },
  categories: {}, footer_text: '', seo: { title: '', description: '' },
};

const SECTION_LABELS: Record<keyof VitrineConfig['sections'], string> = {
  stats: 'Chiffres clés (hero)', categories: 'Tarifs par catégorie (addon Orders)', countries: 'Couverture : pays disponibles', calculator: 'Simulateur de prix',
  features: 'Avantages', steps: 'Comment ça marche', faq: 'FAQ', contact: 'Liens de contact (pied de page)',
};

/** Section repliable : l'en-tête seul est visible, un clic affiche les champs. */
function Section({ title, hint, children, defaultOpen = false }: { title: string; hint?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="a-sec">
      <button type="button" className="a-sec-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span><b>{title}</b>{hint && !open && <small>{hint}</small>}</span>
        <i style={{ transform: open ? 'rotate(180deg)' : undefined }}>▾</i>
      </button>
      {open && <div className="a-sec-body">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="a-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="a-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><b>{label}</b>{hint && <small>{hint}</small>}</span>
    </label>
  );
}

export default function Admin() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const theme = params.get('theme') === 'light' ? 'light' : 'dark';
  const lang = params.get('lang') === 'en' ? 'en' : 'fr';
  const [preview, setPreview] = useState<'off' | 'desktop' | 'mobile'>('off');
  usePanelTheme(theme);
  const [cfg, setCfg] = useState<VitrineConfig>(EMPTY);
  const [cats, setCats] = useState<{ key: string; name: string }[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token) { setState('error'); setError('Connexion requise : ouvrez cette page depuis le panel.'); return; }
    apiRequest<{ config: VitrineConfig; categories: { key: string; name: string }[] }>('GET', 'config', token)
      .then((r) => { setCfg({ ...EMPTY, ...r.config }); setCats(r.categories); setState('ready'); })
      .catch((e) => { setState('error'); setError(e.status === 401 || e.status === 403 ? 'Accès réservé aux administrateurs.' : String(e.message)); });
  }, [token]);

  const set = <K extends keyof VitrineConfig>(k: K, v: VitrineConfig[K]) => { setCfg((c) => ({ ...c, [k]: v })); setSaved(false); };
  const setIn = <K extends 'hero' | 'contact' | 'seo' | 'calculator' | 'sections'>(k: K, patch: Partial<VitrineConfig[K]>) => set(k, { ...cfg[k], ...patch } as VitrineConfig[K]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const r = await apiRequest<{ config: VitrineConfig }>('PUT', 'config', token, { config: cfg });
      setCfg({ ...EMPTY, ...r.config });
      setSaved(true);
      setSaveCount((n) => n + 1);
    } catch (e: any) {
      setError(String(e.message));
    } finally {
      setSaving(false);
    }
  };

  if (state === 'loading') return <div className="a-page"><p className="a-muted">Chargement…</p></div>;
  if (state === 'error') return <div className="a-page"><div className="a-alert">{error}</div></div>;

  const catRow = (key: string) => cfg.categories[key] ?? { hidden: false, label: '', description: '', order: 0 };
  const setCat = (key: string, patch: Partial<VitrineConfig['categories'][string]>) => set('categories', { ...cfg.categories, [key]: { ...catRow(key), ...patch } });
  const publicUrl = (() => { try { return (window.top ?? window).location.origin + '/'; } catch { return '/'; } })();

  return (
    <div className="a-page">
      <div className="a-head">
        <div>
          <h1>Vitrine</h1>
          <p className="a-muted">Page d’accueil publique affichée sur <code>/</code> aux visiteurs non connectés. Les champs vides utilisent le texte par défaut (français / anglais selon le visiteur).</p>
        </div>
        <div className="a-head-actions">
          <button type="button" className="a-btn" onClick={() => setPreview(preview === 'off' ? 'desktop' : 'off')}>{preview === 'off' ? 'Aperçu' : 'Fermer l’aperçu'}</button>
          <button className="a-btn primary" onClick={save} disabled={saving}>{saving ? '…' : 'Enregistrer'}</button>
        </div>
      </div>
      {preview !== 'off' && (
        <div className="a-preview">
          <div className="a-preview-bar">
            <span className="a-muted">Aperçu de la page publique (enregistrez pour voir vos modifications)</span>
            <div className="a-seg">
              <button type="button" className={preview === 'desktop' ? 'on' : ''} onClick={() => setPreview('desktop')}>Ordinateur</button>
              <button type="button" className={preview === 'mobile' ? 'on' : ''} onClick={() => setPreview('mobile')}>Mobile</button>
            </div>
          </div>
          <div className="a-preview-stage">
            <iframe title="Aperçu de la vitrine" className={`a-preview-frame ${preview}`} src={`${BASE}?theme=${theme}&lang=${lang}&_=${saveCount}`} />
          </div>
        </div>
      )}
      {saved && <div className="a-ok">Enregistré. La vitrine est mise à jour (cache de 30 secondes). Page publique : {publicUrl}</div>}
      {error && <div className="a-alert">{error}</div>}

      <Section title="Sections affichées" hint="Choisir ce qui apparaît sur la page">
        <div className="a-grid">
          {(Object.keys(SECTION_LABELS) as (keyof VitrineConfig['sections'])[]).map((k) => (
            <Toggle key={k} label={SECTION_LABELS[k]} checked={cfg.sections[k]} onChange={(v) => setIn('sections', { [k]: v } as any)} />
          ))}
        </div>
        <div className="a-grid">
          <Toggle label="Afficher les prix" checked={cfg.show_prices} onChange={(v) => set('show_prices', v)} />
          <Toggle label="Afficher « plus que N en stock »" hint="Seulement quand le stock est faible" checked={cfg.show_stock} onChange={(v) => set('show_stock', v)} />
          <Toggle label="Afficher le nombre de proxies" hint="Par pays et au total (chiffres du pool réel)" checked={cfg.show_proxy_counts} onChange={(v) => set('show_proxy_counts', v)} />
        </div>
      </Section>

      <Section title="Titre et accroche (hero)" hint="Badge, titre, sous-titre, boutons">
        <div className="a-grid">
          <Field label="Badge"><input value={cfg.hero.badge} maxLength={80} onChange={(e) => setIn('hero', { badge: e.target.value })} placeholder="Plateforme de proxies professionnelle" /></Field>
          <Field label="Accroche (pied de page et titre de l’onglet)"><input value={cfg.tagline} maxLength={140} onChange={(e) => set('tagline', e.target.value)} /></Field>
          <Field label="Titre"><input value={cfg.hero.title} maxLength={120} onChange={(e) => setIn('hero', { title: e.target.value })} placeholder="Des proxies fiables," /></Field>
          <Field label="Fin du titre (en dégradé)"><input value={cfg.hero.highlight} maxLength={80} onChange={(e) => setIn('hero', { highlight: e.target.value })} placeholder="prêts en quelques secondes" /></Field>
          <Field label="Bouton principal"><input value={cfg.hero.cta_primary} maxLength={40} onChange={(e) => setIn('hero', { cta_primary: e.target.value })} placeholder="Commencer maintenant" /></Field>
          <Field label="Bouton secondaire"><input value={cfg.hero.cta_secondary} maxLength={40} onChange={(e) => setIn('hero', { cta_secondary: e.target.value })} placeholder="Voir les tarifs" /></Field>
        </div>
        <Field label="Sous-titre"><textarea rows={2} value={cfg.hero.subtitle} maxLength={400} onChange={(e) => setIn('hero', { subtitle: e.target.value })} /></Field>
      </Section>

      <Section title="Catégories" hint={`${cats.length} catégorie(s) détectée(s)`}>
        <p className="a-muted">Renommez, décrivez, ordonnez ou masquez chaque catégorie du panel. Un nom vide garde le nom du panel.</p>
        {cats.length === 0 && <p className="a-muted">Aucune catégorie détectée (vérifiez la clé API du panel et l’addon Orders).</p>}
        {cats.map((c) => {
          const r = catRow(c.key);
          return (
            <div key={c.key} className="a-cat">
              <div className="a-cat-top"><b>{c.key || 'Général (pool par défaut)'}</b><Toggle label="Masquer" checked={r.hidden} onChange={(v) => setCat(c.key, { hidden: v })} /></div>
              <div className="a-grid">
                <Field label="Nom affiché"><input value={r.label} maxLength={80} onChange={(e) => setCat(c.key, { label: e.target.value })} /></Field>
                <Field label="Ordre" hint="Plus petit = plus haut"><input type="number" value={r.order} onChange={(e) => setCat(c.key, { order: Number(e.target.value) || 0 })} /></Field>
              </div>
              <Field label="Description"><textarea rows={2} value={r.description} maxLength={400} onChange={(e) => setCat(c.key, { description: e.target.value })} /></Field>
            </div>
          );
        })}
      </Section>

      <Section title="Simulateur de prix" hint="Valeurs par défaut du calculateur">
        <div className="a-grid">
          <Field label="Volume par défaut (Go)"><input type="number" min={1} value={cfg.calculator.default_gb} onChange={(e) => setIn('calculator', { default_gb: Number(e.target.value) || 1 })} /></Field>
          <Field label="Poids moyen d’une requête (Mo)" hint="Sert à estimer le nombre de pages chargées"><input type="number" min={0.01} step={0.1} value={cfg.calculator.avg_page_mb} onChange={(e) => setIn('calculator', { avg_page_mb: Number(e.target.value) || 2 })} /></Field>
        </div>
      </Section>

      <Section title="Avantages" hint={cfg.features.length ? `${cfg.features.length} personnalisé(s)` : 'Contenu par défaut'}>
        <p className="a-muted">Laissez vide pour le contenu par défaut. Icône = un emoji.</p>
        {cfg.features.map((f, i) => (
          <div key={i} className="a-row">
            <input className="a-icon" value={f.icon} maxLength={8} placeholder="🚀" onChange={(e) => set('features', cfg.features.map((x, k) => (k === i ? { ...x, icon: e.target.value } : x)))} />
            <input value={f.title} maxLength={80} placeholder="Titre" onChange={(e) => set('features', cfg.features.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
            <input className="a-wide" value={f.text} maxLength={300} placeholder="Description" onChange={(e) => set('features', cfg.features.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))} />
            <button type="button" className="a-x" onClick={() => set('features', cfg.features.filter((_, k) => k !== i))} aria-label="Supprimer">✕</button>
          </div>
        ))}
        <button type="button" className="a-btn" disabled={cfg.features.length >= 12} onClick={() => set('features', [...cfg.features, { icon: '', title: '', text: '' }])}>+ Ajouter un avantage</button>
      </Section>

      <Section title="Comment ça marche" hint={cfg.steps.length ? `${cfg.steps.length} étape(s)` : 'Contenu par défaut'}>
        {cfg.steps.map((f, i) => (
          <div key={i} className="a-row">
            <input value={f.title} maxLength={80} placeholder="Titre" onChange={(e) => set('steps', cfg.steps.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
            <input className="a-wide" value={f.text} maxLength={300} placeholder="Description" onChange={(e) => set('steps', cfg.steps.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))} />
            <button type="button" className="a-x" onClick={() => set('steps', cfg.steps.filter((_, k) => k !== i))} aria-label="Supprimer">✕</button>
          </div>
        ))}
        <button type="button" className="a-btn" disabled={cfg.steps.length >= 8} onClick={() => set('steps', [...cfg.steps, { title: '', text: '' }])}>+ Ajouter une étape</button>
      </Section>

      <Section title="FAQ" hint={cfg.faq.length ? `${cfg.faq.length} question(s)` : 'Contenu par défaut'}>
        {cfg.faq.map((f, i) => (
          <div key={i} className="a-cat">
            <div className="a-cat-top"><input className="a-wide" value={f.q} maxLength={160} placeholder="Question" onChange={(e) => set('faq', cfg.faq.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)))} /><button type="button" className="a-x" onClick={() => set('faq', cfg.faq.filter((_, k) => k !== i))} aria-label="Supprimer">✕</button></div>
            <textarea rows={2} value={f.a} maxLength={1000} placeholder="Réponse" onChange={(e) => set('faq', cfg.faq.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)))} />
          </div>
        ))}
        <button type="button" className="a-btn" disabled={cfg.faq.length >= 20} onClick={() => set('faq', [...cfg.faq, { q: '', a: '' }])}>+ Ajouter une question</button>
      </Section>

      <Section title="Contact et pied de page" hint="Discord, Telegram, e-mail, site">
        <div className="a-grid">
          <Field label="Discord (lien)"><input value={cfg.contact.discord} placeholder="https://discord.gg/…" onChange={(e) => setIn('contact', { discord: e.target.value })} /></Field>
          <Field label="Telegram (lien)"><input value={cfg.contact.telegram} placeholder="https://t.me/…" onChange={(e) => setIn('contact', { telegram: e.target.value })} /></Field>
          <Field label="E-mail"><input value={cfg.contact.email} placeholder="contact@exemple.fr" onChange={(e) => setIn('contact', { email: e.target.value })} /></Field>
          <Field label="Site web"><input value={cfg.contact.website} placeholder="https://exemple.fr" onChange={(e) => setIn('contact', { website: e.target.value })} /></Field>
        </div>
        <Field label="Texte du pied de page" hint="Remplace « Tous droits réservés. »"><input value={cfg.footer_text} maxLength={200} onChange={(e) => set('footer_text', e.target.value)} /></Field>
      </Section>

      <Section title="Référencement (SEO)" hint="Titre et description de la page">
        <Field label="Titre de la page"><input value={cfg.seo.title} maxLength={70} onChange={(e) => setIn('seo', { title: e.target.value })} /></Field>
        <Field label="Description"><textarea rows={2} value={cfg.seo.description} maxLength={200} onChange={(e) => setIn('seo', { description: e.target.value })} /></Field>
      </Section>

      <div className="a-foot"><button className="a-btn primary" onClick={save} disabled={saving}>{saving ? '…' : 'Enregistrer'}</button></div>
    </div>
  );
}

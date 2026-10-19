export type Lang = 'fr' | 'en';
type Dict = Record<string, string>;

const fr: Dict = {
  'nav.pricing': 'Tarifs', 'nav.coverage': 'Couverture', 'nav.calculator': 'Simulateur', 'nav.features': 'Avantages', 'nav.faq': 'FAQ',
  'nav.login': 'Connexion', 'nav.register': 'Créer un compte', 'nav.status': 'État du service',
  'hero.badge': 'Plateforme de proxies professionnelle', 'hero.title': 'Des proxies fiables,', 'hero.highlight': 'prêts en quelques secondes',
  'hero.subtitle': 'Choisissez votre catégorie, votre volume, et recevez vos accès immédiatement. Pays sélectionnables, trafic transparent, support réactif.',
  'cta.primary': 'Commencer maintenant', 'cta.secondary': 'Voir les tarifs',
  'stats.categories': 'catégories', 'stats.countries': 'pays disponibles', 'stats.products': 'offres', 'stats.proxies': 'proxies en ligne',
  'pricing.title': 'Tarifs et offres', 'pricing.sub': 'Choisissez une catégorie pour découvrir ses offres.',
  'pricing.none': 'Aucune offre disponible pour le moment.', 'pricing.noneSub': 'Revenez bientôt ou contactez-nous.',
  'price.from': 'à partir de', 'price.perGb': '/ Go', 'price.range': 'De {min} à {max} Go', 'price.rangeMin': 'À partir de {min} Go', 'price.perUnit': 'par compte',
  'spec.traffic': '{v} de trafic', 'spec.variable': 'Trafic au choix', 'spec.unlimited': 'Trafic illimité', 'spec.threads': '{n} connexions simultanées', 'spec.bandwidth': 'Débit {n} Mo/s',
  'spec.validity': 'Valable {n} {u}', 'spec.forever': 'Sans expiration', 'spec.country': 'Pays : {v}', 'spec.sticky': 'Session fixe {n} min', 'spec.renewal': 'Renouvellement auto', 'spec.manual': 'Activation sous validation',
  'unit.day': 'jour(s)', 'unit.month': 'mois', 'unit.year': 'an(s)',
  'stock.low': 'Plus que {n} en stock', 'stock.ok': 'En stock',
  'buy.login': 'Commander', 'buy.register': 'Créer un compte pour commander', 'buy.hint': 'Connectez-vous pour finaliser votre commande.',
  'coverage.title': 'Couverture mondiale', 'coverage.sub': 'Les pays réellement disponibles, mis à jour en direct depuis notre réseau.',
  'coverage.countries': '{n} pays', 'coverage.search': 'Rechercher un pays…', 'coverage.all': 'Toutes', 'coverage.none': 'Aucun pays ne correspond.', 'coverage.noGeo': 'Les pays disponibles s’afficheront ici.', 'coverage.proxies': '{n} proxies',
  'calc.title': 'Simulateur de prix', 'calc.sub': 'Estimez votre budget en quelques secondes.',
  'calc.category': 'Catégorie', 'calc.product': 'Offre', 'calc.volume': 'Volume', 'calc.qty': 'Quantité', 'calc.gb': 'Go', 'calc.total': 'Total estimé', 'calc.perGb': 'soit {v} par Go',
  'calc.estimate': 'Estimer ma consommation', 'calc.requests': 'Requêtes par jour', 'calc.pageMb': 'Poids moyen par requête (Mo)', 'calc.days': 'Durée (jours)', 'calc.needs': 'Besoin estimé : {v} Go',
  'calc.apply': 'Appliquer ce volume', 'calc.clamped': 'Ajusté aux limites de l’offre ({min}–{max} Go).', 'calc.pages': '≈ {n} pages web chargées', 'calc.none': 'Le simulateur sera disponible dès qu’une offre est publiée.',
  'calc.included': '{v} inclus', 'calc.cta': 'Commander ce volume', 'calc.fixedNote': 'Prix par compte, quantité à choisir à la commande.',
  'features.title': 'Pourquoi nous choisir ?', 'features.sub': 'Une infrastructure pensée pour la performance et la fiabilité.',
  'steps.title': 'Comment ça marche', 'steps.sub': 'De l’inscription à la première requête en quelques minutes.',
  'faq.title': 'Questions fréquentes',
  'final.title': 'Prêt à commencer ?', 'final.sub': 'Créez votre compte et passez votre première commande en quelques minutes.',
  'contact.title': 'Une question ?', 'contact.sub': 'Notre équipe vous répond rapidement.',
  'footer.platform': 'Plateforme', 'footer.resources': 'Ressources', 'footer.contact': 'Contact', 'footer.rights': 'Tous droits réservés.',
  'ui.theme': 'Changer de thème', 'ui.lang': 'Changer de langue', 'ui.menu': 'Menu', 'ui.loading': 'Chargement…', 'ui.error': 'Impossible de charger la vitrine pour le moment.', 'ui.retry': 'Réessayer', 'ui.top': 'Haut de page',
};

const en: Dict = {
  'nav.pricing': 'Pricing', 'nav.coverage': 'Coverage', 'nav.calculator': 'Calculator', 'nav.features': 'Features', 'nav.faq': 'FAQ',
  'nav.login': 'Sign in', 'nav.register': 'Create account', 'nav.status': 'Service status',
  'hero.badge': 'Professional proxy platform', 'hero.title': 'Reliable proxies,', 'hero.highlight': 'ready in seconds',
  'hero.subtitle': 'Pick your category and volume, and get your access instantly. Selectable countries, transparent traffic, responsive support.',
  'cta.primary': 'Get started', 'cta.secondary': 'See pricing',
  'stats.categories': 'categories', 'stats.countries': 'countries available', 'stats.products': 'plans', 'stats.proxies': 'proxies online',
  'pricing.title': 'Pricing & plans', 'pricing.sub': 'Pick a category to discover its plans.',
  'pricing.none': 'No plan available right now.', 'pricing.noneSub': 'Check back soon or contact us.',
  'price.from': 'from', 'price.perGb': '/ GB', 'price.range': 'From {min} to {max} GB', 'price.rangeMin': 'From {min} GB', 'price.perUnit': 'per account',
  'spec.traffic': '{v} of traffic', 'spec.variable': 'Traffic of your choice', 'spec.unlimited': 'Unlimited traffic', 'spec.threads': '{n} simultaneous connections', 'spec.bandwidth': '{n} MB/s speed',
  'spec.validity': 'Valid {n} {u}', 'spec.forever': 'No expiry', 'spec.country': 'Country: {v}', 'spec.sticky': 'Sticky session {n} min', 'spec.renewal': 'Auto-renewal', 'spec.manual': 'Activated after review',
  'unit.day': 'day(s)', 'unit.month': 'month(s)', 'unit.year': 'year(s)',
  'stock.low': 'Only {n} left', 'stock.ok': 'In stock',
  'buy.login': 'Order now', 'buy.register': 'Create an account to order', 'buy.hint': 'Sign in to complete your order.',
  'coverage.title': 'Global coverage', 'coverage.sub': 'The countries actually available, updated live from our network.',
  'coverage.countries': '{n} countries', 'coverage.search': 'Search a country…', 'coverage.all': 'All', 'coverage.none': 'No country matches.', 'coverage.noGeo': 'Available countries will appear here.', 'coverage.proxies': '{n} proxies',
  'calc.title': 'Price calculator', 'calc.sub': 'Estimate your budget in seconds.',
  'calc.category': 'Category', 'calc.product': 'Plan', 'calc.volume': 'Volume', 'calc.qty': 'Quantity', 'calc.gb': 'GB', 'calc.total': 'Estimated total', 'calc.perGb': 'i.e. {v} per GB',
  'calc.estimate': 'Estimate my usage', 'calc.requests': 'Requests per day', 'calc.pageMb': 'Average size per request (MB)', 'calc.days': 'Duration (days)', 'calc.needs': 'Estimated need: {v} GB',
  'calc.apply': 'Use this volume', 'calc.clamped': 'Adjusted to the plan limits ({min}–{max} GB).', 'calc.pages': '≈ {n} web pages loaded', 'calc.none': 'The calculator will be available once a plan is published.',
  'calc.included': '{v} included', 'calc.cta': 'Order this volume', 'calc.fixedNote': 'Price per account, quantity chosen at checkout.',
  'features.title': 'Why choose us?', 'features.sub': 'An infrastructure built for performance and reliability.',
  'steps.title': 'How it works', 'steps.sub': 'From sign-up to your first request in minutes.',
  'faq.title': 'Frequently asked questions',
  'final.title': 'Ready to get started?', 'final.sub': 'Create your account and place your first order in minutes.',
  'contact.title': 'Any question?', 'contact.sub': 'Our team answers quickly.',
  'footer.platform': 'Platform', 'footer.resources': 'Resources', 'footer.contact': 'Contact', 'footer.rights': 'All rights reserved.',
  'ui.theme': 'Toggle theme', 'ui.lang': 'Change language', 'ui.menu': 'Menu', 'ui.loading': 'Loading…', 'ui.error': 'Unable to load the showcase right now.', 'ui.retry': 'Retry', 'ui.top': 'Back to top',
};

export const DICTS: Record<Lang, Dict> = { fr, en };

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = DICTS[lang][key] ?? DICTS.fr[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Contenu par défaut (listes) — utilisé quand l'admin n'a rien saisi. */
export const DEFAULT_FEATURES: Record<Lang, { icon: string; title: string; text: string }[]> = {
  fr: [
    { icon: '🛡️', title: 'Sécurité maximale', text: 'Accès protégés par identifiants, journal des connexions et limites de débit.' },
    { icon: '⚡', title: 'Ultra-rapide', text: 'Sélection automatique des meilleures sorties pour une latence minimale.' },
    { icon: '📈', title: 'Fiabilité', text: 'Contrôle permanent des proxies : seuls les plus performants sont servis.' },
    { icon: '🌍', title: 'Couverture mondiale', text: 'Des IP dans de nombreux pays, filtrables directement dans votre compte.' },
    { icon: '🚀', title: 'Livraison immédiate', text: 'Vos identifiants sont créés automatiquement dès la commande validée.' },
    { icon: '💬', title: 'Support réactif', text: 'Une équipe disponible pour vous accompagner à chaque étape.' },
  ],
  en: [
    { icon: '🛡️', title: 'Maximum security', text: 'Credential-protected access, connection logs and rate limits.' },
    { icon: '⚡', title: 'Ultra-fast', text: 'Best exits selected automatically for minimal latency.' },
    { icon: '📈', title: 'Reliability', text: 'Constant health checks: only the best-performing proxies are served.' },
    { icon: '🌍', title: 'Global coverage', text: 'IPs in many countries, filterable right from your account.' },
    { icon: '🚀', title: 'Instant delivery', text: 'Your credentials are created automatically once the order is confirmed.' },
    { icon: '💬', title: 'Responsive support', text: 'A team available to help you at every step.' },
  ],
};

export const DEFAULT_STEPS: Record<Lang, { title: string; text: string }[]> = {
  fr: [
    { title: 'Créez votre compte', text: 'Inscription gratuite en quelques secondes.' },
    { title: 'Choisissez une offre', text: 'Catégorie, volume et durée selon vos besoins.' },
    { title: 'Recevez vos accès', text: 'Identifiants et adresse du proxy livrés automatiquement.' },
    { title: 'Connectez-vous', text: 'Configurez votre outil avec host:port et vos identifiants.' },
  ],
  en: [
    { title: 'Create your account', text: 'Free sign-up in a few seconds.' },
    { title: 'Pick a plan', text: 'Category, volume and duration to fit your needs.' },
    { title: 'Get your access', text: 'Credentials and proxy address delivered automatically.' },
    { title: 'Connect', text: 'Set up your tool with host:port and your credentials.' },
  ],
};

export const DEFAULT_FAQ: Record<Lang, { q: string; a: string }[]> = {
  fr: [
    { q: 'Comment utiliser mes proxies ?', a: 'Après votre commande, vous recevez une adresse (hôte et port), un identifiant et un mot de passe. Renseignez-les dans votre navigateur, votre logiciel ou votre script en proxy HTTP.' },
    { q: 'Puis-je choisir le pays ?', a: 'Oui, selon l’offre : un filtre pays peut être appliqué à votre compte. Les pays disponibles pour chaque catégorie sont listés dans la section Couverture.' },
    { q: 'Comment est compté le trafic ?', a: 'Le trafic est décompté en Go sur votre compte et visible en direct depuis votre espace. Vous pouvez recharger ou renouveler à tout moment.' },
    { q: 'Que se passe-t-il quand mon trafic est épuisé ?', a: 'Les connexions sont suspendues jusqu’à la recharge ou la reconduction de votre offre : rien n’est facturé en plus.' },
    { q: 'Comment contacter le support ?', a: 'Utilisez les liens de contact en bas de page : nous répondons rapidement.' },
  ],
  en: [
    { q: 'How do I use my proxies?', a: 'After ordering, you receive an address (host and port), a username and a password. Enter them in your browser, software or script as an HTTP proxy.' },
    { q: 'Can I choose the country?', a: 'Yes, depending on the plan: a country filter can be applied to your account. Available countries per category are listed in the Coverage section.' },
    { q: 'How is traffic counted?', a: 'Traffic is deducted in GB from your account and visible live in your dashboard. You can top up or renew at any time.' },
    { q: 'What happens when my traffic runs out?', a: 'Connections are paused until you top up or renew your plan: nothing extra is billed.' },
    { q: 'How do I contact support?', a: 'Use the contact links at the bottom of the page: we answer quickly.' },
  ],
};

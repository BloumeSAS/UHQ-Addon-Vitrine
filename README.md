# UHQ Addon — Vitrine

Page d'accueil **publique** pour [UHQ Panel OS](https://github.com/BloumeSAS/UHQ-Panel-OS) : quand l'addon est actif, la page `/` du panel devient une vitrine pour les visiteurs **non connectés** (les utilisateurs connectés gardent leur tableau de bord).

- Logo et nom du site (Paramètres → Général), thème du panel, FR / EN.
- **Catalogue par catégorie** avec prix, caractéristiques et stock — si l'addon [Orders](https://github.com/BloumeSAS/UHQ-Addon-Orders) est actif.
- **Pays disponibles** et nombre de pays par catégorie (d'après le pool réel du panel).
- **Simulateur de prix** : produit, quantité de Go, estimation de consommation (requêtes / jour).
- Avantages, étapes, FAQ, contact : textes modifiables depuis le panel (page *Vitrine*, réservée aux admins).

Fonctionne embarqué dans le panel (Extensions → Activer) ou en déploiement séparé (`docker-compose.yml`).

## Variables d'environnement
| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3106` | Port d'écoute |
| `PANEL_URL` | `http://localhost:8000` | URL du panel |
| `PANEL_API_KEY` | — | Clé API **maître** du panel (catégories, pays, sauvegarde) |
| `ORDERS_URL` | — | URL de l'addon Orders (catalogue) |
| `DB_PATH` | `./vitrine-data.json` | Fichier de configuration |

Licence MIT — © Bloume SAS

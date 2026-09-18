# Veltrano

Boutique denim (baggy et coupe droite), **français + arabe** : 12 jeans homme, **250 MAD** l’unité, **400 MAD** le pack de 2.

- Livraison **gratuite au Maroc** (0 MAD)
- **Échange de taille gratuit** demandé sous 7 jours après réception
- Copy produit complète, guides des tailles par coupe, SEO + JSON-LD
- Hero vidéo desktop/mobile (assets owner Drive)

Sélecteur **FR | ع** à côté du panier. Veltrano, MAD/DH et noms de coloris catalogue inchangés.

## Lancer en local

```bash
npm install
npm run sync-images   # photos produit si besoin
npm run dev
```

Ouvre [http://localhost:43127](http://localhost:43127).

Build : `npm run build` puis `npm start` (port `PORT`, défaut 43127).

## Médias owner (configuration)

| Slot | Fichier local | Source Drive |
| --- | --- | --- |
| Hero desktop | `public/heroes/hero-laptop.mp4` (+ poster) | dossier « hero for laptop » |
| Hero mobile | `public/heroes/hero-phone.mp4` (+ poster) | dossier « hero for phone » |
| Guide baggy | `public/size-guides/baggy-size-guide.png` | dossier « baggy size guide » |
| Guide coupe droite | `public/size-guides/straight-fit-size-guide.png` | dossier « straight fit size guide » |

Mapping code : `src/data/media-assets.ts`. Remplacer un fichier local suffit pour mettre à jour le site.

## Contenu & règles métier

- Catalogue / copy : `src/data/catalog.ts`, `src/data/product-content.ts`
- Guides tailles (image + tableau) : `src/data/size-guides.ts`
- Livraison 0 MAD : `src/data/shipping.ts` (+ champ `shippingMad` commande)
- Avis : `src/data/reviews.ts` (fixtures démo `isDemo` exclues en production)
- Politique : `/aide/livraison-retours`

## EasyPanel / prod

Domaine cible **https://veltrano.ma**. Voir `docs/easypanel-deploy.md` et `.env.example`.

`NEXT_PUBLIC_SITE_URL=https://veltrano.ma` pour canonicals / sitemap. Hors domaine canonique, `robots.ts` refuse l’indexation (sauf `VELTRANO_ALLOW_INDEXING=1`).

Volume : `/app/data/store` uniquement. Photos produit JPEG dans l’image — ne pas monter un volume vide sur `/app/public/products`.

1. App EasyPanel depuis GitHub, builder **Dockerfile** à la racine.
2. Port conteneur **3000** (`PORT` / `HOST` EasyPanel → `HOSTNAME` dans l’entrypoint).
3. Volume persistant : `/app/data/store` avec `DATA_DIR=/app/data/store`.
4. **Ne monte pas de volume sur `/app/public/products`.** Les JPEG boutique sont dans l’image Docker.
5. Configurer depuis `.env.example` :
   - `NEXT_PUBLIC_SITE_URL=https://veltrano.ma`
   - `SITE_URL=https://veltrano.ma`
   - `CORS_ORIGINS=https://veltrano.ma,https://www.veltrano.ma`
   - `ADMIN_SECRET` obligatoire en production
   - `DATABASE_URL` : Postgres EasyPanel `veltrano-db`. Le démarrage applique les migrations et importe les anciens JSON sans écraser les données déjà migrées.
6. Démarrage standalone : `node server.js`.

## Parcours

Accueil → Boutique / Homme / Femme (bientôt) → fiche produit (pack 1 ou 2, guide tailles) → panier → commande serveur → merci + coupon 50 DH → `/admin`.

WhatsApp boutique : +212 777-236482.

Identifiants optionnels : `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, ou Twilio `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM`. Sans eux, le récapitulatif est mis en file (`data/store/whatsapp-queue.json`) et la page merci ne prétend pas qu’il a été envoyé.

Catalogue source : `src/data/product-catalog.csv` (export de la Google Sheet).

## Dashboard admin

Ouvre `/admin`. La première version opérationnelle utilise uniquement les données réellement
enregistrées : vue d’ensemble, file de confirmation, statuts séparés de commande/livraison/
paiement, notes internes, CRM dérivé des commandes, catalogue/stock visible, création de coupons
et état des intégrations. Les visiteurs et ventes livrées ne sont jamais inventés lorsqu’aucune
source ou aucun statut réel n’existe.

Le CRM étendu ajoute les profils clients/leads, détection de doublons téléphone/e-mail, file de
suivi, historique client, listes calculées/épinglées et inscriptions popup avec coupons 10 %.
Les migrations sont dans `migrations/`; commandes utiles :

```bash
npm run db:migrate
npm run db:backfill
npm run db:seed # données de démonstration facultatives, idempotentes
npm test
```

Sans `DATABASE_URL`, le développement local conserve un fallback JSON dans `data/store`.

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

## Parcours

Accueil → Boutique / Homme / Femme (bientôt) → fiche produit (pack 1 ou 2, guide tailles) → panier → commande serveur → merci + coupon 50 DH → `/admin`.

WhatsApp boutique : +212 777-236482.

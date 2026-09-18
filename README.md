# Veltrano

Boutique jeans (baggy et straight fit), **français + arabe** : 12 modèles, **250 MAD** l’unité, **400 MAD** le pack de 2.

Sélecteur **FR | ع** à côté du panier. Langue auto (`ar*` → arabe, sinon français). L’arabe est RTL. Veltrano, MAD/DH et noms catalogue inchangés.

Les descriptions du catalogue sont vides — l’app n’invente pas de copy produit au-delà des champs fournis (nom, prix, pack, couleur, tailles, stock, dossier Drive).

## Lancer en local

```bash
npm install
npm run sync-images   # copie les photos Drive si le worker d’ingest les a déjà déposées
npm run dev
```

Ouvre [http://localhost:43127](http://localhost:43127).

Build de prod : `npm run build` puis `npm start` (écoute `PORT`, défaut 43127).

## EasyPanel (VPS)

Cibles : domaine **https://veltrano.ma** (et www), repo **https://github.com/veltrano/veltrano.maroc.git**, panel **http://187.6.164.52:3000/** projet **veltrano**.

1. App EasyPanel from GitHub, builder **Dockerfile** (racine).
2. Port conteneur **3000** (`PORT` / `HOST` EasyPanel → `HOSTNAME` dans l’entrypoint).
3. Volume persistant : `/app/data/store` + env `DATA_DIR=/app/data/store` (JSON commandes / coupons / file WhatsApp).
4. **Ne monte pas de volume sur `/app/public/products`.** Les JPEG boutique (~33MB, `01.jpg` = plat face avant) sont dans l’image Docker. Un volume vide masquerait toutes les photos. Volume persistant uniquement pour `/app/data/store`.
5. Env à coller depuis `.env.example` :
   - `NEXT_PUBLIC_SITE_URL=https://veltrano.ma`
   - `SITE_URL=https://veltrano.ma`
   - `CORS_ORIGINS=https://veltrano.ma,https://www.veltrano.ma`
   - `ADMIN_SECRET` (**requis en production**), WhatsApp Meta ou Twilio
   - `DATABASE_URL` : **optionnel**. Le service Postgres `veltrano-db` existe ; l’app n’y écrit pas tant qu’il n’y a pas de migration. Les commandes restent dans le volume JSON.
6. Start : `node server.js` (standalone). Pas de start npm si le builder est Docker.

Le CORS des routes `/api` n’accepte que veltrano.ma, www, et le preview local.

`docker compose up --build` en local utilise le volume `veltrano-orders`.

Lifestyle + films clients sont dans git (`public/lifestyle`, `public/videos`). Photos produit : JPEG compressés (`01.jpg` = plat **face avant**), les PNG Drive restent hors git.

## Photos produit

Les photos Drive (116 fichiers, 12 modèles) se copient ainsi :

```bash
npm run sync-images
```

Sans photos, chaque fiche affiche un placeholder teinté.

## Parcours

- Accueil (lifestyle, 4 pièces, films clients), Boutique, Homme, Femme (bientôt)
- Grille boutique, filtres coupe / couleur
- Fiche produit : galerie, pack 1 ou 2 (tailles distinctes sur le duo), stock
- Panier et commande enregistrée côté serveur (pas de paiement en ligne)
- Page merci, coupon 50 DH, tableau d’équipe `/admin`
- Popup email −10%, 5 secondes après l’arrivée
- WhatsApp boutique : +212 777-236482. Envoi auto au client si identifiants API (voir `.env.example`)

Identifiants optionnels : `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, ou Twilio `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM`. Sans eux, le récapitulatif est mis en file (`data/store/whatsapp-queue.json`) et la page merci ne prétend pas qu’il a été envoyé.

Catalogue source : `src/data/product-catalog.csv` (export de la Google Sheet).

## Dashboard admin

Ouvre `/admin`. La première version opérationnelle utilise uniquement les données réellement
enregistrées : vue d’ensemble, file de confirmation, statuts séparés de commande/livraison/
paiement, notes internes, CRM dérivé des commandes, catalogue/stock visible, création de coupons
et état des intégrations. Les visiteurs et ventes livrées ne sont jamais inventés lorsqu’aucune
source ou aucun statut réel n’existe.

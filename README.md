# Veltrano

Boutique jeans (baggy et straight fit) calée sur le catalogue officiel : 12 modèles, **250 MAD** l’unité, **400 MAD** le pack de 2.

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

1. Repo GitHub `veltrano` (les photos catalogue ~720 MB ne sont **pas** dans git).
2. App EasyPanel **from GitHub**, builder **Dockerfile** (fichier `Dockerfile` à la racine).
3. Port du conteneur : **3000** (ou la variable `PORT` injectée par EasyPanel — l’entrypoint la respecte, ainsi que `HOST` → `HOSTNAME`).
4. Volume persistant : hôte → `/app/data/store` (commandes, coupons, file WhatsApp). Définir `DATA_DIR=/app/data/store`.
5. Volume optionnel photos : hôte → `/app/public/products` (copier le dossier Drive / `npm run sync-images` sur le VPS). Sans ça, placeholders seulement.
6. Variables : copier `.env.example` (`ADMIN_SECRET`, WhatsApp Meta ou Twilio). Ne pas committer les secrets.
7. Start : l’image lance `node server.js` (standalone). Pas besoin d’une start command npm si le builder est Docker.

`docker compose up --build` en local utilise le volume `veltrano-orders`.

Lifestyle + films clients sont dans git (`public/lifestyle`, `public/videos`).

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

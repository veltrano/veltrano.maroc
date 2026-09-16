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

Build de prod : `npm run build` puis `npm start`.

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

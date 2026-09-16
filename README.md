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

- Grille boutique, filtres coupe / couleur
- Fiche produit : galerie, pack 1 ou 2 (tailles distinctes sur le duo), stock
- Panier et commande locale (pas de paiement en ligne)

Catalogue source : `src/data/product-catalog.csv` (export de la Google Sheet).

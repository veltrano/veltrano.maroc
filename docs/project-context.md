# Veltrano — project context

## Goal

A Veltrano shop that **markets like ALB London** (Home / Boutique / Category) rather than dumping the full catalogue on the first screen.

## Constraints

- Nav: Accueil, Boutique, Catégorie → Homme, Femme.
- Homme = current men’s jeans. Femme = bientôt + email for −10% on first purchase.
- Popup: everyone, 5 seconds after entering the site (not on `/admin`).
- Home: no fixed product count (“douze jeans”); only 4 products + Boutique CTA; lifestyle refs + client videos.
- Keep white background, 250/400 MAD, Drive product photos, cart/checkout.
- Do not write into `media/products/`. Client videos live in `media/client-videos/` and `public/videos/`.
- WhatsApp float on shopper pages: +212 777-236482 → `wa.me/212777236482`.
- Listings: **flat white product shot first**; lifestyle/model shots after.
- After checkout: thank-you page (not a dead end), 50 DH unique coupon, catalogue + add to cart.
- Confirming checkout **saves the order immediately** server-side. The customer must not open WhatsApp to complete the order.
- Staff dashboard: `/admin` lists all orders (name, phone, address, products, quantities, total).
- Outbound WhatsApp to the customer after order: send via API when credentials exist. Never open `wa.me` and ask the customer to tap send. Never claim a send that did not happen.

## WhatsApp / admin env vars

Copy `.env.example`. None are required for checkout to succeed.

- `ADMIN_SECRET` — optional. If set, `/admin` and `GET /api/admin/orders` need header `x-admin-secret` (or `?key=`).
- Meta Cloud API (preferred when present): `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, optional `WHATSAPP_GRAPH_VERSION` (default `v22.0`).
- Twilio fallback: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (e.g. `whatsapp:+14155238886`).

Without Meta or Twilio credentials, the French recap (`Hello M. {name}` + order + 48h) is written to `data/store/whatsapp-queue.json`. Thank-you does **not** say WhatsApp was sent.

## Decisions

- Next.js 15, French UI, localStorage cart/coupons; **orders persist in `data/store/orders.json`**.
- Featured Home SKUs: baggy noir, bleu blith, straight stone, baggy dorty.
- Image order: scored by white-background / flat-lay vs model shots (`src/data/image-map.json`).
- Coupons: `VT50-XXXXXX`, 50 DH, one-time, apply in cart/checkout. Issued on each order for the *next* purchase (server + local cache).
- Thank-you route: `/thank-you/[id]` loads the order from `GET /api/orders/[id]`.
- Popup 5s after visit start. Dev server port **43127**.
- Production: Docker standalone, EasyPanel project `veltrano` at `http://187.6.164.52:3000/`, domain `https://veltrano.ma` (+ www). GitHub `https://github.com/veltrano/veltrano.maroc.git`. Persist volume `/app/data/store` (`DATA_DIR`). `NEXT_PUBLIC_SITE_URL` / `SITE_URL` / `CORS_ORIGINS` allow apex + www. Postgres `veltrano-db` / `DATABASE_URL` is optional and unused — orders stay JSON until a migration exists. Front-flat JPEGs (`01.jpg` = face avant) are in git (~33MB). Do not mount an empty volume over `/app/public/products` (that hides the catalogue). PNG Drive originals stay gitignored.
- Do not claim https://veltrano.ma is live until the public URL responds. Push to GitHub requires `gh auth login` on this machine.

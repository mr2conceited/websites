# SoleStreet — Sneakers, Hoodies & Apparel E-Commerce Store

A full-stack e-commerce site for sneakers, hoodies, and apparel.

> **Note on naming:** This project is scaffolded as "SoleStreet" rather than
> "Foot Locker" because Foot Locker is a registered trademark. The codebase,
> layout, and feature set are exactly what you asked for — feel free to
> rename it back (search/replace "SoleStreet" and "solestreet" across the
> project) as your own personal project; just be aware that publicly
> launching a site using the real "Foot Locker" name/logo would be a
> trademark issue.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
- **Database:** MongoDB 7 (run locally, via Docker, or MongoDB Atlas)

## Project Structure

```
solestreet/
├── server/              # Express + MongoDB backend (REST API)
│   ├── src/
│   │   ├── config/      # DB connection
│   │   ├── controllers/ # Route logic
│   │   ├── middleware/  # Auth, error handling
│   │   ├── models/      # Mongoose schemas (User, Product, Cart, Order)
│   │   ├── routes/      # Express routers
│   │   ├── utils/       # JWT helper, DB seed script
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── components/   # Navbar, Footer, ProductCard, route guards
│   │   ├── context/      # Auth + Cart context providers
│   │   ├── layouts/      # MainLayout
│   │   ├── pages/        # Home, Shop, ProductDetail, Cart, Checkout,
│   │   │                 # Login, Register, Account, OrderDetail, Admin*
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── docker-compose.yml     # Optional local MongoDB container
```

## Getting Started

### 1. Database (MongoDB)

Pick one:

**Option A — Docker (easiest):**
```bash
docker compose up -d
```
This starts MongoDB on `mongodb://127.0.0.1:27017`.

**Option B — MongoDB Atlas (free cloud tier):**
Create a free cluster at https://www.mongodb.com/atlas and copy the
connection string into `server/.env` as `MONGO_URI`.

**Option C — Local MongoDB install:**
Install MongoDB Community Edition and run `mongod` locally.

### 2. Backend setup

```bash
cd server
cp .env.example .env      # edit values as needed (especially JWT_SECRET)
npm install
npm run seed               # populates sample products + an admin user
npm run dev                 # starts API on http://localhost:5000
```

Default seeded admin login:
- Email: `admin@solestreet.com`
- Password: `Admin123!`

### 3. Frontend setup

In a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev                 # starts the site on http://localhost:5173
```

Open http://localhost:5173 in your browser. The Vite dev server proxies
`/api` requests to the backend automatically.

## Features

- Product catalog with categories (sneakers, hoodies, apparel), filtering by
  brand/gender/price, sorting, search, and pagination
- Product detail pages with size/color variants, stock tracking, and reviews
- User authentication (JWT, httpOnly cookie + bearer token support)
- Shopping cart (persisted per-user in MongoDB)
- Checkout flow that creates an order, decrements stock, and calculates
  shipping/tax/total
- Order history and order detail pages
- Admin dashboard: manage products (create/edit/delete, variants, images),
  view & update order statuses, basic store stats
- Responsive Tailwind UI

## Going to Production

- Swap the simulated checkout for real payments using Stripe — a
  `stripe` dependency is already included in `server/package.json` and
  placeholders for `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` are in
  `.env.example`.
- Replace product image URLs (currently using Unsplash placeholders) with
  your own hosted images, or wire up an upload flow using the included
  `multer` dependency + a storage provider (S3, Cloudinary, etc.).
- Set strong, unique values for `JWT_SECRET` and switch `NODE_ENV=production`.
- Deploy the backend (Render, Railway, Fly.io, AWS, etc.) and the frontend
  (Vercel, Netlify, Cloudflare Pages) and update `CLIENT_URL` / `VITE_API_URL`
  accordingly.

## Opening in VS Code

Unzip the project, then:
```bash
code solestreet
```
You'll have two independent npm projects (`server/` and `client/`) — run
each with its own terminal as described above.

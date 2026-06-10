# Toko Rizki — Sales & Inventory Management

A full-stack sales and inventory management system built for small businesses. Manage products, stock, invoices, payments, and sales teams from a single dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square)

---

## Features

- **Dashboard** — sales overview, recent orders, payments, and stock activity
- **Products (Produk)** — manage products with multiple variants per sales rep
- **Stock (Stok)** — track stock per variant, record sales, view history
- **Invoices (Tagihan)** — create invoices, track partial payments, mark as paid
- **Sales** — manage sales reps and their product assignments
- **Categories (Kategori)** — organize stock by category
- **Users & Roles** — role-based access control with granular permissions
- **Tasks** — simple task tracking
- **PWA** — installable on mobile, works offline
- **Image uploads** — Cloudinary with client-side compression

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (JWT) |
| Styling | Tailwind CSS v4 |
| Images | Cloudinary |
| Toasts | Sonner |
| Deploy | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech) free tier)
- [Cloudinary](https://cloudinary.com) account (free tier)

### 1. Clone & install

```bash
git clone https://github.com/Bagusbachtiar/managementapp.git
cd managementapp
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. Database setup

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login with the seeded admin account (see `prisma/seed.ts`).

---

## Deploy to Vercel

### 1. Create database

Create a free PostgreSQL database on [neon.tech](https://neon.tech). Copy the connection string.

### 2. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Import this repo on Vercel. Set the following environment variables in **Project → Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string, min 32 characters |
| `NEXTAUTH_URL` | Your Vercel app URL (e.g. `https://your-app.vercel.app`) |
| `CLOUDINARY_URL` | From Cloudinary dashboard |

Vercel auto-runs `prisma generate && prisma migrate deploy && next build` on every deploy.

### 3. Seed production database

After first deploy, run once from local:

```bash
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login page
│   ├── (dashboard)/     # All protected pages
│   └── api/             # Auth + upload endpoints
├── actions/             # Server actions (mutations)
├── components/          # UI components + layout
├── lib/                 # Prisma, auth, cloudinary, utils
└── proxy.ts             # Auth middleware (Next.js 16)
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (32+ chars) |
| `NEXTAUTH_URL` | Yes | App base URL |
| `CLOUDINARY_URL` | Yes | Cloudinary credentials URL |

---

## License

MIT

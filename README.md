# Bookery — Book eCommerce Platform

Production-grade book eCommerce platform.

**Status:** Sprint 13 complete (Day 1–4 + Sprints 05–13). Feature-based
architecture, Supabase schema (categories/subcategories/authors/publishers/
books), auth foundation, admin shell, and UI/backend for Dashboard,
Categories, Subcategories, Books (backend only), Authors, Publishers,
Customers, and Orders are all built. See `docs/` for the full per-sprint
breakdown — each milestone has its own `*.md` file documenting exactly what
was added and what was deliberately left out.

**Not yet done:** admin routes were not mounted until Sprint 14 (see
`docs/ADMIN_LAYOUT.md`, `docs/DASHBOARD_FRAMEWORK.md`, and the Sprint 14
activation work); Category/Subcategory/Customer/Orders still need real
Supabase backends; no storefront, cart, checkout, or payments yet.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) (PostgreSQL + client libraries)
- [Vercel](https://vercel.com/) (deployment target)

## Folder Structure

The tree below reflects the **Day 1** starting point only. The project has
since grown substantially (feature-based folders under `src/features/`,
`src/config/`, `src/constants/`, `src/services/`, three SQL migrations
under `supabase/migrations/`, and more) — rather than guess at an exact
up-to-date tree here, refer to each file under `docs/` (`ARCHITECTURE.md`
for the Day 3 feature-based layout, and each sprint doc's own "Files added
this sprint" section) for the verified, exact structure as of that
milestone.

```
book-ecommerce/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout, global metadata
│   │   ├── page.tsx          # Home page (placeholder)
│   │   └── globals.css       # Tailwind + shadcn theme tokens
│   ├── components/
│   │   ├── layout/           # Header, Footer, MainLayout wrapper
│   │   └── ui/                # shadcn/ui components (Button, etc.)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts     # Supabase client for Client Components
│   │   │   └── server.ts     # Supabase client for Server Components
│   │   └── utils.ts          # cn() helper (clsx + tailwind-merge)
│   └── types/
│       └── index.ts          # Shared domain types (empty for now)
├── public/                    # Static assets
├── components.json            # shadcn/ui configuration
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── .env.local.example
└── README.md
```

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+ (or pnpm/yarn if you prefer — adjust commands accordingly)
- A free [Supabase](https://supabase.com/) account and project

## Getting Started

1. **Install dependencies**

```
npm install
```

2. **Configure environment variables**

   Copy the example env file and fill in your Supabase project credentials
(found in Supabase dashboard → Project Settings → API):

```
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

3. **Run the dev server**

```
npm run dev
```

   Open <http://localhost:3000> to see the placeholder home page. The admin
   system now lives at `/admin` (see `docs/ADMIN_LAYOUT.md` and the Sprint 14
   activation notes for what's required to sign in and view it).

## shadcn/ui

The project is pre-configured for shadcn/ui (`components.json`, theme tokens
in `globals.css`, `cn()` helper). To add more components once dependencies
are installed:

```
npx shadcn@latest add card input dialog
```

## Supabase Client Usage

Three ready-to-use client factories are provided:

- `@/lib/supabase/client` — for use inside Client Components (`"use client"`)
- `@/lib/supabase/server` — for use inside Server Components, Server
Actions, and Route Handlers
- `@/lib/supabase/middleware` — for use inside `middleware.ts` (Sprint 05)

## Deployment

This project is designed to deploy on [Vercel](https://vercel.com/):

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Add the same environment variables from `.env.local` in the Vercel
project settings.
4. Deploy.

## Roadmap

- [x] Feature-based architecture (Day 3)
- [x] Database schema — categories, subcategories, authors, publishers, books (Day 2, Sprint 10)
- [x] Authentication foundation (Sprint 05)
- [x] Admin shell & dashboard UI (Sprint 06–07)
- [x] Category / Subcategory management UI (Sprint 08–09)
- [x] Book CRUD backend (Sprint 10)
- [x] Author & Publisher management — backend + UI (Sprint 11)
- [x] Customer management UI (Sprint 12)
- [x] Orders management UI (Sprint 13)
- [x] Admin routes mounted, AuthProvider connected (Sprint 14)
- [ ] Book admin UI (table/form) against the existing Sprint 10 backend
- [ ] Category / Subcategory / Customer / Orders real backends
- [ ] Product catalog & search (storefront)
- [ ] Cart & checkout
- [ ] Payments
- [ ] Coupons, shipping, reports

## License

Private/Proprietary — internal project.

# Bookery — Book eCommerce Platform

Production-grade book eCommerce platform.

**Status:** Day 1 — Project initialization only. No auth, database tables,
products, cart, or payments yet. Those arrive in later milestones.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) (PostgreSQL + client libraries)
- [Vercel](https://vercel.com/) (deployment target)

## Folder Structure

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

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example env file and fill in your Supabase project credentials
   (found in Supabase dashboard → Project Settings → API):

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the placeholder
   home page.

## shadcn/ui

The project is pre-configured for shadcn/ui (`components.json`, theme tokens
in `globals.css`, `cn()` helper). A `Button` component is included as an
example. To add more components once dependencies are installed:

```bash
npx shadcn@latest add card input dialog
```

## Supabase Client Usage

Two ready-to-use client factories are provided:

- `@/lib/supabase/client` — for use inside Client Components (`"use client"`)
- `@/lib/supabase/server` — for use inside Server Components, Route Handlers,
  and Server Actions

No tables, auth flows, or RLS policies have been created yet — this is
intentionally scoped for a later milestone.

## Deployment

This project is designed to deploy on [Vercel](https://vercel.com/):

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Add the same environment variables from `.env.local` in the Vercel
   project settings.
4. Deploy.

## Roadmap (Not Part of Day 1)

- [ ] Authentication (Supabase Auth)
- [ ] Database schema (books, categories, orders, etc.)
- [ ] Product catalog & search
- [ ] Cart & checkout
- [ ] Payments
- [ ] Order management
- [ ] Admin dashboard

## License

Private/Proprietary — internal project.

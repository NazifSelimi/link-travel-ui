# link-travel-ui

Customer-facing site and admin panel for **Link Travel**, a Macedonian travel agency.
React 19 SPA backed by a Laravel 12 API ([link-travel-api](../link-travel-api)).

## Stack

- React 19 + TypeScript
- Vite (dev + build)
- Redux Toolkit + RTK Query
- React Router 7
- Ant Design 6 (admin) + Tailwind CSS 4 (public)
- React Hook Form + Zod (forms — to be adopted; see `STAGE C`)
- Vitest + Testing Library

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to the Laravel backend
npm run dev            # http://localhost:3000
```

The dev server proxies `/api/v1` to the Laravel backend defined in `.env`.

## Scripts

| Command            | What it does                            |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Vite dev server on `:3000`              |
| `npm run build`    | Typecheck + production build to `dist/` |
| `npm run preview`  | Serve the built bundle                  |
| `npm run lint`     | ESLint on the whole project             |
| `npm run typecheck`| `tsc --noEmit`                          |
| `npm test`         | Vitest                                  |

## Project layout

```
src/
├─ api/          Axios client (admin) + base URL helpers
├─ components/   Shared and feature-scoped components
│  ├─ admin/     Admin form fields (location picker, gallery, …)
│  ├─ home/      Landing-page sections
│  ├─ layout/    Header / Footer / MainLayout
│  └─ destinations|hotels/   Feature cards & filters
├─ hooks/        Shared React hooks
├─ lib/          Pure helpers (money, media URLs, country lists, …)
├─ pages/        Top-level routes (public + admin/)
├─ store/        Redux store, slices, and RTK Query (linktravelApi)
└─ types/        Shared TypeScript types
```

## Refactor in progress

The codebase is being migrated to a single API layer (RTK Query) and a full
i18n stack (`mk` / `shq` / `en`). See the per-stage commit messages
(`Stage A …`, `Stage B …`) for what has shipped.

# Digiline Tech

Digiline Tech (Marketing • Web • IT Solutions) portfolio website with an admin dashboard for managing content.

| Part      | Stack                                                              |
| --------- | ------------------------------------------------------------------ |
| Frontend  | Next.js 16 (App Router), TypeScript, Tailwind CSS v4               |
| Animation | Motion (Framer Motion), GSAP + ScrollTrigger                       |
| Backend   | Express 5, TypeScript, Prisma 7, PostgreSQL                        |
| Auth      | JWT in an httpOnly cookie, single admin                            |

## Structure

```
frontend/   Next.js app — public site in app/(site), dashboard in app/admin
backend/    Express REST API — routes under /api, Prisma schema in prisma/
```

The frontend rewrites `/api/*` to the backend, so the browser talks to one origin and the auth cookie just works.

## Getting started

1. Install dependencies

   ```bash
   npm run setup
   ```

2. Start PostgreSQL (needs Docker Desktop running), or point `DATABASE_URL` in `backend/.env` at your own database

   ```bash
   npm run db:up
   ```

3. Create tables and the first admin (credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`)

   ```bash
   npm run db:migrate -- --name init
   npm run db:seed
   ```

4. Run both apps

   ```bash
   npm run dev
   ```

   - Site: http://localhost:3000
   - Dashboard: http://localhost:3000/admin
   - API: http://localhost:5000/api/health

## Environment

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local`.

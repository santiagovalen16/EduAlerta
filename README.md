# EduAlerta

EduAlerta es una plataforma SaaS educativa para detectar tempranamente riesgo de desercion y repitencia escolar en municipios de Sabana Centro, Colombia.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, React Hook Form, Zod, TanStack Table, Recharts, Leaflet.
- Backend: NestJS, Prisma, PostgreSQL, JWT, RBAC, bcrypt, Swagger.
- Infraestructura: Docker Compose, Nginx, TLS-ready reverse proxy.

## Estructura

```txt
apps/web      Next.js application
apps/api      NestJS API
packages      Shared schemas, types and config
infra         Nginx and deployment assets
docs          Architecture and delivery documentation
```

## Primer arranque

1. Copia `.env.example` a `.env`.
2. Instala dependencias con `pnpm install`.
3. Levanta PostgreSQL con `docker compose up -d postgres`.
4. Ejecuta migraciones con `pnpm db:migrate`.
5. Inicia desarrollo con `pnpm dev`.

> En este entorno se dejo el scaffold listo. Si `pnpm` no esta disponible en la terminal, instala pnpm o habilita Corepack antes de instalar dependencias.

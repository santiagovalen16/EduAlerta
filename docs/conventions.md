# Convenciones

## Codigo

- TypeScript strict.
- Componentes React en PascalCase.
- Carpetas en kebab-case.
- DTOs de Nest con `class-validator`.
- Formularios del frontend con React Hook Form + Zod.

## Frontend

- `components/ui`: primitivas estilo shadcn/ui.
- `components/layout`: estructura de aplicacion.
- `components/data-display`: tarjetas, tablas y estados.
- `features/*`: casos de uso por dominio.

## Backend

- `modules/*`: modulos de dominio.
- `common/guards`: autorizacion y autenticacion.
- `database`: Prisma.
- La logica transaccional vive en services, no en controllers.

## Git

- Conventional Commits.
- Ramas con prefijo `codex/` para trabajo asistido.

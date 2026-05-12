# Arquitectura EduAlerta

## Principios

- Separacion clara entre interfaz, API, dominio y persistencia.
- Seguridad desde el primer incremento: JWT, RBAC, auditoria y validacion estricta.
- UX institucional moderna, accesible y optimizada para baja conectividad.
- Modulos de dominio pequenos, testeables y evolutivos.

## Vista Logica

```txt
Next.js Web App
  -> NestJS REST API
  -> Prisma ORM
  -> PostgreSQL
```

## Modulos MVP

- Auth: login, refresh tokens y perfil actual.
- Users/RBAC: roles, permisos y usuarios institucionales.
- Institutions/Territories: municipios, instituciones y cobertura.
- Students: datos academicos relevantes.
- Alerts: registro docente y ciclo de vida de alertas.
- Risk Scoring: clasificacion inicial explicable.
- Notifications: bandeja de acudientes.
- Reports: exportacion CSV auditada.
- Audit Logs: trazabilidad de acciones sensibles.

## Criterios de escalabilidad

- Contratos DTO validados.
- Permisos granulares sobre roles.
- Prisma migrations versionadas.
- Servicios de dominio sin dependencias de transporte HTTP.
- Componentes frontend reutilizables por feature.

# Seguridad

## Autenticacion

- Access token JWT de vida corta.
- Refresh token rotativo en fase siguiente.
- Password hashing con bcrypt y costo 12.
- Login rate limiting pendiente de activar cuando se agregue `@nestjs/throttler`.

## Autorizacion

- RBAC basado en roles y permisos.
- Los endpoints deben validar permisos concretos, no solo nombres de rol.
- Los permisos iniciales viven en el seed de Prisma.

## Auditoria

Acciones sensibles deben crear `AuditLog`:

- Login.
- Creacion y actualizacion de alertas.
- Exportacion de reportes.
- Cambios de rol.

## Datos sensibles

- No exponer hashes, tokens ni metadatos internos en respuestas.
- Usar HTTPS en despliegue.
- Restringir CORS por ambiente.
- Mantener `.env` fuera de Git.

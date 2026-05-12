# Contratos API MVP

Base path: `/api`

## Auth

```txt
POST /auth/login
GET  /auth/me
```

## Students

```txt
GET /students/risk
```

## Alerts

```txt
POST /alerts
```

El cliente envia `clientGeneratedId` para soportar sincronizacion offline idempotente.

## Dashboard

```txt
GET /dashboard/institution
```

## Swagger

```txt
GET /api/docs
```

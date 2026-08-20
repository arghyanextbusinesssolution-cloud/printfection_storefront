# Architecture

## Overview

Printfection UK is a monorepo containing three applications and three shared packages, communicating via a REST API.

## Applications

| App | Port | Purpose |
|-----|------|---------|
| `apps/api` | 5000 | Express.js REST API, business logic, MongoDB |
| `apps/storefront` | 5173 | Customer product catalogue & bulk ordering |
| `apps/admin` | 5174 | Admin dashboard for product/order management |

## Shared Packages

| Package | Purpose |
|---------|---------|
| `@printfection/types` | Shared TypeScript interfaces |
| `@printfection/config` | Brand constants, business defaults |
| `@printfection/shared` | Utility functions (slugify, currency, pagination) |

## Layer Architecture (API)

```
Request → Route → Middleware → Controller → Service → Model → MongoDB
```

- **Controllers**: Thin HTTP handlers, no business logic
- **Services**: All business logic, pricing, validation
- **Models**: Mongoose schemas with indexes and validation
- **Integrations**: Adapter pattern for product sources and design providers

## Adapter Patterns

### Product Source Adapter
Abstracts CSV and external API product imports behind a common interface:
- `CsvProductSource` — fully implemented
- `ApiProductSource` — architecture ready, awaiting provider docs

### Design Provider Adapter
Abstracts Fancy Product Designer and Lumise behind a common interface (Phase 2).

## Security

- Helmet, CORS (restricted origins), rate limiting
- JWT authentication with HTTP-only cookies for admin
- Zod validation on all inputs
- No secrets in frontend bundles
- Centralized error handling (no stack traces in production)

## Data Flow: Bulk Order

1. Customer selects product (storefront → `GET /api/products`)
2. Selects colour (storefront → `GET /api/bulk-order/config/:productId`)
3. Enters sizes/quantities (storefront → `GET /api/bulk-order/sizes/:productId/:colour`)
4. Validates minimum quantity (storefront → `POST /api/bulk-order/validate`)
5. Reviews summary (Phase 2+: pricing calculation via `POST /api/pricing/calculate`)

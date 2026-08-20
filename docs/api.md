# API Reference

Base URL: `http://localhost:5000/api`

All responses follow:
```json
{ "success": true, "data": {}, "message": "" }
{ "success": false, "message": "Error", "code": "ERROR_CODE" }
```

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Admin login |
| POST | `/auth/refresh` | Cookie | Refresh access token |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Current admin profile |

## Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List categories |
| GET | `/categories/:id` | No | Get category |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Deactivate category |

## Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List products (paginated, filterable) |
| GET | `/products/filters` | No | Available filter options |
| GET | `/products/slug/:slug` | No | Get product by slug |
| GET | `/products/:id` | No | Get product by ID |
| GET | `/products/:productId/colours` | No | Product colour options |
| GET | `/products/:productId/variants` | No | Product variants |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Deactivate product |
| POST | `/products/:productId/variants` | Admin | Create variant |

Query params for `GET /products`: `page`, `limit`, `category`, `brand`, `gender`, `organic`, `fabric`, `search`, `sort`

## Bulk Order

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bulk-order/config/:productId` | No | Bulk order configuration |
| GET | `/bulk-order/sizes/:productId/:colourName` | No | Sizes for colour |
| POST | `/bulk-order/validate` | No | Validate bulk order |

## Pricing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/pricing/calculate` | No | Calculate order pricing |
| GET | `/pricing/tiers` | No | List pricing tiers |
| POST | `/pricing/tiers` | Admin | Create pricing tier |
| GET | `/pricing/print-locations` | No | List print locations |
| POST | `/pricing/print-locations` | Admin | Create print location |

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard statistics |

## Imports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/imports/jobs` | Admin | Import history |
| POST | `/imports/preview` | Admin | Preview CSV import |
| POST | `/imports/csv` | Admin | Import CSV file |
| POST | `/imports/sync` | Admin | Sync from external API |

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

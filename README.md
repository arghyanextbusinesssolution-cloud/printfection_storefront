# Printfection UK

Production-oriented monorepo for the Printfection UK bulk garment printing eCommerce platform.

## Architecture

```text
printfection-uk/
├── apps/
│   ├── storefront/   # Customer-facing catalogue & bulk ordering (port 5173)
│   ├── admin/        # Admin dashboard (port 5174)
│   └── api/          # Express + MongoDB API (port 5000)
├── packages/
│   ├── shared/       # Shared utilities
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configuration constants
└── docs/             # Architecture & API documentation
```

## Prerequisites

- Node.js 20+
- MongoDB 6+ (local or Atlas)
- npm 10+

## Installation

```bash
# Clone and install
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secrets
```

## Environment Setup

See `.env.example` for all required variables. Minimum for local development:

```env
MONGODB_URI=mongodb://localhost:27017/printfection-uk
JWT_SECRET=your-long-random-secret-here
JWT_REFRESH_SECRET=your-other-long-random-secret
```

Frontend apps use `.env.example` in their respective directories (public config only).

## Development

```bash
# Start all three apps concurrently
npm run dev

# Or individually:
npm run dev:api          # http://localhost:5000
npm run dev:storefront   # http://localhost:5173
npm run dev:admin        # http://localhost:5174
```

## Seed Database

```bash
npm run seed
```

Creates admin user, categories, sample products with variants, print locations, and pricing tiers.

Default admin credentials (development only):
- Email: `admin@printfection.co.uk`
- Password: `Admin123!`

## Build

```bash
npm run build
```

## Testing

```bash
npm run test
```

## Type Checking

```bash
npm run typecheck
```

## API Health Check

```bash
curl http://localhost:5000/api/health
```

## Phase Status

### Phase 1 (Complete)
- Monorepo architecture
- MongoDB models & seed data
- Admin authentication (JWT + HTTP-only cookies)
- Product catalogue with filters, search, pagination
- Bulk order wizard (product → colour → sizes → summary)
- Minimum order quantity validation
- CSV import architecture
- External API product source adapter (placeholder)
- Admin product & category management

### Phase 2 (Pending)
- Print locations & colour configuration UI
- Pricing engine admin UI
- Design provider integration
- Complete calculated order summary with printing

### Phase 3 (Pending)
- Cart, checkout, quotes
- Order & quote management
- Email notifications
- Payment integration (Stripe)

## Documentation

See the `docs/` directory for detailed documentation on architecture, database schema, API endpoints, pricing engine, and deployment.

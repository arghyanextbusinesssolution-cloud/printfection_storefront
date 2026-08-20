# Product Import

## CSV Import

### Expected CSV Columns (default mapping)

| Column | Field | Required |
|--------|-------|----------|
| name | Product name | Yes |
| sku | Product SKU | Yes |
| brand | Brand name | No |
| category | Category name | Yes (new products) |
| description | Description | No |
| base_price | Base price | No |
| colour | Variant colour | Yes |
| colour_hex | Colour hex code | No |
| size | Variant size | Yes |
| variant_sku | Variant SKU | No (auto-generated) |
| price | Variant price | No (defaults to base_price) |
| stock | Stock quantity | No |
| minimum_order_quantity | MOQ | No (default 25) |

### Import Flow

1. Admin uploads CSV via `/api/imports/preview` (optional preview)
2. Admin submits import via `/api/imports/csv`
3. System validates rows, creates/updates products by SKU
4. Invalid rows are reported with row numbers and error messages
5. Import job record created with counts (imported/updated/skipped/failed)

### Update Behavior

Existing products are matched by SKU or external ID and updated. Variants matched by variant SKU.

## External API Sync

Architecture is in place via `ApiProductSource` adapter. Implementation pending provider documentation.

Configure in `.env`:
```env
PRODUCT_API_BASE_URL=
PRODUCT_API_KEY=
```

Trigger sync: `POST /api/imports/sync`

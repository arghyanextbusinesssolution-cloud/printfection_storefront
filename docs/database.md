# Database Schema

## Collections

| Model | Purpose |
|-------|---------|
| Admin | Admin user accounts |
| Customer | Customer records |
| Category | Product categories |
| Brand | Product brands |
| Product | Garment products |
| ProductVariant | Size/colour/stock variants |
| PricingTier | Quantity-based discount tiers |
| PrintLocation | Configurable print areas |
| PrintPricingRule | Print pricing by location/colour/qty |
| Cart | Session-based shopping carts |
| Order | Customer orders |
| Quote | Quote requests |
| Design | Design configurations |
| ImportJob | CSV/API import history |

## Key Relationships

- Product → Category (many-to-one)
- ProductVariant → Product (many-to-one)
- PrintPricingRule → PrintLocation (many-to-one)
- Order → Customer (many-to-one, optional)
- Order.items → Product + variants + print config

## Indexes

All models include appropriate indexes for query performance:
- Product: slug, sku, category+isActive, text search
- ProductVariant: product+colourName+size, sku
- Order: orderNumber, orderStatus+createdAt

## Stock Management

Stock is maintained at the **variant level** (ProductVariant.stock), not at the product level.

## Soft Deletes

Products and categories use `isActive: false` rather than hard deletion to preserve business records.

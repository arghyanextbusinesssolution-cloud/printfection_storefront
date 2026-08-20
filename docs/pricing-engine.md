# Pricing Engine

## Overview

All pricing is calculated server-side via `PricingService`. Frontend displays estimates only; the backend validates all totals.

## API

`POST /api/pricing/calculate`

```json
{
  "productId": "...",
  "variants": [
    { "variantId": "...", "size": "M", "quantity": 50 }
  ],
  "printLocations": [
    { "locationId": "...", "colourCount": 2 }
  ]
}
```

## Response Breakdown

```json
{
  "garmentSubtotal": 225.00,
  "printingSubtotal": 75.00,
  "setupCharges": 30.00,
  "discount": 11.25,
  "subtotal": 318.75,
  "tax": 63.75,
  "shipping": 0,
  "total": 382.50,
  "currency": "GBP",
  "lineItems": [...]
}
```

## Pricing Factors

1. **Garment price** — from ProductVariant.price × quantity
2. **Quantity tier discount** — from PricingTier (configurable in admin)
3. **Print pricing** — from PrintPricingRule (location × colour count × quantity tier)
4. **Setup charges** — per print location/colour count
5. **VAT** — 20% (configurable via `@printfection/config`)

## Configuration

- **PricingTier**: Quantity ranges with discount percentages
- **PrintPricingRule**: Price per unit + setup charge by print location, colour count, and quantity range

## Validation Rules

- Total quantity must meet product's `minimumOrderQuantity`
- Print colour count must not exceed location's `maximumColours`
- Stock validated at variant level during bulk order validation

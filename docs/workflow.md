# Admin to Customer Workflow

This document explains how an admin sets up products and how a customer orders them — including when and how to run the seed script.

---

## Part 1: Initial Setup (One-Time)

### 1. Configure environment

Copy `.env.example` to `.env` and set at minimum:

```env
MONGODB_URI=mongodb://localhost:27017/printfection-uk
JWT_SECRET=your-long-random-secret
JWT_REFRESH_SECRET=your-other-long-random-secret
```

For Stripe test payments (optional):

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

Get test keys from [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys).

For local webhook testing:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`.

### 2. Install and start

```bash
npm install
npm run seed      # Populates database (see below)
npm run dev       # Starts API + Storefront + Admin
```

| App | URL |
|-----|-----|
| Storefront | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API | http://localhost:5000 |

---

## Part 2: What `npm run seed` Does

The seed script (`apps/api/src/scripts/seed.ts`) runs **once** against your MongoDB and creates:

| Data | Details |
|------|---------|
| **Admin user** | `admin@printfection.co.uk` / `Admin123!` (from `.env`) |
| **Categories** | T-Shirts, Sweatshirts, Hoodies, Polos, Vests, Bags |
| **Sample products** | 3 products with full variant matrix (colours × sizes XS–2XL) |
| **Print locations** | Full Front, Left Chest, Right Chest, Full Back, etc. |
| **Pricing tiers** | 25–49, 50–99, 100–249, 250+ quantity discounts |
| **Print pricing rules** | Example rules for Full Front (1–4 colours) |

**Important:** Seed is idempotent — it skips records that already exist (matched by SKU/slug). Safe to re-run without duplicating data.

```bash
npm run seed
```

Only run seed when:
- Setting up a **new** database for the first time
- Resetting a **development** database
- You want sample demo data quickly

**Do not rely on seed in production** — create real products via Admin or CSV import.

---

## Part 3: Admin Creates a Product (Manual)

### Step-by-step

1. **Login to Admin** → http://localhost:5174/login

2. **Create a category** (if needed)
   - Admin → Categories → Add Category
   - Example: `Hoodies`

3. **Create a product**
   - Admin → Products → Add Product
   - Fill in: Name, SKU, Category, Base Price, Minimum Order Qty (e.g. 25)
   - Click **Create Product**
   - You are redirected to the edit page

4. **Add variants** (colour + size combinations)
   - On the product edit page, scroll to **Variants**
   - Click **Add Variant** for each combination:
     - SKU: `PF-HOD-001-BLACK-M`
     - Colour: Black, Hex: `#1A1A1A`
     - Size: M
     - Price: £12.00
     - Stock: 200
   - Repeat for all sizes (XS, S, M, L, XL, 2XL) and colours

5. **Configure pricing** (optional, if not using seed defaults)
   - Admin → Pricing
   - **Quantity Tiers** — volume discounts
   - **Print Locations** — where printing can go
   - **Print Pricing Rules** — cost per location × colour count × quantity

6. **Product is live** — appears on storefront at `/products` immediately (if `isActive` is checked)

### Alternative: CSV Import

- Admin → Imports → upload CSV with columns: `name`, `sku`, `category`, `colour`, `size`, `price`, `stock`
- See `docs/product-import.md` for column mapping

---

## Part 4: Customer Orders a Product

### Customer journey (storefront)

```
Browse Products → Product Details → Bulk Order Wizard → Cart → Checkout
```

#### Step 1: Browse
- Customer visits http://localhost:5173/products
- Filters by category, brand, fabric, etc.

#### Step 2: Bulk Order Wizard (6 steps)

| Step | Action |
|------|--------|
| 1 | Choose product |
| 2 | Choose colour |
| 3 | Enter sizes & quantities (MOQ validated per product) |
| 4 | Select print locations & colour counts |
| 5 | Design studio (placeholder — save design reference) |
| 6 | Review pricing summary (calculated by backend) |

#### Step 3: Add to Cart
- Click **Add to Cart** on summary step
- Cart retains full configuration (not just product ID + qty)

#### Step 4: Checkout or Quote

**Option A — Pay by card (Stripe):**
- Cart → Proceed to Checkout
- Enter contact & shipping details
- Select **Pay by card**
- Redirected to Stripe Checkout
- On success → Order Success page, payment confirmed via webhook

**Option B — Pay by invoice:**
- Select **Pay by invoice**
- Order created with `paymentStatus: not_required`

**Option C — Request Quote:**
- Cart → Request Quote
- No payment — quote reference generated
- Emails sent to customer + admin (if SMTP configured)

---

## Part 5: Admin Manages Orders & Quotes

### Orders
- Admin → Orders → view list
- Click **View** → see full configuration, pricing, customer details
- Update status: pending → confirmed → artwork_review → production → dispatched → completed

### Quotes
- Admin → Quotes → view list
- Click **View** → review configuration and pricing
- **Convert to Order** — creates a confirmed order from the quote (quote status → `converted`)

---

## Part 6: End-to-End Flow Diagram

```
ADMIN SETUP                          CUSTOMER ORDER
─────────────                        ──────────────
npm run seed (once)                  
     │                               
Categories created                   Browse /products
     │                                    │
Products + Variants created          Bulk Order Wizard
     │                                    │
Print locations & pricing set        Add to Cart
     │                                    │
                                     Checkout / Quote
                                          │
                                     Order or Quote created
                                          │
Admin ←──────────────────────────── Email notification
     │
Orders / Quotes dashboard
     │
Convert quote → Order (if needed)
     │
Update order status → Production → Dispatch
```

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `npm run seed` | Populate DB with admin, categories, sample products |
| `npm run dev` | Start API (5000) + Storefront (5173) + Admin (5174) |
| `npm run dev:api` | API only |
| `npm run build` | Production build all apps |
| `npm run test` | Run API tests |
| `stripe listen --forward-to localhost:5000/api/payments/webhook` | Local Stripe webhooks |

---

## Stripe Test Cards

Use these in Stripe Checkout test mode:

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| Any future expiry, any CVC | — |

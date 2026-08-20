# Complete End-to-End Workflow Guide

This document describes the complete flow of data and user actions across the Printfection UK platform — from product creation in the Admin Dashboard, to custom customer configuration and Stripe checkout on the Storefront, and finally to order fulfillment in the Admin Dashboard.

---

## 1. Admin Product & Pricing Configuration

An administrator sets up the store catalog, variants, and bulk garment printing options using the **Admin Dashboard** (`http://localhost:5174`).

### Step A: Categories & Print Locations
1. **Categories**: Admin creates categories (e.g. *T-Shirts*, *Hoodies*) under **Categories**.
2. **Print Locations**: Under **Pricing → Print Locations**, the Admin adds print locations (e.g. `FULL_FRONT`, `LEFT_CHEST`) with maximum colour constraints. Modals are used to update and activate/deactivate locations.
3. **Print Pricing Rules**: Under **Pricing → Print Pricing Rules**, rules are added mapping print location + number of print colours + min quantity to unit printing costs and setup fees.

### Step B: Create a Product
1. Admin goes to **Products → Add Product**.
2. Fills in basic fields: *Name*, *SKU*, *Brand*, *Category*, *Base Price*, *Minimum Order Quantity (MOQ)*, and fabric/gender tags.
3. Clicks **Create Product**. The database records the product with `isActive: true` and redirects the Admin to the edit page.

### Step C: Dedicated Variant Management
1. From the product edit page, the Admin clicks **Manage Variants** to open the dedicated variant management screen (`/products/:id/variants`).
2. Admin opens the **Add Variant** modal and adds various colour/size variants:
   - Sets unique Variant SKU (e.g., `PF-TSH-001-BLACK-M`).
   - Inputs colour name and chooses its hexadecimal code using a color picker.
   - Defines size (XS–2XL), custom price (e.g., base price + size surcharge), and initial stock levels.
3. Variants can be enabled, disabled, or edited at any time using interactive modals.

---

## 2. Catalog & Ordering on the Storefront

The customer shops and configures orders on the **Storefront** (`http://localhost:5173`).

### Step A: Catalogue Discovery
- The customer browses `/products`, filters by brand, category, colour, size, fabric, and searches keywords.
- Active products with active variants display immediately.

### Step B: The Bulk Order Wizard
On the product details page, the customer triggers the custom order configurator:
1. **Select Colour**: Picks from the list of distinct active colours (derived from variants).
2. **Quantities & Sizes**: Enters quantities for each size. The wizard validates that the total quantity meets the product's Minimum Order Quantity (MOQ).
3. **Print Locations**: Chooses print locations and colour count (e.g., Full Front - 2 Colours).
4. **Design Upload**: Saves reference links or files for their custom artwork.
5. **Pricing Breakdown**: Calculates bulk pricing in real-time, applying:
   - Volume discount percentages based on **Quantity Tiers**.
   - Custom garment price surcharges per variant size.
   - Screen printing and screen setup fees based on the print locations and colour count rules.
6. Clicks **Add to Cart** to save the item configuration in the session.

---

## 3. Stripe Checkout & Webhook Integration

### Step A: Checkout Checkout Form
- Customer proceeds to `/checkout`.
- Enters shipping and contact information.
- The checkout page displays an **Order Summary Sidebar**, detailing all configured garments, quantities, and pricing breakdowns.
- The customer selects **Pay by card (Stripe)**.

### Step B: Order Placement & Redirect
1. Upon clicking **Proceed to Payment**, an order is created on the database in `pending` payment status.
2. The storefront calls the backend API: `POST /api/payments/checkout/:orderId`.
3. The backend creates a Stripe Checkout Session with the customer's email, order number, total price, and attaches `sessionId` (the customer's cart session ID) inside Stripe metadata.
4. Storefront receives the Stripe Checkout URL and redirects the user (`window.location.href`).
5. **Stripe hosted secure checkout** processes the payment.

### Step C: Success & Cart Clearing
- **If Payment is Completed**: Stripe redirects the customer back to the Storefront at `/order-success?ref=PF-ORD-XXX&session_id=cs_test_XXX`.
  - The storefront success page calls `/api/payments/verify?session_id=...` which validates the session directly with Stripe.
  - Simultaneously, Stripe sends a secure `checkout.session.completed` event to the backend Webhook (`/api/payments/webhook`).
  - Upon webhook verification, the backend changes the order status to `confirmed`, payment status to `paid`, reads the `sessionId` from metadata, and clears the cart collection.
  - The storefront success page invalidates the `cart` query, updating the UI cart status to empty.
- **If Payment is Cancelled**: Stripe redirects the customer to `/checkout?cancelled=true`.
  - The cart remains intact on the session, and the customer returns to checkout without losing their bulk order configurations.

---

## 4. Admin Order Processing

1. Admin goes to **Orders** in the dashboard.
2. Shows order `PF-ORD-XXX` with status `confirmed` and payment status `paid`.
3. Admin views details: shipping address, pricing breakdowns, specific garment sizes, colour hexes, and print location selections.
4. Admin progresses order status as processing continues:
   `confirmed` → `artwork_review` → `production` → `dispatched` → `completed`.

---

## 5. Seed Script Architecture (`npm run seed`)

The seed script (`apps/api/src/scripts/seed.ts`) populates the MongoDB database during development:
- **Admin Accounts**: Creates a default Superadmin (`admin@printfection.co.uk` / `Admin123!`).
- **Initial Categories**: Seed T-Shirts, Hoodies, Polos, Bags.
- **Initial Print Locations**: Registers Neck, Sleeves, Front, Back.
- **Volume Tiers**: Seeds 25-49, 50-99, 100-249, 250+ quantity tiers.
- **Base Print Rules**: Installs rules for Front location print charges.
- **Sample Products & Variant Matrix**: Spawns 3 complex garments (Classic Organic T-Shirt, Premium Hoodie, Performance Polo) and automatically generates their entire variants matrix (colours × sizes XS–2XL) with random stock and SKU strings.
- **Idempotency**: The script is safe to run multiple times; it will verify existing SKUs and slugs before injecting new documents.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { stripeWebhook } from './controllers/payment.controller';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import bulkOrderRoutes from './routes/bulkOrder.routes';
import singleOrderRoutes from './routes/singleOrder.routes';
import pricingRoutes from './routes/pricing.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import quoteRoutes from './routes/quote.routes';
import adminRoutes from './routes/admin.routes';
import importRoutes from './routes/import.routes';
import printOptionRoutes from './routes/printOption.routes';
import designRoutes from './routes/design.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [env.STOREFRONT_URL, env.ADMIN_URL],
  credentials: true,
}));

// Stripe webhook must receive raw body — register before JSON parser
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bulk-order', bulkOrderRoutes);
app.use('/api/single-order', singleOrderRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/print-locations', printOptionRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

export default app;

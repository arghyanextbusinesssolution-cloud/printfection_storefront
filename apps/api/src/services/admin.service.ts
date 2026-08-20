import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Order } from '../models/Order';
import { Quote } from '../models/Quote';
import { LOW_STOCK_THRESHOLD } from '@printfection/config';
import type { DashboardStats } from '@printfection/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalOrders,
    totalQuotes,
    pendingOrders,
    revenueResult,
    recentOrders,
    recentQuotes,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    ProductVariant.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD }, isActive: true }),
    Order.countDocuments(),
    Quote.countDocuments(),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Quote.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalOrders,
    totalQuotes,
    pendingOrders,
    revenue: revenueResult[0]?.total ?? 0,
    recentOrders,
    recentQuotes,
  };
}

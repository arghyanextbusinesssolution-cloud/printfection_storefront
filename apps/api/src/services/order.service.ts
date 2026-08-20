import { generateOrderNumber, generateQuoteReference } from '@printfection/shared';
import { Order, IOrder } from '../models/Order';
import { Quote, IQuote } from '../models/Quote';
import { Customer } from '../models/Customer';
import { ProductVariant } from '../models/ProductVariant';
import { PrintLocation } from '../models/PrintLocation';
import { calculatePricing } from './pricing.service';
import { sendOrderEmails, sendQuoteEmails } from './email.service';
import { clearCart, getCart } from './cart.service';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, parsePaginationParams } from '../utils/pagination';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import type { PaginatedResponse } from '@printfection/types';

interface CustomerInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country?: string;
}

interface OrderItemInput {
  productId: string;
  productName: string;
  colourName: string;
  colourHex?: string;
  variants: { variantId: string; size: string; quantity: number }[];
  printLocations?: { locationId: string; colourCount: number }[];
  designId?: string;
}

async function findOrCreateCustomer(input: CustomerInput) {
  let customer = await Customer.findOne({ email: input.email.toLowerCase() });
  if (!customer) {
    customer = await Customer.create({
      email: input.email.toLowerCase(),
      name: input.name,
      phone: input.phone,
      company: input.company,
    });
  }
  return customer;
}

async function enrichOrderItems(items: OrderItemInput[]) {
  const enriched = [];
  let pricingBreakdown = {
    garmentSubtotal: 0,
    printingSubtotal: 0,
    setupCharges: 0,
    discount: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    currency: 'GBP',
  };

  for (const item of items) {
    const pricing = await calculatePricing({
      productId: item.productId,
      variants: item.variants,
      printLocations: item.printLocations,
    });

    pricingBreakdown = {
      garmentSubtotal: pricingBreakdown.garmentSubtotal + pricing.garmentSubtotal,
      printingSubtotal: pricingBreakdown.printingSubtotal + pricing.printingSubtotal,
      setupCharges: pricingBreakdown.setupCharges + pricing.setupCharges,
      discount: pricingBreakdown.discount + pricing.discount,
      subtotal: pricingBreakdown.subtotal + pricing.subtotal,
      tax: pricingBreakdown.tax + pricing.tax,
      shipping: pricingBreakdown.shipping + pricing.shipping,
      total: pricingBreakdown.total + pricing.total,
      currency: pricing.currency,
    };

    const variantsWithPrice = await Promise.all(
      item.variants
        .filter((v) => v.quantity > 0)
        .map(async (v) => {
          const variant = await ProductVariant.findById(v.variantId);
          return { ...v, unitPrice: variant?.price ?? 0 };
        })
    );

    const printLocations = await Promise.all(
      (item.printLocations || []).map(async (pl) => {
        const location = await PrintLocation.findById(pl.locationId);
        return {
          locationId: pl.locationId,
          locationName: location?.name,
          colourCount: pl.colourCount,
        };
      })
    );

    enriched.push({
      productId: item.productId,
      productName: item.productName,
      colourName: item.colourName,
      colourHex: item.colourHex,
      variants: variantsWithPrice,
      printLocations,
      designId: item.designId,
      pricingSnapshot: pricing,
    });
  }

  return { items: enriched, pricingBreakdown };
}

export async function createOrderFromItems(input: {
  customer: CustomerInput;
  billingAddress?: AddressInput;
  shippingAddress?: AddressInput;
  items: OrderItemInput[];
  customerNotes?: string;
  sessionId?: string;
  paymentMethod?: 'online' | 'invoice';
}): Promise<IOrder> {
  const customer = await findOrCreateCustomer(input.customer);
  const { items, pricingBreakdown } = await enrichOrderItems(input.items);

  const paymentStatus =
    input.paymentMethod === 'online' && env.STRIPE_SECRET_KEY ? 'pending' : 'not_required';

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: customer._id,
    customerSnapshot: input.customer,
    billingAddress: input.billingAddress,
    shippingAddress: input.shippingAddress || input.billingAddress,
    items,
    designReferences: items.filter((i) => i.designId).map((i) => i.designId),
    pricingBreakdown,
    subtotal: pricingBreakdown.subtotal,
    tax: pricingBreakdown.tax,
    shipping: pricingBreakdown.shipping,
    total: pricingBreakdown.total,
    currency: pricingBreakdown.currency,
    paymentStatus,
    orderStatus: 'pending',
    customerNotes: input.customerNotes,
  });

  if (input.sessionId && input.paymentMethod !== 'online') {
    await clearCart(input.sessionId);
  }

  await sendOrderEmails({
    orderNumber: order.orderNumber,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    total: order.total,
    currency: order.currency,
    adminEmail: env.SEED_ADMIN_EMAIL,
  });

  logger.info('Order created', { orderNumber: order.orderNumber });
  return order;
}

export async function createOrderFromCart(input: {
  sessionId: string;
  customer: CustomerInput;
  billingAddress?: AddressInput;
  shippingAddress?: AddressInput;
  customerNotes?: string;
  paymentMethod?: 'online' | 'invoice';
}): Promise<IOrder> {
  const cart = await getCart(input.sessionId);
  if (cart.items.length === 0) throw ApiError.badRequest('Cart is empty');

  const items: OrderItemInput[] = cart.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    colourName: item.colourName,
    colourHex: item.colourHex,
    variants: item.variants,
    printLocations: item.printLocations,
    designId: item.designId,
  }));

  return createOrderFromItems({ ...input, items, sessionId: input.sessionId, paymentMethod: input.paymentMethod });
}

export async function createQuote(input: {
  customer: CustomerInput;
  items: OrderItemInput[];
  customerNotes?: string;
  sessionId?: string;
}): Promise<IQuote> {
  const { items, pricingBreakdown } = await enrichOrderItems(input.items);

  const quote = await Quote.create({
    quoteReference: generateQuoteReference(),
    customerSnapshot: input.customer,
    items,
    designReferences: items.filter((i) => i.designId).map((i) => i.designId),
    pricingBreakdown,
    subtotal: pricingBreakdown.subtotal,
    tax: pricingBreakdown.tax,
    shipping: pricingBreakdown.shipping,
    total: pricingBreakdown.total,
    currency: pricingBreakdown.currency,
    status: 'pending',
    customerNotes: input.customerNotes,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  if (input.sessionId) {
    await clearCart(input.sessionId);
  }

  await sendQuoteEmails({
    quoteReference: quote.quoteReference,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    total: quote.total,
    currency: quote.currency,
    adminEmail: env.SEED_ADMIN_EMAIL,
  });

  logger.info('Quote created', { quoteReference: quote.quoteReference });
  return quote;
}

export async function createQuoteFromCart(input: {
  sessionId: string;
  customer: CustomerInput;
  customerNotes?: string;
}): Promise<IQuote> {
  const cart = await getCart(input.sessionId);
  if (cart.items.length === 0) throw ApiError.badRequest('Cart is empty');

  const items: OrderItemInput[] = cart.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    colourName: item.colourName,
    colourHex: item.colourHex,
    variants: item.variants,
    printLocations: item.printLocations,
    designId: item.designId,
  }));

  return createQuote({ ...input, items, sessionId: input.sessionId });
}

export async function listOrders(query: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<IOrder>> {
  const { page, limit, skip } = parsePaginationParams(query.page, query.limit);
  const filter = query.status ? { orderStatus: query.status } : {};

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getOrderById(id: string): Promise<IOrder> {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}

export async function updateOrderStatus(
  id: string,
  orderStatus: string,
  adminNotes?: string
): Promise<IOrder> {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  order.orderStatus = orderStatus as IOrder['orderStatus'];
  if (adminNotes !== undefined) order.adminNotes = adminNotes;
  await order.save();
  return order;
}

export async function listQuotes(query: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<IQuote>> {
  const { page, limit, skip } = parsePaginationParams(query.page, query.limit);
  const filter = query.status ? { status: query.status } : {};

  const [items, total] = await Promise.all([
    Quote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Quote.countDocuments(filter),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getQuoteById(id: string): Promise<IQuote> {
  const quote = await Quote.findById(id);
  if (!quote) throw ApiError.notFound('Quote not found');
  return quote;
}

export async function updateQuoteStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<IQuote> {
  const quote = await Quote.findById(id);
  if (!quote) throw ApiError.notFound('Quote not found');
  quote.status = status as IQuote['status'];
  if (adminNotes !== undefined) quote.adminNotes = adminNotes;
  await quote.save();
  return quote;
}

export async function convertQuoteToOrder(quoteId: string, adminNotes?: string): Promise<IOrder> {
  const quote = await Quote.findById(quoteId);
  if (!quote) throw ApiError.notFound('Quote not found');
  if (quote.status === 'converted') throw ApiError.conflict('Quote has already been converted to an order');

  const customer = await findOrCreateCustomer({
    name: quote.customerSnapshot.name,
    email: quote.customerSnapshot.email,
    phone: quote.customerSnapshot.phone,
    company: quote.customerSnapshot.company,
  });

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: customer._id,
    customerSnapshot: quote.customerSnapshot,
    items: quote.items,
    designReferences: quote.designReferences || [],
    pricingBreakdown: quote.pricingBreakdown,
    subtotal: quote.subtotal,
    tax: quote.tax,
    shipping: quote.shipping,
    total: quote.total,
    currency: quote.currency,
    paymentStatus: 'not_required',
    orderStatus: 'confirmed',
    customerNotes: quote.customerNotes,
    adminNotes: adminNotes || `Converted from quote ${quote.quoteReference}`,
    quoteReference: quote.quoteReference,
  });

  quote.status = 'converted';
  if (adminNotes) quote.adminNotes = adminNotes;
  await quote.save();

  logger.info('Quote converted to order', {
    quoteReference: quote.quoteReference,
    orderNumber: order.orderNumber,
  });

  return order;
}

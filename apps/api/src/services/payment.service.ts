import Stripe from 'stripe';
import { env } from '../config/env';
import { Order } from '../models/Order';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { clearCart } from './cart.service';

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}

function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw ApiError.badRequest('Stripe is not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export function getStripePublishableKey(): string | null {
  return env.STRIPE_PUBLISHABLE_KEY || null;
}

export async function createCheckoutSession(orderId: string, cartSessionId?: string): Promise<{ url: string; sessionId: string }> {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.paymentStatus === 'paid') throw ApiError.badRequest('Order is already paid');

  const stripe = getStripe();
  const amountInPence = Math.round(order.total * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: order.customerSnapshot.email,
    line_items: [
      {
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: `Printfection UK Order ${order.orderNumber}`,
            description: `Bulk garment printing order — ${order.items.length} configured item(s)`,
          },
          unit_amount: amountInPence,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      sessionId: cartSessionId || '',
    },
    success_url: `${env.STOREFRONT_URL}/order-success?ref=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.STOREFRONT_URL}/checkout?cancelled=true`,
  });

  order.stripeSessionId = session.id;
  order.paymentStatus = 'pending';
  await order.save();

  logger.info('Stripe checkout session created', { orderNumber: order.orderNumber, sessionId: session.id });

  if (!session.url) throw ApiError.internal('Failed to create Stripe checkout session');

  return { url: session.url, sessionId: session.id };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw ApiError.badRequest('Stripe webhook secret not configured');
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', err);
    throw ApiError.badRequest('Invalid webhook signature');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const cartSessionId = session.metadata?.sessionId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.stripeSessionId = session.id;
        order.stripePaymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;
        await order.save();
        logger.info('Order payment confirmed via webhook', { orderNumber: order.orderNumber });

        if (cartSessionId) {
          await clearCart(cartSessionId);
          logger.info('Cart cleared via webhook', { cartSessionId });
        }
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      logger.info('Checkout session expired', { orderId });
    }
  }
}

export async function verifyCheckoutSession(sessionId: string): Promise<{ paid: boolean; orderNumber?: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid' && session.metadata?.orderId) {
    const order = await Order.findById(session.metadata.orderId);
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.stripeSessionId = session.id;
      await order.save();
    }
    const cartSessionId = session.metadata?.sessionId;
    if (cartSessionId) {
      await clearCart(cartSessionId);
      logger.info('Cart cleared via verifyCheckoutSession', { cartSessionId });
    }
    return { paid: true, orderNumber: session.metadata.orderNumber };
  }

  return { paid: false, orderNumber: session.metadata?.orderNumber };
}

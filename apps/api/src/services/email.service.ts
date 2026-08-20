import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

function isEmailConfigured(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

  if (!isEmailConfigured()) {
    logger.info('Email not configured — logging email instead', {
      to: recipients,
      subject: payload.subject,
    });
    return true;
  }

  try {
    const nodemailer = await import('nodemailer') as typeof import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: (env.SMTP_PORT || 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM || env.SMTP_USER,
      to: recipients.join(', '),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    logger.info('Email sent', { to: recipients, subject: payload.subject });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { error, subject: payload.subject });
    return false;
  }
}

export async function sendQuoteEmails(data: {
  quoteReference: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  adminEmail?: string;
}): Promise<void> {
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: data.currency,
  }).format(data.total);

  await sendEmail({
    to: data.customerEmail,
    subject: `Quote Request ${data.quoteReference} — Printfection UK`,
    html: `
      <h2>Thank you for your quote request</h2>
      <p>Hi ${data.customerName},</p>
      <p>We have received your quote request <strong>${data.quoteReference}</strong>.</p>
      <p>Estimated total: <strong>${formattedTotal}</strong></p>
      <p>Our team will review your order and contact you shortly.</p>
      <p>Printfection UK</p>
    `,
    text: `Quote ${data.quoteReference} received. Estimated total: ${formattedTotal}`,
  });

  if (data.adminEmail) {
    await sendEmail({
      to: data.adminEmail,
      subject: `New Quote Request: ${data.quoteReference}`,
      html: `
        <h2>New Quote Request</h2>
        <p>Reference: <strong>${data.quoteReference}</strong></p>
        <p>Customer: ${data.customerName} (${data.customerEmail})</p>
        <p>Estimated total: ${formattedTotal}</p>
      `,
    });
  }
}

export async function sendOrderEmails(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  adminEmail?: string;
}): Promise<void> {
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: data.currency,
  }).format(data.total);

  await sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation ${data.orderNumber} — Printfection UK`,
    html: `
      <h2>Order Confirmed</h2>
      <p>Hi ${data.customerName},</p>
      <p>Your order <strong>${data.orderNumber}</strong> has been received.</p>
      <p>Total: <strong>${formattedTotal}</strong></p>
      <p>We will be in touch regarding artwork and production.</p>
      <p>Printfection UK</p>
    `,
  });

  if (data.adminEmail) {
    await sendEmail({
      to: data.adminEmail,
      subject: `New Order: ${data.orderNumber}`,
      html: `
        <h2>New Order Received</h2>
        <p>Order: <strong>${data.orderNumber}</strong></p>
        <p>Customer: ${data.customerName} (${data.customerEmail})</p>
        <p>Total: ${formattedTotal}</p>
      `,
    });
  }
}

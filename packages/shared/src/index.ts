export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculateTotalQuantity(
  variants: { quantity: number }[]
): number {
  return variants.reduce((sum, v) => sum + v.quantity, 0);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PF-${timestamp}-${random}`;
}

export function generateQuoteReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QT-${timestamp}-${random}`;
}

export function parsePaginationParams(
  page?: string | number,
  limit?: string | number,
  defaultLimit = 24
): { page: number; limit: number; skip: number } {
  const parsedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || defaultLimit), 10) || defaultLimit));
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
}

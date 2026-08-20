import { parsePaginationParams } from '@printfection/shared';
import type { PaginationMeta } from '@printfection/types';

export { parsePaginationParams };

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

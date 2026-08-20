import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import {
  ProductSourceAdapter,
  NormalizedProduct,
} from './ProductSourceAdapter';

/**
 * External API product source adapter.
 * Provider-specific implementation will be configured when API documentation is supplied.
 */
export class ApiProductSource implements ProductSourceAdapter {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || env.PRODUCT_API_BASE_URL || '';
    this.apiKey = apiKey || env.PRODUCT_API_KEY || '';
  }

  private ensureConfigured(): void {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error(
        'External product API is not configured. Set PRODUCT_API_BASE_URL and PRODUCT_API_KEY.'
      );
    }
  }

  async getProducts(): Promise<NormalizedProduct[]> {
    this.ensureConfigured();
    logger.info('External API product fetch not yet implemented', { baseUrl: this.baseUrl });
    // Provider-specific implementation to be added when documentation is available
    return [];
  }

  async getProduct(id: string): Promise<NormalizedProduct | null> {
    this.ensureConfigured();
    logger.info('External API single product fetch not yet implemented', { id });
    return null;
  }

  async syncProducts(): Promise<{ synced: number; errors: string[] }> {
    this.ensureConfigured();
    logger.info('External API sync not yet implemented');
    return {
      synced: 0,
      errors: ['External product API integration pending provider documentation'],
    };
  }
}

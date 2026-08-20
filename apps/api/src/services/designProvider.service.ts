import { env } from '../config/env';
import { Design, IDesign } from '../models/Design';
import { ApiError } from '../utils/ApiError';

export interface DesignProviderAdapter {
  createDesign(productId: string, config?: Record<string, unknown>): Promise<{ externalId?: string; previewUrl?: string }>;
  loadDesign(externalId: string): Promise<Record<string, unknown>>;
  saveDesign(externalId: string, config: Record<string, unknown>): Promise<void>;
  exportDesign(externalId: string): Promise<{ exportUrl?: string }>;
  getPreview(externalId: string): Promise<string>;
}

class PlaceholderDesignProvider implements DesignProviderAdapter {
  async createDesign(_productId: string, config?: Record<string, unknown>) {
    return { externalId: `placeholder-${Date.now()}`, previewUrl: undefined, config };
  }
  async loadDesign(externalId: string) {
    return { externalId, elements: [] };
  }
  async saveDesign(_externalId: string, _config: Record<string, unknown>) {}
  async exportDesign(externalId: string) {
    return { exportUrl: `/api/designs/export/${externalId}` };
  }
  async getPreview(_externalId: string) {
    return '';
  }
}

function getProvider(): DesignProviderAdapter {
  const provider = env.DESIGN_PROVIDER || 'placeholder';
  if (provider === 'placeholder') return new PlaceholderDesignProvider();
  // Fancy Product Designer and Lumise adapters to be implemented when license confirmed
  return new PlaceholderDesignProvider();
}

export async function createDesign(input: {
  productId: string;
  sessionId?: string;
  configuration?: Record<string, unknown>;
}): Promise<IDesign> {
  const provider = getProvider();
  const result = await provider.createDesign(input.productId, input.configuration);

  return Design.create({
    provider: env.DESIGN_PROVIDER || 'placeholder',
    externalId: result.externalId,
    productId: input.productId,
    sessionId: input.sessionId,
    configuration: input.configuration || {},
    previewUrl: result.previewUrl,
    status: 'draft',
  });
}

export async function getDesign(id: string): Promise<IDesign> {
  const design = await Design.findById(id);
  if (!design) throw ApiError.notFound('Design not found');
  return design;
}

export async function saveDesign(
  id: string,
  configuration: Record<string, unknown>
): Promise<IDesign> {
  const design = await Design.findById(id);
  if (!design) throw ApiError.notFound('Design not found');

  const provider = getProvider();
  if (design.externalId) {
    await provider.saveDesign(design.externalId, configuration);
  }

  design.configuration = configuration;
  design.status = 'saved';
  await design.save();
  return design;
}

export async function exportDesign(id: string): Promise<IDesign> {
  const design = await Design.findById(id);
  if (!design) throw ApiError.notFound('Design not found');

  const provider = getProvider();
  if (design.externalId) {
    const result = await provider.exportDesign(design.externalId);
    design.exportUrl = result.exportUrl;
  }
  design.status = 'exported';
  await design.save();
  return design;
}

export function getProviderInfo() {
  return {
    provider: env.DESIGN_PROVIDER || 'placeholder',
    configured: !!(env.DESIGN_PROVIDER && env.DESIGN_PROVIDER_LICENSE_KEY),
    features: ['upload', 'text', 'preview', 'save'],
  };
}

import { ApiProductSource } from '../integrations/product-source/ApiProductSource';
import { importProducts } from './csvImport.service';
import { ImportJob } from '../models/ImportJob';
import { logger } from '../utils/logger';

export async function syncProductsFromApi(adminId?: string): Promise<{
  jobId: string;
  synced: number;
  errors: string[];
}> {
  const job = await ImportJob.create({
    filename: 'api-sync',
    source: 'api',
    status: 'processing',
    startedAt: new Date(),
    createdBy: adminId,
  });

  try {
    const source = new ApiProductSource();
    const { synced, errors } = await source.syncProducts();

    if (synced > 0) {
      const products = await source.getProducts();
      await importProducts(products, job._id.toString());
    }

    await ImportJob.findByIdAndUpdate(job._id, {
      status: errors.length > 0 && synced === 0 ? 'failed' : 'completed',
      completedAt: new Date(),
    });

    logger.info('API product sync completed', { jobId: job._id, synced, errorCount: errors.length });

    return { jobId: job._id.toString(), synced, errors };
  } catch (error) {
    await ImportJob.findByIdAndUpdate(job._id, {
      status: 'failed',
      completedAt: new Date(),
      importErrors: [{ message: error instanceof Error ? error.message : 'Sync failed' }],
    });
    throw error;
  }
}

import { Request, Response } from 'express';
import { CsvProductSource, previewCsvImport } from '../integrations/product-source/CsvProductSource';
import { importProducts } from '../services/csvImport.service';
import { syncProductsFromApi } from '../services/productSync.service';
import { ImportJob } from '../models/ImportJob';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const previewImport = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('CSV file is required');
  const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : undefined;
  const source = new CsvProductSource(req.file.path, mapping);
  const products = await source.getProducts();
  const preview = previewCsvImport(req.file.path, mapping);

  sendSuccess(res, {
    preview: products.slice(0, 10),
    totalProducts: products.length,
    invalidRows: preview.invalid,
    summary: {
      total: preview.valid.length + preview.invalid.length,
      valid: products.length,
      invalid: preview.invalid.length,
    },
  });
});

export const importCsv = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('CSV file is required');

  const job = await ImportJob.create({
    filename: req.file.originalname,
    source: 'csv',
    status: 'processing',
    startedAt: new Date(),
    createdBy: req.admin?._id,
  });

  const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : undefined;
  const source = new CsvProductSource(req.file.path, mapping);
  const products = await source.getProducts();
  const result = await importProducts(products, job._id.toString());

  sendSuccess(res, { jobId: job._id, ...result }, 'Import completed');
});

export const listImportJobs = asyncHandler(async (_req: Request, res: Response) => {
  const jobs = await ImportJob.find().sort({ createdAt: -1 }).limit(50);
  sendSuccess(res, jobs);
});

export const syncFromApi = asyncHandler(async (req: Request, res: Response) => {
  const result = await syncProductsFromApi(req.admin?._id?.toString());
  sendSuccess(res, result, 'Sync initiated');
});

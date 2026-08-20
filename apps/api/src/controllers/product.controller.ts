import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts(req.query as Parameters<typeof productService.listProducts>[0]);
  sendSuccess(res, result);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req.params.id);
  const product = await productService.getProductById(id);
  const variants = await productService.getProductVariants(id);
  sendSuccess(res, { product, variants });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = paramId(req.params.slug);
  const product = await productService.getProductBySlug(slug);
  const variants = await productService.getProductVariants(String(product._id));
  sendSuccess(res, { product, variants });
});

export const getFilterOptions = asyncHandler(async (_req: Request, res: Response) => {
  const options = await productService.getFilterOptions();
  sendSuccess(res, options);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, product, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(paramId(req.params.id), req.body);
  sendSuccess(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(paramId(req.params.id));
  sendSuccess(res, null, 'Product deactivated');
});

export const createVariant = asyncHandler(async (req: Request, res: Response) => {
  const variant = await productService.createVariant(paramId(req.params.productId), req.body);
  sendSuccess(res, variant, 'Variant created', 201);
});

export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
  const variant = await productService.updateVariant(paramId(req.params.variantId), req.body);
  sendSuccess(res, variant, 'Variant updated');
});

export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  const variants = await productService.getVariantsByProduct(paramId(req.params.productId));
  sendSuccess(res, variants);
});

export const getProductColours = asyncHandler(async (req: Request, res: Response) => {
  const colours = await productService.getProductColours(paramId(req.params.productId));
  sendSuccess(res, colours);
});

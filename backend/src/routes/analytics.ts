import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getAnalyticsByDimension,
  getAnalyticsSummary,
  getFilterOptions,
  getSalaryDistribution,
} from '../services/analyticsService';
import {
  analyticsByDimensionSchema,
  distributionSchema,
} from '../validators/employee';

const router = Router();

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const currency = req.query.currency as string | undefined;
    const summary = await getAnalyticsSummary(currency);
    res.json(summary);
  })
);

router.get(
  '/by-dimension',
  asyncHandler(async (req, res) => {
    const params = analyticsByDimensionSchema.parse(req.query);
    const data = await getAnalyticsByDimension(params.dimension, params.currency);
    res.json(data);
  })
);

router.get(
  '/distribution',
  asyncHandler(async (req, res) => {
    const params = distributionSchema.parse(req.query);
    const data = await getSalaryDistribution(params.currency, params.buckets);
    res.json(data);
  })
);

router.get(
  '/filters',
  asyncHandler(async (_req, res) => {
    const options = await getFilterOptions();
    res.json(options);
  })
);

export default router;

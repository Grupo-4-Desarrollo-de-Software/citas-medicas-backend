import { NextFunction, Request, Response } from 'express';
import { getOperationMetrics } from '../services/metrics.service';

export const operationMetricsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const metrics = await getOperationMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

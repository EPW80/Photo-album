import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validatePhotoId = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  // Check if id exists
  if (!id) {
    throw new AppError('Photo ID is required', 400);
  }

  // Check for decimal points (not allowed)
  if (id.includes('.')) {
    throw new AppError('Photo ID must be a valid positive integer', 400);
  }

  // Parse id to number
  const photoId = parseInt(id, 10);

  // Validate that id is a valid positive integer
  if (isNaN(photoId) || photoId <= 0 || !Number.isInteger(photoId)) {
    throw new AppError('Photo ID must be a valid positive integer', 400);
  }

  // Attach parsed id to request for use in controllers
  req.params.id = photoId.toString();

  next();
};

export const sanitizeInput = (input: string): string => {
  // Remove any HTML tags
  return input.replace(/<[^>]*>/g, '');
};

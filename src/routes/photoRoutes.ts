import { PhotoController } from '../controllers/photoController';
import { Application } from 'express';
import { validatePhotoId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const photoController = new PhotoController();

export const photoRoutes = (app: Application): void => {
  /**
   * GET /photos
   * Get all photos
   */
  app.get(
    '/photos',
    asyncHandler(async (req, res) => {
      await Promise.resolve(photoController.getPhotos(req, res));
    })
  );

  /**
   * GET /photo/:id
   * Get a single photo by ID
   * Validates photo ID before processing
   */
  app.get(
    '/photo/:id',
    validatePhotoId,
    asyncHandler(async (req, res) => {
      await Promise.resolve(photoController.getPhoto(req, res));
    })
  );
};

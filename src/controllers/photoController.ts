import { Request, Response } from 'express';
import { PhotoService } from '../services/photoService';
import { PhotoResponse } from '../types/photo.types';

export class PhotoController {
  private photoService: PhotoService;

  constructor() {
    this.photoService = new PhotoService();
  }

  /**
   * Get all photos (with optional pagination)
   * Handles GET /photos
   * Query params:
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 12, max: 50)
   *   - paginated: If 'true', returns paginated response; otherwise returns array (backward compatible)
   */
  getPhotos(req: Request, res: Response): void {
    const { page, limit, paginated } = req.query;

    // Check if pagination is requested
    if (paginated === 'true' || page !== undefined || limit !== undefined) {
      const params = PhotoService.validatePaginationParams(
        page as string,
        limit as string
      );
      const result = this.photoService.getPhotosPaginated(params);
      res.json(result);
      return;
    }

    // Default: return all photos (backward compatible)
    const photos = this.photoService.getAllPhotos();
    res.json(photos);
  }

  /**
   * Get a single photo by ID
   * Handles GET /photo/:id
   * @throws AppError if photo not found (handled by error middleware)
   */
  getPhoto(req: Request, res: Response): void {
    const id = parseInt(req.params.id, 10);
    const photo: PhotoResponse = this.photoService.getPhotoById(id);
    res.json(photo);
  }
}

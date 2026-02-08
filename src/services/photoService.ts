import { Photo } from '../models/photo';
import {
  PhotoDTO,
  PhotoResponse,
  PaginationParams,
  PaginatedPhotosResponse,
} from '../types/photo.types';
import { AppError } from '../middleware/errorHandler';
import photosData from '../config/photos.json';

// Default pagination settings
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 50;

export class PhotoService {
  private photos: Photo[];

  constructor() {
    // Load photos from JSON config
    this.photos = (photosData as PhotoDTO[]).map(
      (data) => new Photo(data.id, data.url)
    );
  }

  /**
   * Get all photos
   * @returns Array of photo responses
   */
  getAllPhotos(): PhotoResponse[] {
    return this.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
    }));
  }

  /**
   * Get a single photo by ID
   * @param id - Photo ID
   * @returns Photo response
   * @throws AppError if photo not found
   */
  getPhotoById(id: number): PhotoResponse {
    const photo = this.photos.find((p) => p.id === id);

    if (!photo) {
      throw new AppError('Photo not found', 404);
    }

    return {
      id: photo.id,
      url: photo.url,
    };
  }

  /**
   * Check if a photo exists
   * @param id - Photo ID
   * @returns True if photo exists, false otherwise
   */
  photoExists(id: number): boolean {
    return this.photos.some((p) => p.id === id);
  }

  /**
   * Get total number of photos
   * @returns Total count
   */
  getTotalCount(): number {
    return this.photos.length;
  }

  /**
   * Get paginated photos
   * @param params - Pagination parameters
   * @returns Paginated photos response
   */
  getPhotosPaginated(params: PaginationParams): PaginatedPhotosResponse {
    const { page, limit } = params;
    const total = this.photos.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const paginatedPhotos = this.photos
      .slice(offset, offset + limit)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
      }));

    return {
      photos: paginatedPhotos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Validate and normalize pagination parameters
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Validated pagination params
   */
  static validatePaginationParams(
    page?: string | number,
    limit?: string | number
  ): PaginationParams {
    let parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    let parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    // Apply defaults if invalid
    if (!parsedPage || isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = DEFAULT_PAGE;
    }

    if (!parsedLimit || isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = DEFAULT_LIMIT;
    }

    // Cap limit to max
    if (parsedLimit > MAX_LIMIT) {
      parsedLimit = MAX_LIMIT;
    }

    return { page: parsedPage, limit: parsedLimit };
  }
}

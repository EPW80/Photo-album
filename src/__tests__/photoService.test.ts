import {
  PhotoService,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../services/photoService';
import { AppError } from '../middleware/errorHandler';

describe('PhotoService', () => {
  let service: PhotoService;

  beforeEach(() => {
    service = new PhotoService();
  });

  describe('getAllPhotos', () => {
    it('should return an array of all photos', () => {
      const photos = service.getAllPhotos();

      expect(Array.isArray(photos)).toBe(true);
      expect(photos.length).toBe(18);
    });

    it('should return photos with id and url properties', () => {
      const photos = service.getAllPhotos();

      photos.forEach((photo) => {
        expect(photo).toHaveProperty('id');
        expect(photo).toHaveProperty('url');
        expect(typeof photo.id).toBe('number');
        expect(typeof photo.url).toBe('string');
      });
    });

    it('should return photos with sequential ids starting from 1', () => {
      const photos = service.getAllPhotos();

      expect(photos[0].id).toBe(1);
      expect(photos[1].id).toBe(2);
      expect(photos[photos.length - 1].id).toBe(18);
    });

    it('should return photos with valid image paths', () => {
      const photos = service.getAllPhotos();

      photos.forEach((photo) => {
        expect(photo.url).toMatch(/^\/images\/.*\.(png|gif)$/);
      });
    });
  });

  describe('getPhotoById', () => {
    it('should return a photo when given a valid id', () => {
      const photo = service.getPhotoById(1);

      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('url');
      expect(photo.id).toBe(1);
    });

    it('should return the correct photo for a given id', () => {
      const photo = service.getPhotoById(5);

      expect(photo.id).toBe(5);
      expect(photo.url).toBe('/images/trumpgif.gif');
    });

    it('should throw AppError when photo id does not exist', () => {
      expect(() => {
        service.getPhotoById(999);
      }).toThrow(AppError);

      expect(() => {
        service.getPhotoById(999);
      }).toThrow('Photo not found');
    });

    it('should throw AppError for id 0', () => {
      expect(() => {
        service.getPhotoById(0);
      }).toThrow(AppError);
    });

    it('should throw AppError for negative ids', () => {
      expect(() => {
        service.getPhotoById(-1);
      }).toThrow(AppError);
    });

    it('should return different photos for different ids', () => {
      const photo1 = service.getPhotoById(1);
      const photo2 = service.getPhotoById(2);

      expect(photo1.id).not.toBe(photo2.id);
      expect(photo1.url).not.toBe(photo2.url);
    });
  });

  describe('photoExists', () => {
    it('should return true for existing photo ids', () => {
      expect(service.photoExists(1)).toBe(true);
      expect(service.photoExists(18)).toBe(true);
    });

    it('should return false for non-existing photo ids', () => {
      expect(service.photoExists(0)).toBe(false);
      expect(service.photoExists(999)).toBe(false);
      expect(service.photoExists(-1)).toBe(false);
    });
  });

  describe('getTotalCount', () => {
    it('should return the total number of photos', () => {
      expect(service.getTotalCount()).toBe(18);
    });
  });

  describe('getPhotosPaginated', () => {
    it('should return paginated photos with pagination metadata', () => {
      const result = service.getPhotosPaginated({ page: 1, limit: 6 });

      expect(result).toHaveProperty('photos');
      expect(result).toHaveProperty('pagination');
      expect(result.photos).toHaveLength(6);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(6);
      expect(result.pagination.total).toBe(18);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.hasPrevious).toBe(false);
    });

    it('should return correct photos for page 2', () => {
      const result = service.getPhotosPaginated({ page: 2, limit: 6 });

      expect(result.photos).toHaveLength(6);
      expect(result.photos[0].id).toBe(7);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.hasPrevious).toBe(true);
    });

    it('should return correct photos for last page', () => {
      const result = service.getPhotosPaginated({ page: 3, limit: 6 });

      expect(result.photos).toHaveLength(6);
      expect(result.photos[0].id).toBe(13);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.hasPrevious).toBe(true);
    });

    it('should return empty array for page beyond total pages', () => {
      const result = service.getPhotosPaginated({ page: 10, limit: 6 });

      expect(result.photos).toHaveLength(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should handle limit larger than total photos', () => {
      const result = service.getPhotosPaginated({ page: 1, limit: 50 });

      expect(result.photos).toHaveLength(18);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should calculate totalPages correctly for uneven division', () => {
      const result = service.getPhotosPaginated({ page: 1, limit: 5 });

      expect(result.pagination.totalPages).toBe(4); // 18 / 5 = 3.6 -> 4
    });
  });

  describe('validatePaginationParams', () => {
    it('should use default values for undefined params', () => {
      const result = PhotoService.validatePaginationParams(
        undefined,
        undefined
      );

      expect(result.page).toBe(DEFAULT_PAGE);
      expect(result.limit).toBe(DEFAULT_LIMIT);
    });

    it('should parse string parameters correctly', () => {
      const result = PhotoService.validatePaginationParams('3', '10');

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
    });

    it('should use default for invalid page values', () => {
      expect(PhotoService.validatePaginationParams('0', '10').page).toBe(
        DEFAULT_PAGE
      );
      expect(PhotoService.validatePaginationParams('-1', '10').page).toBe(
        DEFAULT_PAGE
      );
      expect(PhotoService.validatePaginationParams('abc', '10').page).toBe(
        DEFAULT_PAGE
      );
      expect(PhotoService.validatePaginationParams('', '10').page).toBe(
        DEFAULT_PAGE
      );
    });

    it('should use default for invalid limit values', () => {
      expect(PhotoService.validatePaginationParams('1', '0').limit).toBe(
        DEFAULT_LIMIT
      );
      expect(PhotoService.validatePaginationParams('1', '-5').limit).toBe(
        DEFAULT_LIMIT
      );
      expect(PhotoService.validatePaginationParams('1', 'abc').limit).toBe(
        DEFAULT_LIMIT
      );
    });

    it('should cap limit to MAX_LIMIT', () => {
      const result = PhotoService.validatePaginationParams('1', '100');

      expect(result.limit).toBe(MAX_LIMIT);
    });

    it('should accept numeric parameters', () => {
      const result = PhotoService.validatePaginationParams(2, 15);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });
  });
});

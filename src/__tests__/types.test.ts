import {
  isErrorResponse,
  ErrorResponse,
  PhotoResponse,
} from '../types/photo.types';

describe('Type Guards', () => {
  describe('isErrorResponse', () => {
    it('should return true for ErrorResponse', () => {
      const errorResponse: ErrorResponse = {
        error: 'Test error',
        statusCode: 404,
      };

      expect(isErrorResponse(errorResponse)).toBe(true);
    });

    it('should return false for PhotoResponse', () => {
      const photoResponse: PhotoResponse = {
        id: 1,
        url: '/images/test.png',
      };

      expect(isErrorResponse(photoResponse)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isErrorResponse(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isErrorResponse(undefined)).toBe(false);
    });

    it('should return false for objects without error property', () => {
      const obj = { id: 1, name: 'test' };

      expect(isErrorResponse(obj)).toBe(false);
    });
  });
});

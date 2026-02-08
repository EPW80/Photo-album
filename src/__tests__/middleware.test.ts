import { Request, Response, NextFunction } from 'express';
import {
  errorHandler,
  AppError,
  asyncHandler,
} from '../middleware/errorHandler';
import { validatePhotoId, sanitizeInput } from '../middleware/validation';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should handle AppError with proper status code', () => {
    const error = new AppError('Test error', 404);

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Test error',
      statusCode: 404,
    });
  });

  it('should handle unexpected errors with 500 status', () => {
    const error = new Error('Unexpected error');
    process.env.NODE_ENV = 'development';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Unexpected error',
      statusCode: 500,
    });
  });

  it('should not expose error details in production', () => {
    const error = new Error('Unexpected error');
    process.env.NODE_ENV = 'production';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: undefined,
      statusCode: 500,
    });

    process.env.NODE_ENV = 'test'; // Reset
  });

  it('should wrap async functions with asyncHandler', () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const wrappedFn = asyncHandler(asyncFn);

    wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    expect(asyncFn).toHaveBeenCalled();
  });

  it('should catch errors in async functions', async () => {
    const error = new Error('Async error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const wrappedFn = asyncHandler(asyncFn);

    wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    // Wait for the promise to be processed
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validatePhotoId', () => {
    it('should pass for valid positive integer', () => {
      mockReq.params = { id: '5' };

      validatePhotoId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error for missing id', () => {
      mockReq.params = {};

      expect(() => {
        validatePhotoId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should throw error for non-numeric id', () => {
      mockReq.params = { id: 'abc' };

      expect(() => {
        validatePhotoId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should throw error for zero id', () => {
      mockReq.params = { id: '0' };

      expect(() => {
        validatePhotoId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should throw error for negative id', () => {
      mockReq.params = { id: '-1' };

      expect(() => {
        validatePhotoId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should throw error for decimal id', () => {
      mockReq.params = { id: '1.5' };

      expect(() => {
        validatePhotoId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AppError);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags from input', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);

      expect(result).toBe('alert("xss")Hello');
    });

    it('should handle input without HTML tags', () => {
      const input = 'Plain text';
      const result = sanitizeInput(input);

      expect(result).toBe('Plain text');
    });

    it('should remove multiple HTML tags', () => {
      const input = '<div><p>Text</p></div>';
      const result = sanitizeInput(input);

      expect(result).toBe('Text');
    });
  });
});

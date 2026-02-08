// Data Transfer Objects (DTOs) and Types

export interface PhotoDTO {
  id: number;
  url: string;
  title?: string;
  description?: string;
  dateAdded?: string;
}

export interface PhotoResponse {
  id: number;
  url: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface PhotosResponse {
  photos: PhotoResponse[];
  total: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface PaginatedPhotosResponse {
  photos: PhotoResponse[];
  pagination: PaginationMeta;
}

export type ApiResponse<T> = T | ErrorResponse;

export function isErrorResponse(
  response: ApiResponse<unknown>
): response is ErrorResponse {
  return (
    response !== null &&
    response !== undefined &&
    (response as ErrorResponse).error !== undefined
  );
}

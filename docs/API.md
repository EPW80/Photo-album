# Photo Album API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### Get All Photos

Retrieve a list of all available photos.

**Endpoint:** `GET /photos`

**Response:**
```json
[
  {
    "id": 1,
    "url": "/images/maga.png"
  },
  {
    "id": 2,
    "url": "/images/fist.png"
  }
  // ... more photos
]
```

**Status Codes:**
- `200 OK` - Successfully retrieved photos
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl http://localhost:3000/photos
```

---

### Get Photo by ID

Retrieve a single photo by its ID.

**Endpoint:** `GET /photo/:id`

**URL Parameters:**
- `id` (number, required) - The photo ID (must be a positive integer)

**Response (Success):**
```json
{
  "id": 1,
  "url": "/images/maga.png"
}
```

**Response (Error - Photo Not Found):**
```json
{
  "error": "Photo not found",
  "statusCode": 404
}
```

**Response (Error - Invalid ID):**
```json
{
  "error": "Photo ID must be a valid positive integer",
  "statusCode": 400
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved photo
- `400 Bad Request` - Invalid photo ID format
- `404 Not Found` - Photo with specified ID does not exist
- `500 Internal Server Error` - Server error

**Examples:**
```bash
# Get photo with ID 1
curl http://localhost:3000/photo/1

# Invalid ID (returns 400)
curl http://localhost:3000/photo/abc

# Non-existent ID (returns 404)
curl http://localhost:3000/photo/999
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Additional details (development mode only)",
  "statusCode": 400
}
```

### Common Error Codes

- `400 Bad Request` - Invalid input or malformed request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected server error

---

## Data Models

### Photo

```typescript
interface Photo {
  id: number;
  url: string;
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}
```

---

## Input Validation

### Photo ID Validation

The photo ID parameter is validated with the following rules:

- Must be provided
- Must be a number
- Must be a positive integer (> 0)
- Must be an integer (no decimals)

Examples:
- ✅ Valid: `1`, `2`, `18`
- ❌ Invalid: `0`, `-1`, `1.5`, `abc`, `null`

---

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

---

## Authentication

No authentication is currently required for API endpoints.

---

## Versioning

This is version 1.0 of the API. No versioning scheme is currently implemented in the URL structure.

---

## Development

### Local Development

```bash
npm run dev
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm run start:prod
```

---

## Support

For issues or questions, please refer to the project repository.

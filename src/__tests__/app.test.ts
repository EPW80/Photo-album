import request from 'supertest';
import app from '../app';
import { PhotoResponse, ErrorResponse } from '../types/photo.types';

describe('Photo Album API', () => {
  describe('GET /photos', () => {
    it('should return an array of photos', async () => {
      const response = await request(app).get('/photos');
      const body = response.body as PhotoResponse[];

      expect(response.status).toBe(200);
      expect(body).toBeInstanceOf(Array);
      expect(body.length).toBeGreaterThan(0);
    });

    it('should return photos with id and url properties', async () => {
      const response = await request(app).get('/photos');
      const body = response.body as PhotoResponse[];

      expect(response.status).toBe(200);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('url');
      expect(typeof body[0].id).toBe('number');
      expect(typeof body[0].url).toBe('string');
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/photos');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /photo/:id', () => {
    it('should return a single photo when given valid id', async () => {
      const response = await request(app).get('/photo/1');
      const body = response.body as PhotoResponse;

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('url');
      expect(body.id).toBe(1);
    });

    it('should return different photos for different ids', async () => {
      const response1 = await request(app).get('/photo/1');
      const response2 = await request(app).get('/photo/2');
      const body1 = response1.body as PhotoResponse;
      const body2 = response2.body as PhotoResponse;

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(body1.id).not.toBe(body2.id);
    });

    it('should return 404 when photo id does not exist', async () => {
      const response = await request(app).get('/photo/999');
      const body = response.body as ErrorResponse;

      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/not found/i);
    });

    it('should return 400 for invalid photo id format', async () => {
      const response = await request(app).get('/photo/invalid');
      const body = response.body as ErrorResponse;

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/valid positive integer/i);
    });

    it('should return 400 for negative photo id', async () => {
      const response = await request(app).get('/photo/-1');
      const body = response.body as ErrorResponse;

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
    });

    it('should return 400 for zero photo id', async () => {
      const response = await request(app).get('/photo/0');
      const body = response.body as ErrorResponse;

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/photo/1');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Static File Serving', () => {
    it('should serve the main page at root path', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should serve index.html for unknown routes (catch-all)', async () => {
      const response = await request(app).get('/some-unknown-route');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });
});

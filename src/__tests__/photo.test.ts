import { Photo } from '../models/photo';

describe('Photo Model', () => {
  describe('constructor', () => {
    it('should create a photo with id and url', () => {
      const photo = new Photo(1, '/images/test.png');

      expect(photo.id).toBe(1);
      expect(photo.url).toBe('/images/test.png');
    });

    it('should accept different id types', () => {
      const photo1 = new Photo(1, '/images/test1.png');
      const photo2 = new Photo(100, '/images/test2.png');
      const photo3 = new Photo(0, '/images/test3.png');

      expect(photo1.id).toBe(1);
      expect(photo2.id).toBe(100);
      expect(photo3.id).toBe(0);
    });

    it('should accept different url formats', () => {
      const photo1 = new Photo(1, '/images/test.png');
      const photo2 = new Photo(2, '/images/test.gif');
      const photo3 = new Photo(3, '/images/subfolder/test.jpg');

      expect(photo1.url).toBe('/images/test.png');
      expect(photo2.url).toBe('/images/test.gif');
      expect(photo3.url).toBe('/images/subfolder/test.jpg');
    });

    it('should store id and url as public properties', () => {
      const photo = new Photo(42, '/images/answer.png');

      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('url');
    });

    it('should allow modification of id and url', () => {
      const photo = new Photo(1, '/images/old.png');

      photo.id = 2;
      photo.url = '/images/new.png';

      expect(photo.id).toBe(2);
      expect(photo.url).toBe('/images/new.png');
    });
  });

  describe('properties', () => {
    it('should have exactly two properties', () => {
      const photo = new Photo(1, '/images/test.png');
      const keys = Object.keys(photo);

      expect(keys.length).toBe(2);
      expect(keys).toContain('id');
      expect(keys).toContain('url');
    });
  });
});

import { Photo } from '../models/photo';

type PhotoResponse = { id: number; url: string } | { error: string };

export class PhotoController {
  private photos: Photo[] = [
    new Photo(1, '/images/maga.png'),
    new Photo(2, '/images/fist.png'),
    new Photo(3, '/images/calvary.png'),
    new Photo(4, '/images/liberty.png'),
    new Photo(5, '/images/trumpgif.gif'),
    new Photo(6, '/images/cowboy.png'),
    new Photo(7, '/images/sam.gif'),
    new Photo(8, '/images/trumptower.png'),
    new Photo(9, '/images/champ.png'),
    new Photo(10, '/images/getUp.png'),
    new Photo(11, '/images/world.png'),
    new Photo(12, '/images/naut.png'),
    new Photo(13, '/images/globe.png'),
    new Photo(14, '/images/granite.png'),
    new Photo(15, '/images/bluejean.png'),
    new Photo(16, '/images/philly.png'),
    new Photo(17, '/images/moon.png'),
    new Photo(18, '/images/wailing.png'),
  ];

  getPhotos() {
    return this.photos.map((photo) => ({ id: photo.id, url: photo.url }));
  }

  getPhoto(id: number): PhotoResponse {
    const photo = this.photos.find((p) => p.id === id);
    if (photo) {
      return { id: photo.id, url: photo.url };
    } else {
      return { error: 'Photo not found' };
    }
  }
}

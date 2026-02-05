import { PhotoController } from '../controllers/photoController';
import { Application, Request, Response } from 'express';

const photoController = new PhotoController();

export const photoRoutes = (app: Application) => {
  app.get('/photos', (_req: Request, res: Response) => {
    const photos = photoController.getPhotos();
    res.json(photos); // Send JSON response
  });

  app.get('/photo/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const photoResponse = photoController.getPhoto(id);
    if ('error' in photoResponse) {
      res.status(404).json(photoResponse);
    } else {
      res.json(photoResponse); // Send JSON response
    }
  });
};

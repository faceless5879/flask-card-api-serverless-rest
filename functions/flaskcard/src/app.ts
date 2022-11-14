import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import timeout from 'connect-timeout';
import { CardRoutes } from '@routes';

export function configureApp(): Express {
  const app = express();

  const cardRoutes = new CardRoutes();

  /** Parse the request */
  app.use(cors());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(timeout('10m'));

  /** Rules of the API */
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.timedout) next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    //NOTHING NOW
    next();
  });
  app.use(`/`, async (req: Request, res: Response): Promise<void> => {
    res.status(200).send({ message: 'Hello World' });
  });
  app.use(`/card`, cardRoutes.router);

  /** Not Found Handling */
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404);
    const error = new Error('not found');
    next(error);
  });

  /** Errors Handling */
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(res.statusCode || 500);
    res.json({
      message: error.message,
    });
  });
  return app;
}

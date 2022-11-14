import express, { Router } from 'express';
import { CardController } from '@controllers';

export class CardRoutes {
  readonly router: Router;

  constructor() {
    this.router = express.Router();
    this.init();
  }

  private init() {
    const card_ctrl = new CardController();
    this.router.get('/', card_ctrl.getCardsLimited);
  }
}

import { Request, Response } from 'express';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as conf from '@config/Constants';

export class CardController {
  axiosInstance: AxiosInstance;
  constructor() {
    this.init();
  }

  init = (): void => {
    this.axiosInstance = axios.create();
    this.axiosInstance.defaults.timeout = 36000000;
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const config = error.config;
        // Retry when status = 429 with 100ms delay
        if (config && error.response.status === 429) {
          return new Promise((resolve) => {
            setTimeout(() => resolve(this.axiosInstance(config)), 100);
          });
        }
        return Promise.reject(error);
      },
    );
  };

  getCardsLimited = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ message: 'Hello world' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: conf.ERROR_MSGS.INTERNAL_SERVER_ERROR });
    }
  };
}

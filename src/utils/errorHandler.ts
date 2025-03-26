import { Response } from 'express';

export class ErrorHandler {
  static handleError(res: Response, error: unknown) {
    console.error('Error:', error);

    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'An error occurred', 
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        message: 'An unknown error occurred' 
      });
    }
  }
}
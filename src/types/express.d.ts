// src/types/express.d.ts (or your preferred directory)
import { IUser } from '../models/user.model'; // Adjust the path according to your project structure

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

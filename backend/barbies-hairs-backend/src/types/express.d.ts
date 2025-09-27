import { IUser } from '../models/userModle.js';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<IUser, 'name' | 'email' | '_id' | 'roles'>;
      session?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: Pick<IUser, 'name' | 'email' | '_id' | 'roles'>;
}

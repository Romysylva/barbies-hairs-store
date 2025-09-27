import { IUser } from '../../models/userModle.js';
//         👆 fix spelling of "Modle" → "Model"

interface IUserLite {
  _id: string;
  roles: string[];
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      // user?: IUserLite;
      user?: Pick<IUser, '_id' | 'roles' | 'email' | 'name'>;
    }
  }
}

export {};

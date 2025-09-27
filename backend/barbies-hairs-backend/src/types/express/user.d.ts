export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  roles: 'user' | 'admin' | 'mananger';
  createdAt?: Date;
  updatedAt?: Date;
}

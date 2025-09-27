import { IProduct } from './product';

export interface IOrderItem {
  product: IProduct | string;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id?: string;
  user: string;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

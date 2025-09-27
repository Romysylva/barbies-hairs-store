export interface IReview {
  _id?: string;
  user: string;
  product: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

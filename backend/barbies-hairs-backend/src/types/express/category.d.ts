export interface ICategory {
  _id?: string;
  name: string;
  parent?: string | null; // null for root categories
  children?: ICategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

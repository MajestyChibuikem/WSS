export const enum SortOrder {
  ASC = "ASCENDING ORDER",
  DSC = "DESCENDING ORDER",
}

export const enum Actions {
  DELETE = "Delete",
  UPDATE = "Update",
  CREATE = "Create",
}

export enum Roles {
  ADMIN = "admin",
  SUPER_USER = "super_user",
  STAFF = "staff",
}

export interface User {
  id: number;
  username: string;
  created_at: string;
  is_admin: boolean;
  roles: string[];
}

export interface DropdownItem<T> {
  icon: React.JSX.Element | null;
  content: string;
  value: T;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  abv: number; // Alcohol by Volume %
  price: number; // Price in Naira
  category: string;
  bottle_size: number; // in ml
  in_stock: number; // Number of bottles available
  image_url?: string | null; // URL for product image
}

export const enum ProductCategoryEnum {
  RED = "Red",
  WHITE = "White",
  ROSE = "Rosé",
  SPARKLING = "Sparkling",
  DESSERT = "Dessert",
  FORTIFIED = "Fortified",
}

export type ProductCategory =
  | "Red"
  | "White"
  | "Rosé"
  | "Sparkling"
  | "Dessert"
  | "Fortified";

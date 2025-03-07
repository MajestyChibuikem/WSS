export const enum SortOrder {
  ASC = 0,
  DSC = 1,
}

export const enum Actions {
  DELETE = 0,
  UPDATE = 1,
  CREATE = 2,
}

export const enum Roles {
  ADMIN = "ADMIN",
  SUPERUSER = "SUPERUSER",
  STAFF = "STAFF",
}

export interface User {
  firstname: string;
  lastname: string;
  role: Roles;
}

export interface DropdownItem<T> {
  icon: React.JSX.Element | null;
  content: string;
  value: T;
}

export interface Wine {
  id: number;
  name: string;
  abv: number; // Alcohol by Volume %
  price: number; // Price in Naira
  category: WineCategory;
  bottleSize: number; // in ml
  inStock: number; // Number of bottles available
}

export type WineCategory =
  | "Red"
  | "White"
  | "Rosé"
  | "Sparkling"
  | "Dessert"
  | "Fortified";

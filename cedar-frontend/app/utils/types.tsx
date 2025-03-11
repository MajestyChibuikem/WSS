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
  ADMIN = "admin",
  SUPERUSER = "superuser",
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

export interface Wine {
  id: number;
  name: string;
  abv: number; // Alcohol by Volume %
  price: number; // Price in Naira
  category: WineCategory;
  bottle_size: number; // in ml
  inStock: number; // Number of bottles available
}

export const enum WineCategoryEnum {
  RED = "Red",
  WHITE = "White",
  ROSE = "Rosé",
  SPARKLING = "Sparkling",
  DESSERT = "Dessert",
  FORTIFIED = "Fortified",
}

export type WineCategory =
  | "Red"
  | "White"
  | "Rosé"
  | "Sparkling"
  | "Dessert"
  | "Fortified";

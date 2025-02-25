export type WineCategory =
  | "Red"
  | "White"
  | "Rosé"
  | "Sparkling"
  | "Dessert"
  | "Fortified";

export const wineCategories = [
  "Red",
  "White",
  "Rosé",
  "Sparkling",
  "Dessert",
  "Fortified",
];

export const actions = [
  "ADD WINE",
  "DELETE WINE",
  "UPDATE WINE",
  "CREATE USER",
  "DELETE USER",
  "UPDATE USER",
];

export interface Wine {
  id: number;
  name: string;
  abv: number; // Alcohol by Volume %
  price: number; // Price in Naira
  category: WineCategory;
  bottleSize: number; // in ml
  inStock: number; // Number of bottles available
}

export const wineInventory: Wine[] = [
  {
    id: 100001,
    name: "Château Margaux",
    abv: 13.5,
    price: 75000,
    category: "Red",
    bottleSize: 750,
    inStock: 20,
  },
  {
    id: 100002,
    name: "Cloudy Bay Sauvignon Blanc",
    abv: 12.5,
    price: 30000,
    category: "White",
    bottleSize: 750,
    inStock: 35,
  },
  {
    id: 100003,
    name: "Moët & Chandon Brut",
    abv: 12.0,
    price: 95000,
    category: "Sparkling",
    bottleSize: 750,
    inStock: 15,
  },
  {
    id: 100004,
    name: "Graham’s 20 Year Old Tawny",
    abv: 20.0,
    price: 65000,
    category: "Fortified",
    bottleSize: 750,
    inStock: 10,
  },
  {
    id: 100005,
    name: "Whispering Angel Rosé",
    abv: 13.0,
    price: 40000,
    category: "Rosé",
    bottleSize: 750,
    inStock: 25,
  },
  {
    id: 100006,
    name: "Tokaji Aszú 5 Puttonyos",
    abv: 11.5,
    price: 55000,
    category: "Dessert",
    bottleSize: 500,
    inStock: 12,
  },
];

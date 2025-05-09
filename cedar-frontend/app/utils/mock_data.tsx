import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import {
  Actions,
  DropdownItem,
  Roles,
  SortOrder,
  User,
  Product,
  ProductCategory,
  ProductCategoryEnum,
} from "./types";

export const productCategories = [
  { content: "Red" },
  { content: "White" },
  { content: "Rosé" },
  { content: "Sparkling" },
  { content: "Dessert" },
  { content: "Fortified" },
];

export const actions = [
  "ADD PRODUCT",
  "DELETE PRODUCT",
  "UPDATE PRODUCT",
  "CREATE USER",
  "DELETE USER",
  "UPDATE USER",
];

export const dropdownItems: DropdownItem<SortOrder>[] = [
  {
    icon: <ArrowUpAZ className="h-4" />,
    content: "Ascending order",
    value: SortOrder.ASC,
    active: true,
  },
  {
    icon: <ArrowDownAZ className="h-4" />,
    content: "Descending order",
    value: SortOrder.DSC,
    active: false,
  },
];

export const usersDropdownItems: DropdownItem<Roles>[] = [
  {
    icon: null,
    content: "ADMIN",
    value: Roles.ADMIN,
    active: true,
  },
  {
    icon: null,
    content: "SUPER USER",
    value: Roles.SUPER_USER,
    active: false,
  },
  {
    icon: null,
    content: "STAFF",
    value: Roles.STAFF,
    active: false,
  },
];

export const actionDropdownItems: DropdownItem<Actions>[] = [
  {
    icon: null,
    content: "UPDATE",
    value: Actions.UPDATE,
    active: false,
  },
  {
    icon: null,
    content: "DELETE",
    value: Actions.DELETE,
    active: false,
  },
];

export const categoryDropdownItems: DropdownItem<ProductCategoryEnum>[] = [
  {
    icon: null,
    content: ProductCategoryEnum.WHITE,
    value: ProductCategoryEnum.WHITE,
    active: false,
  },
  {
    icon: null,
    content: ProductCategoryEnum.RED,
    value: ProductCategoryEnum.RED,
    active: false,
  },
  {
    icon: null,
    content: ProductCategoryEnum.ROSE,
    value: ProductCategoryEnum.ROSE,
    active: false,
  },
  {
    icon: null,
    content: ProductCategoryEnum.SPARKLING,
    value: ProductCategoryEnum.SPARKLING,
    active: false,
  },
  {
    icon: null,
    content: ProductCategoryEnum.DESSERT,
    value: ProductCategoryEnum.DESSERT,
    active: false,
  },
  {
    icon: null,
    content: ProductCategoryEnum.FORTIFIED,
    value: ProductCategoryEnum.FORTIFIED,
    active: false,
  },
];

export const wineInventory: Product[] = [
  {
    id: 100001,
    name: "Château Margaux",
    abv: 13.5,
    price: 75000,
    category: "Red",
    bottle_size: 750,
    in_stock: 20,
  },
  {
    id: 100002,
    name: "Cloudy Bay Sauvignon Blanc",
    abv: 12.5,
    price: 30000,
    category: "White",
    bottle_size: 750,
    in_stock: 35,
  },
  {
    id: 100003,
    name: "Moët & Chandon Brut",
    abv: 12.0,
    price: 95000,
    category: "Sparkling",
    bottle_size: 750,
    in_stock: 15,
  },
  {
    id: 100004,
    name: "Graham’s 20 Year Old Tawny",
    abv: 20.0,
    price: 65000,
    category: "Fortified",
    bottle_size: 750,
    in_stock: 10,
  },
  {
    id: 100005,
    name: "Whispering Angel Rosé",
    abv: 13.0,
    price: 40000,
    category: "Rosé",
    bottle_size: 750,
    in_stock: 25,
  },
  {
    id: 100006,
    name: "Tokaji Aszú 5 Puttonyos",
    abv: 11.5,
    price: 55000,
    category: "Dessert",
    bottle_size: 500,
    in_stock: 12,
  },
];

// export const mockUsers: User[] = [
//   {
//     firstname: "Alice",
//     lastname: "Johnson",
//     role: Roles.ADMIN,
//   },
//   {
//     firstname: "Bob",
//     lastname: "Smith",
//     role: Roles.SUPER_USER,
//   },
//   {
//     firstname: "Charlie",
//     lastname: "Brown",
//     role: Roles.STAFF,
//   },
//   {
//     firstname: "Diana",
//     lastname: "Williams",
//     role: Roles.STAFF,
//   },
//   {
//     firstname: "Ethan",
//     lastname: "Harris",
//     role: Roles.ADMIN,
//   },
// ];

export { SortOrder };

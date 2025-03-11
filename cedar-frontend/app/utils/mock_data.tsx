import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import {
  Actions,
  DropdownItem,
  Roles,
  SortOrder,
  User,
  Wine,
  WineCategory,
  WineCategoryEnum,
} from "./types";
import { setCurrentlyEditing } from "../store/slices/wineSlice";

export const wineCategories = [
  { content: "Red", stock_count: 1073 },
  { content: "White", stock_count: 103 },
  { content: "Rosé", stock_count: 1056 },
  { content: "Sparkling", stock_count: 1273 },
  { content: "Dessert", stock_count: 73 },
  { content: "Fortified", stock_count: 113 },
];

export const actions = [
  "ADD WINE",
  "DELETE WINE",
  "UPDATE WINE",
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
    value: Roles.SUPERUSER,
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

export const categoryDropdownItems: DropdownItem<WineCategoryEnum>[] = [
  {
    icon: null,
    content: WineCategoryEnum.WHITE,
    value: WineCategoryEnum.WHITE,
    active: false,
  },
  {
    icon: null,
    content: WineCategoryEnum.RED,
    value: WineCategoryEnum.RED,
    active: false,
  },
  {
    icon: null,
    content: WineCategoryEnum.ROSE,
    value: WineCategoryEnum.ROSE,
    active: false,
  },
  {
    icon: null,
    content: WineCategoryEnum.SPARKLING,
    value: WineCategoryEnum.SPARKLING,
    active: false,
  },
  {
    icon: null,
    content: WineCategoryEnum.DESSERT,
    value: WineCategoryEnum.DESSERT,
    active: false,
  },
  {
    icon: null,
    content: WineCategoryEnum.FORTIFIED,
    value: WineCategoryEnum.FORTIFIED,
    active: false,
  },
];

export const wineInventory: Wine[] = [
  {
    id: 100001,
    name: "Château Margaux",
    abv: 13.5,
    price: 75000,
    category: "Red",
    bottle_size: 750,
    inStock: 20,
  },
  {
    id: 100002,
    name: "Cloudy Bay Sauvignon Blanc",
    abv: 12.5,
    price: 30000,
    category: "White",
    bottle_size: 750,
    inStock: 35,
  },
  {
    id: 100003,
    name: "Moët & Chandon Brut",
    abv: 12.0,
    price: 95000,
    category: "Sparkling",
    bottle_size: 750,
    inStock: 15,
  },
  {
    id: 100004,
    name: "Graham’s 20 Year Old Tawny",
    abv: 20.0,
    price: 65000,
    category: "Fortified",
    bottle_size: 750,
    inStock: 10,
  },
  {
    id: 100005,
    name: "Whispering Angel Rosé",
    abv: 13.0,
    price: 40000,
    category: "Rosé",
    bottle_size: 750,
    inStock: 25,
  },
  {
    id: 100006,
    name: "Tokaji Aszú 5 Puttonyos",
    abv: 11.5,
    price: 55000,
    category: "Dessert",
    bottle_size: 500,
    inStock: 12,
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
//     role: Roles.SUPERUSER,
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

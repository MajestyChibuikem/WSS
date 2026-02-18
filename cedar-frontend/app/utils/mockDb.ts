import { wineInventory } from "./mock_data";
import type { Product, User } from "./types";

type Category = { id: number; name: string; description: string };

export type ActivityLog = {
  id: number;
  acting_username: string;
  action: string;
  timestamp: string;
  message: string;
  affected_name: string;
  user_id?: number | null;
  user_agent?: string | null;
};

type InvoiceItem = {
  product_id: number;
  wine_name: string;
  quantity: number;
  price: string;
};

export type Invoice = {
  id: number;
  created_at: string;
  total_amount: string;
  user_id: number;
  items: InvoiceItem[];
};

type UserRecord = User & { password: string };

type DbState = {
  nextIds: {
    user: number;
    product: number;
    category: number;
    activity: number;
    invoice: number;
  };
  users: UserRecord[];
  products: Product[];
  categories: Category[];
  activities: ActivityLog[];
  invoices: Invoice[];
};

const STORAGE_KEY = "wineryMockDb";

function nowIso() {
  return new Date().toISOString();
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function defaultDb(): DbState {
  const categories: Category[] = [
    { id: 1, name: "Red", description: "" },
    { id: 2, name: "White", description: "" },
    { id: 3, name: "Rosé", description: "" },
    { id: 4, name: "Sparkling", description: "" },
    { id: 5, name: "Dessert", description: "" },
    { id: 6, name: "Fortified", description: "" },
  ];

  const users: UserRecord[] = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      created_at: nowIso(),
      is_admin: true,
      roles: ["admin"],
    },
    {
      id: 2,
      username: "staff",
      password: "staff123",
      created_at: nowIso(),
      is_admin: false,
      roles: ["staff"],
    },
    {
      id: 3,
      username: "super",
      password: "super123",
      created_at: nowIso(),
      is_admin: false,
      roles: ["super_user"],
    },
  ];

  const products: Product[] = wineInventory.map((p) => ({ ...p }));

  const activities: ActivityLog[] = [
    {
      id: 1,
      acting_username: "admin",
      action: "CREATE_USER_SUCCESS",
      timestamp: nowIso(),
      message: "Seeded initial users",
      affected_name: "admin",
      user_id: 1,
    },
    {
      id: 2,
      acting_username: "admin",
      action: "ADD_PRODUCT",
      timestamp: nowIso(),
      message: "Seeded initial products",
      affected_name: "Initial Inventory",
      user_id: 1,
    },
  ];

  // Seed a couple invoices to make dashboard/sales meaningful.
  const invoices: Invoice[] = [
    {
      id: 1,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: "125000",
      user_id: 2,
      items: [
        {
          product_id: products[0]?.id ?? 100001,
          wine_name: products[0]?.name ?? "Château Margaux",
          quantity: 1,
          price: String(products[0]?.price ?? 75000),
        },
        {
          product_id: products[1]?.id ?? 100002,
          wine_name: products[1]?.name ?? "Cloudy Bay Sauvignon Blanc",
          quantity: 1,
          price: String(products[1]?.price ?? 50000),
        },
      ],
    },
    {
      id: 2,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: "95000",
      user_id: 1,
      items: [
        {
          product_id: products[2]?.id ?? 100003,
          wine_name: products[2]?.name ?? "Moët & Chandon Brut",
          quantity: 1,
          price: String(products[2]?.price ?? 95000),
        },
      ],
    },
  ];

  return {
    nextIds: {
      user: 4,
      product: Math.max(...products.map((p) => p.id), 100006) + 1,
      category: 7,
      activity: 3,
      invoice: 3,
    },
    users,
    products,
    categories,
    activities,
    invoices,
  };
}

export function loadDb(): DbState {
  if (typeof window === "undefined") return defaultDb();
  const parsed = safeParseJson<DbState>(localStorage.getItem(STORAGE_KEY));
  if (!parsed) {
    const seeded = defaultDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return parsed;
}

export function saveDb(state: DbState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function withDb<T>(fn: (db: DbState) => T): T {
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}

export function resolveCategoryName(categoryId: number): string {
  const db = loadDb();
  return db.categories.find((c) => c.id === categoryId)?.name ?? "Unknown";
}


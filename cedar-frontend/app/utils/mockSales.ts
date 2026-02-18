import { loadDb } from "./mockDb";

type MockSalesLog = {
  id: number;
  acting_username: string;
  action: string;
  invoice: {
    id: number;
    date: string;
    total_amount: string;
    items: Array<{
      price: string;
      quantity: number;
      product_id: number;
      product_name: string;
    }>;
  };
  timestamp: string;
  message: string;
  ip_address: string;
};

export function getMockSalesPage(params: {
  userId?: number;
  page: number;
  perPage: number;
}): {
  logs: MockSalesLog[];
  total: number;
  pages: number;
  current_page: number;
} {
  const { userId, page, perPage } = params;
  const db = loadDb();

  const byId = new Map(db.users.map((u) => [u.id, u.username]));
  const invoices = db.invoices
    .filter((i) => (userId ? i.user_id === userId : true))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = invoices.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * perPage;
  const slice = invoices.slice(start, start + perPage);

  const logs: MockSalesLog[] = slice.map((inv) => ({
    id: inv.id,
    acting_username: byId.get(inv.user_id) ?? "N/A",
    action: "SALE",
    invoice: {
      id: inv.id,
      date: inv.created_at,
      total_amount: inv.total_amount,
      items: inv.items.map((it) => ({
        price: String(it.price),
        quantity: it.quantity,
        product_id: it.product_id,
        product_name: it.wine_name,
      })),
    },
    timestamp: inv.created_at,
    message: "Checkout complete",
    ip_address: "127.0.0.1",
  }));

  return { logs, total, pages, current_page: safePage };
}


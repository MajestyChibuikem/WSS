import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { withDb, resolveCategoryName } from "@/app/utils/mockDb";

type Arg = string | FetchArgs;

function normalizeUrl(rawUrl: string): URL {
  // Accept both "/path" and "path" and "http://.../path?x=1"
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return new URL(rawUrl);
  }
  const url = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return new URL(url, "http://mock.local");
}

function getActingUser() {
  const acting_username = localStorage.getItem("wineryUsername") ?? "admin";
  const user_id = Number(localStorage.getItem("wineryUserId") ?? "1");
  return { acting_username, user_id };
}

function requireAuth(): { ok: true } | { ok: false; error: FetchBaseQueryError } {
  const token = localStorage.getItem("wineryAuthToken");
  if (!token) {
    return { ok: false, error: { status: 401, data: { message: "Unauthorized" } } };
  }
  return { ok: true };
}

export const mockBaseQuery: BaseQueryFn<Arg, unknown, FetchBaseQueryError> = async (
  args
) => {
  const rawUrl = typeof args === "string" ? args : args.url;
  const method = (typeof args === "string" ? "GET" : args.method ?? "GET").toUpperCase();
  const body = typeof args === "string" ? undefined : (args.body as any);

  const url = normalizeUrl(rawUrl);
  const path = url.pathname.replace(/\/+$/, "");

  try {
    // ---- AUTH ----
    if (path === "/auth/login" && method === "POST") {
      const { username, password } = body ?? {};
      const found = withDb((db) =>
        db.users.find(
          (u) =>
            u.username.toLowerCase() === String(username ?? "").toLowerCase() &&
            u.password === String(password ?? "")
        )
      );

      if (!found) {
        return { error: { status: 401, data: { message: "Invalid credentials" } } };
      }

      const token = `mock-token-${found.id}`;
      localStorage.setItem("wineryUsername", found.username);
      return {
        data: {
          token,
          roles: found.roles,
          is_admin: found.roles.includes("admin"),
          user_id: found.id,
        },
      };
    }

    if (path === "/auth/logout" && method === "POST") {
      return { data: { message: "Logged out" } };
    }

    if (path === "/auth/check-token" && method === "GET") {
      const token = localStorage.getItem("wineryAuthToken");
      if (!token?.startsWith("mock-token-")) {
        return { error: { status: 401, data: { message: "Invalid token" } } };
      }
      return { data: { message: "Token is valid", expires_at: null } };
    }

    if (path === "/auth/users" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const users = withDb((db) =>
        db.users.map(({ password: _pw, ...u }) => u)
      );
      return { data: { users } };
    }

    if (path.startsWith("/auth/user/") && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const id = Number(path.split("/").pop());
      const user = withDb((db) => db.users.find((u) => u.id === id));
      if (!user) return { error: { status: 404, data: { message: "Not found" } } };
      const { password: _pw, ...safeUser } = user;
      return { data: { user: safeUser } };
    }

    if (path === "/auth/create_user" && method === "POST") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const { username, password, roles } = body ?? {};
      const normalizedUsername = String(username ?? "").trim();
      if (!normalizedUsername || !String(password ?? "")) {
        return { error: { status: 400, data: { message: "Missing fields" } } };
      }

      const created = withDb((db) => {
        const exists = db.users.some(
          (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
        );
        if (exists) return { ok: false as const };

        const roleArr: string[] = Array.isArray(roles)
          ? roles.map((r: any) => String(r).toLowerCase())
          : ["staff"];

        const id = db.nextIds.user++;
        const record = {
          id,
          username: normalizedUsername,
          password: String(password),
          created_at: new Date().toISOString(),
          is_admin: roleArr.includes("admin"),
          roles: roleArr.length ? roleArr : ["staff"],
        };
        db.users.push(record);

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "CREATE_USER_SUCCESS",
          timestamp: new Date().toISOString(),
          message: `Created user ${normalizedUsername}`,
          affected_name: normalizedUsername,
          user_id,
        });

        return { ok: true as const, id, roles: record.roles };
      });

      if (!created.ok) {
        return { error: { status: 409, data: { message: "User already exists" } } };
      }
      return { data: { message: "User created", user_id: created.id, roles: created.roles } };
    }

    if (path.startsWith("/auth/users/") && method === "PUT") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const id = Number(path.split("/").pop());
      const updated = withDb((db) => {
        const user = db.users.find((u) => u.id === id);
        if (!user) return { ok: false as const };
        if (body?.username) user.username = String(body.username);
        if (body?.password) user.password = String(body.password);
        if (body?.roles) {
          const roleArr: string[] = Array.isArray(body.roles)
            ? body.roles.map((r: any) => String(r).toLowerCase())
            : String(body.roles)
                .split(",")
                .map((r: string) => r.trim().toLowerCase())
                .filter(Boolean);
          user.roles = roleArr.length ? roleArr : user.roles;
          user.is_admin = user.roles.includes("admin");
        }

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "UPDATE_USER_SUCCESS",
          timestamp: new Date().toISOString(),
          message: `Updated user ${user.username}`,
          affected_name: user.username,
          user_id,
        });

        const { password: _pw, ...safeUser } = user;
        return { ok: true as const, safeUser };
      });
      if (!updated.ok) return { error: { status: 404, data: { message: "Not found" } } };
      return { data: { message: "User updated", user: updated.safeUser } };
    }

    if (path.startsWith("/auth/user/") && method === "DELETE") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const id = Number(path.split("/").pop());
      const deleted = withDb((db) => {
        const idx = db.users.findIndex((u) => u.id === id);
        if (idx === -1) return { ok: false as const };
        const removed = db.users.splice(idx, 1)[0];

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "DELETE_USER_SUCCESS",
          timestamp: new Date().toISOString(),
          message: `Deleted user ${removed.username}`,
          affected_name: removed.username,
          user_id,
        });
        return { ok: true as const };
      });
      if (!deleted.ok) return { error: { status: 404, data: { message: "Not found" } } };
      return { data: { message: "User deleted" } };
    }

    // ---- CATEGORIES ----
    if (path === "/categories/get" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const categories = withDb((db) => db.categories.map(({ id, name }) => ({ id, name })));
      return { data: categories };
    }

    if (path === "/categories/create" && method === "POST") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const name = String(body?.name ?? "").trim();
      const description = String(body?.description ?? "");
      if (!name) return { error: { status: 400, data: { message: "Missing name" } } };

      const result = withDb((db) => {
        const exists = db.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
        if (exists) return { ok: false as const };
        const id = db.nextIds.category++;
        db.categories.push({ id, name, description });

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "UPDATE_PRODUCT_SUCCESS",
          timestamp: new Date().toISOString(),
          message: `Created category ${name}`,
          affected_name: name,
          user_id,
        });

        return { ok: true as const, category: { id, name, description } };
      });

      if (!result.ok) {
        return { error: { status: 409, data: { message: "Category already exists" } } };
      }
      return { data: { message: "Category created", category: result.category } };
    }

    if (path.startsWith("/categories/delete/") && method === "DELETE") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const categoryId = Number(path.split("/").pop());
      withDb((db) => {
        db.categories = db.categories.filter((c) => c.id !== categoryId);
      });
      return { data: { message: "Category deleted" } };
    }

    // ---- PRODUCTS ----
    if (path === "/products/all" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const products = withDb((db) => db.products);
      return { data: { products } };
    }

    if (path === "/products/add" && method === "POST") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const name = String(body?.name ?? "").trim();
      if (!name) return { error: { status: 400, data: { message: "Missing name" } } };
      const categoryName = resolveCategoryName(Number(body?.category_id ?? 0));

      const created = withDb((db) => {
        const id = db.nextIds.product++;
        const product = {
          id,
          name,
          abv: Number(body?.abv ?? 0),
          price: Number(body?.price ?? 0),
          category: categoryName,
          bottle_size: Number(body?.bottle_size ?? 0),
          in_stock: Number(body?.in_stock ?? 0),
          image_url: null,
        };
        db.products.unshift(product);

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "ADD_PRODUCT",
          timestamp: new Date().toISOString(),
          message: `Added product ${name}`,
          affected_name: name,
          user_id,
        });
        return product;
      });

      return { data: { message: "Product added", product: created } };
    }

    if (path.startsWith("/products/") && method === "PUT") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const productId = Number(path.split("/").pop());
      const updated = withDb((db) => {
        const p = db.products.find((x) => x.id === productId);
        if (!p) return null;
        if (body?.name !== undefined) p.name = String(body.name);
        if (body?.price !== undefined) p.price = Number(body.price);
        if (body?.in_stock !== undefined) p.in_stock = Number(body.in_stock);
        if (body?.bottle_size !== undefined) p.bottle_size = Number(body.bottle_size);
        if (body?.category_id !== undefined) {
          p.category = resolveCategoryName(Number(body.category_id));
        }

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "UPDATE_PRODUCT_SUCCESS",
          timestamp: new Date().toISOString(),
          message: `Updated product ${p.name}`,
          affected_name: p.name,
          user_id,
        });

        return p;
      });

      if (!updated) return { error: { status: 404, data: { message: "Not found" } } };
      return { data: { message: "Product updated", product: updated } };
    }

    if (path.startsWith("/products/") && method === "DELETE") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const productId = Number(path.split("/").pop());
      const removed = withDb((db) => {
        const idx = db.products.findIndex((p) => p.id === productId);
        if (idx === -1) return null;
        const [p] = db.products.splice(idx, 1);

        const { acting_username, user_id } = getActingUser();
        db.activities.push({
          id: db.nextIds.activity++,
          acting_username,
          action: "DELETE_PRODUCT_SUCCESS",
          timestamp: new Date().toISOString(),
          message: `Deleted product ${p.name}`,
          affected_name: p.name,
          user_id,
        });
        return p;
      });
      if (!removed) return { error: { status: 404, data: { message: "Not found" } } };
      return { data: { message: "Product deleted" } };
    }

    // ---- DASHBOARD/STATS ----
    if (path === "/products/total_stock" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const total_stock = withDb((db) =>
        db.products.reduce((sum, p) => sum + Number(p.in_stock ?? 0), 0)
      );
      return { data: { total_stock } };
    }

    if (path === "/products/stock-by-category" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const stock_by_category = withDb((db) => {
        return db.products.reduce<Record<string, number>>((acc, p) => {
          const key = p.category ?? "Unknown";
          acc[key] = (acc[key] ?? 0) + Number(p.in_stock ?? 0);
          return acc;
        }, {});
      });
      return { data: { stock_by_category } };
    }

    if (path === "/products/inventory-value" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const inventory_value = withDb((db) => {
        const byCat = db.products.reduce<Record<string, number>>((acc, p) => {
          const key = p.category ?? "Unknown";
          acc[key] = (acc[key] ?? 0) + Number(p.price ?? 0) * Number(p.in_stock ?? 0);
          return acc;
        }, {});
        return Object.entries(byCat).map(([category, total_value]) => ({
          category,
          total_value,
        }));
      });
      return { data: { inventory_value } };
    }

    if (path === "/products/compare-sales" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const { previous, current } = withDb((db) => {
        const now = new Date();
        const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
        const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endPrev = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const sum = (from: Date, to: Date) =>
          db.invoices
            .filter((i) => {
              const t = new Date(i.created_at).getTime();
              return t >= from.getTime() && t <= to.getTime();
            })
            .reduce((s, i) => s + Number(i.total_amount ?? 0), 0);

        return {
          previous: sum(startPrev, endPrev),
          current: sum(startCurrent, now),
        };
      });

      const growth_factor = previous === 0 ? (current > 0 ? 1 : 0) : current / previous;
      const percentage_change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

      const now = new Date();
      const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endPrev = new Date(now.getFullYear(), now.getMonth(), 0);

      return {
        data: {
          growth_factor,
          percentage_change: Math.round(percentage_change * 100) / 100,
          previous_month_sales: previous,
          current_month_sales: current,
          previous_month_date_range: {
            start: startPrev.toISOString().slice(0, 10),
            end: endPrev.toISOString().slice(0, 10),
          },
        },
      };
    }

    if (path === "/products/revenue" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const start = url.searchParams.get("start_date");
      const end = url.searchParams.get("end_date");
      const startDate = start ? new Date(start) : new Date("1970-01-01");
      const endDate = end ? new Date(end) : new Date("2100-01-01");
      const revenue = withDb((db) =>
        db.invoices
          .filter((i) => {
            const t = new Date(i.created_at).getTime();
            return t >= startDate.getTime() && t <= endDate.getTime();
          })
          .reduce((s, i) => s + Number(i.total_amount ?? 0), 0)
      );
      return { data: { revenue } };
    }

    if (path === "/products/top_selling" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const list = withDb((db) => {
        const stats = new Map<
          number,
          { name: string; total_revenue: number; total_sold: number }
        >();
        for (const inv of db.invoices) {
          for (const it of inv.items) {
            const curr = stats.get(it.product_id) ?? {
              name: it.wine_name,
              total_revenue: 0,
              total_sold: 0,
            };
            curr.total_sold += Number(it.quantity ?? 0);
            curr.total_revenue += Number(it.price ?? 0) * Number(it.quantity ?? 0);
            stats.set(it.product_id, curr);
          }
        }
        return Array.from(stats.values())
          .sort((a, b) => b.total_revenue - a.total_revenue)
          .slice(0, 5)
          .map((x) => ({
            ...x,
            percentage_change: 12.5,
          }));
      });
      return { data: list };
    }

    // ---- LOGS ----
    if (path === "/logs/logs" && method === "GET") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const logs = withDb((db) => db.activities);
      return { data: logs };
    }

    // ---- CHECKOUT ----
    if (path === "/invoices/checkout" && method === "POST") {
      const auth = requireAuth();
      if (!auth.ok) return { error: auth.error };
      const items = Array.isArray(body?.items) ? body.items : [];
      const total_amount = String(body?.total_amount ?? "0");
      const invoice_id = withDb((db) => {
        const { user_id } = getActingUser();
        const id = db.nextIds.invoice++;
        const expandedItems = items.map((x: any) => {
          const productId = Number(x?.item?.id ?? 0);
          const qty = Number(x?.number_sold ?? 0);
          const product = db.products.find((p) => p.id === productId);
          if (product) {
            product.in_stock = Math.max(0, Number(product.in_stock ?? 0) - qty);
          }
          return {
            product_id: productId,
            wine_name: product?.name ?? `#${productId}`,
            quantity: qty,
            price: String(product?.price ?? 0),
          };
        });
        db.invoices.push({
          id,
          created_at: new Date().toISOString(),
          total_amount,
          user_id,
          items: expandedItems,
        });
        return id;
      });

      return { data: { message: "Checkout complete", invoice_id } };
    }

    // Fallthrough
    return { error: { status: 404, data: { message: `Mock: no route for ${method} ${path}` } } };
  } catch (e: any) {
    return { error: { status: 500, data: { message: e?.message ?? "Mock error" } } };
  }
};


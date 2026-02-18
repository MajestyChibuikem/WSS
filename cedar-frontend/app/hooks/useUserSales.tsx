import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL, USE_MOCK_API } from "../utils/runtimeConfig";
import { getMockSalesPage } from "../utils/mockSales";

// Define the interfaces for sales data
interface SaleItem {
  product_id: number;
  wine_name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: number;
  total: number;
  date: string;
  items: SaleItem[];
}

interface Sale {
  id: number;
  user_id: number;
  action: string;
  message: string;
  timestamp: string;
  invoice: Invoice | null;
}

interface SalesResponse {
  sales: Sale[];
  total: number;
  pages: number;
  current_page: number;
}

interface UseSales {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
  fetchSales: (page?: number) => void;
  refresh: () => void;
}

export function useUserSales(userId?: number): UseSales {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  // Function to fetch sales
  const fetchSales = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const effectiveUserId =
          userId ?? (Number(localStorage.getItem("wineryUserId") ?? "0") || undefined);

        if (USE_MOCK_API) {
          const mock = getMockSalesPage({
            userId: effectiveUserId,
            page,
            perPage: pagination.perPage,
          });
          // Maintain historical shape from backend: { sales: [...] } vs { logs: [...] }
          setSales((mock.logs as unknown) as Sale[]);
          setPagination({
            currentPage: mock.current_page,
            totalPages: mock.pages,
            totalItems: mock.total,
            perPage: pagination.perPage,
          });
        } else {
          const response = await axios.get<SalesResponse>(
            `${API_BASE_URL}/logs/sales/user`,
            {
              params: {
                user_id: effectiveUserId,
                page,
                per_page: pagination.perPage,
              },
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem(
                  "wineryAuthToken"
                )}`,
              },
            }
          );

          setSales(response.data.sales);
          setPagination({
            currentPage: response.data.current_page,
            totalPages: response.data.pages,
            totalItems: response.data.total,
            perPage: pagination.perPage,
          });
        }
      } catch (err) {
        setError("Failed to fetch sales data");
      } finally {
        setLoading(false);
      }
    },
    [userId, pagination.perPage]
  );

  // Fetch sales on mount and when userId changes
  useEffect(() => {
    fetchSales();
  }, [userId, fetchSales]);

  return {
    sales,
    loading,
    error,
    pagination,
    fetchSales,
    refresh: () => fetchSales(pagination.currentPage),
  };
}

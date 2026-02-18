export const USE_MOCK_API =
  (process.env.NEXT_PUBLIC_USE_MOCK_API ?? "true").toLowerCase() !== "false";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";


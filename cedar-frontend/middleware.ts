import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get("authToken"); // Get token object
  const token = tokenCookie?.value; // Extract token string

  const isLoginRoute = req.nextUrl.pathname === "/login"; // Check if it's the login page

  // Redirect unauthenticated users (except on /login)
  if (!token && !isLoginRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If token exists, check if it's expired
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      const isExpired = payload.exp * 1000 < Date.now(); // Check expiration

      if (isExpired) {
        return NextResponse.redirect(new URL("/login", req.url)); // Redirect expired tokens
      }
    } catch (error) {
      console.error("Invalid token:", error);
      return NextResponse.redirect(new URL("/login", req.url)); // Redirect invalid tokens
    }
  }

  return NextResponse.next();
}

// ✅ Protect all routes except /login
export const config = {
  matcher: "/((?!login).*)", // Match everything EXCEPT /login
};

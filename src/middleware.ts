import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/api", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar si existe la cookie de sesión de better-auth
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Si no hay sesión, redirigir a login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay sesión y está en /login, redirigir a home
  if (pathname === "/login" && sessionToken) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
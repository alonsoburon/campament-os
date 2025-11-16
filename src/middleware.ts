import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Rutas públicas que no requieren sesión
const PUBLIC_PATHS = [
	"/login",
	"/register",
	"/favicon.ico",
	"/campamentOS-typography.svg",
	"/favicon.svg",
];

function isPublicPath(pathname: string) {
	if (PUBLIC_PATHS.includes(pathname)) return true;
	// Recursos estáticos y rutas del sistema
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/assets") ||
		pathname.startsWith("/images") ||
		pathname.startsWith("/api/") // cualquier endpoint API es público para el middleware
	) {
		return true;
	}
	return false;
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (isPublicPath(pathname)) {
		return NextResponse.next();
	}

	// Comprobar sesión sin importar Prisma en Edge:
	// consultamos el endpoint interno de Better Auth reenviando cookies.
	let session: { user?: { person_id?: number | null } } | null = null;
	try {
		const url = new URL("/api/auth/get-session", request.url);
		const res = await fetch(url, {
			headers: {
				cookie: request.headers.get("cookie") ?? "",
			},
			cache: "no-store",
		});
		if (res.ok) {
			const data: unknown = await res.json();
      if (typeof data === 'object' && data !== null && 'user' in data) {
        session = data as { user?: { person_id?: number | null } };
      }
		}
	} catch {
		// ignorar y seguir con session = null
	}

	// Si el usuario ya tiene un perfil de persona y está en la página de onboarding, redirigir al dashboard
	if (session?.user?.person_id && pathname === "/onboarding/create-person") {
		const url = request.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	// No autenticado => login
	if (!session?.user) {
		// Redirigir a la página de login (auto-inicia Google)
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		// Mantener el destino original para posible retorno post-login
		if (!pathname.startsWith("/api/")) {
			url.searchParams.set("redirectTo", pathname + request.nextUrl.search);
		}
		return NextResponse.redirect(url);
	}

	// Autenticado pero sin persona => onboarding de persona
	if (session.user && !session.user.person_id && pathname !== "/onboarding/create-person") {
		const url = request.nextUrl.clone();
		url.pathname = "/onboarding/create-person";
		if (!pathname.startsWith("/api/")) {
			url.searchParams.set("redirectTo", pathname + request.nextUrl.search);
		}
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	// Excluir explícitamente los handlers de auth y estáticos del middleware
	matcher: [
		"/((?!api/.*|_next/.*|favicon.ico|campamentOS-typography.svg|favicon.svg).*)",
	],
};

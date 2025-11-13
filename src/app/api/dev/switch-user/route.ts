import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { authConfig } from "~/server/auth/config";
import { db } from "~/server/db";

const SESSION_COOKIE_NAME = "next-auth.session-token";
const SECURE_SESSION_COOKIE_NAME = "__Secure-next-auth.session-token";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "El cambio rápido de usuario solo está disponible en desarrollo." },
      { status: 403 },
    );
  }

  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para cambiar de usuario." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "No se pudo interpretar la solicitud." },
      { status: 400 },
    );
  }

  const userId = typeof body === "object" && body !== null ? (body as { userId?: unknown }).userId : undefined;

  if (typeof userId !== "string" || userId.length === 0) {
    return NextResponse.json(
      { error: "Debes proporcionar un identificador de usuario válido." },
      { status: 400 },
    );
  }

  if (userId === session.user.id) {
    return NextResponse.json({ ok: true, message: "Ya estás utilizando este usuario." });
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: "El usuario seleccionado no existe." },
      { status: 404 },
    );
  }

  const adapter = authConfig.adapter;

  if (!adapter?.createSession) {
    return NextResponse.json(
      { error: "El adaptador de autenticación no soporta sesiones." },
      { status: 500 },
    );
  }

  const cookieHeader = request.headers.get("cookie") ?? undefined;
  const previousToken =
    extractCookieValue(cookieHeader, SECURE_SESSION_COOKIE_NAME) ??
    extractCookieValue(cookieHeader, SESSION_COOKIE_NAME);

  if (previousToken && adapter.deleteSession) {
    try {
      await adapter.deleteSession(previousToken);
    } catch (cause) {
      console.error("No se pudo eliminar la sesión previa:", cause);
    }
  }

  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + SESSION_DURATION_MS);

  await adapter.createSession({
    sessionToken,
    userId: targetUser.id,
    expires,
  });

  const response = NextResponse.json({
    ok: true,
    switchedTo: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
    secure: false,
  });

  response.cookies.set({
    name: SECURE_SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
    secure: true,
  });

  return response;
}

function extractCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const rawCookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = rawCookies.find((cookie) =>
    cookie.startsWith(`${cookieName}=`),
  );

  if (!match) {
    return undefined;
  }

  return decodeURIComponent(match.substring(cookieName.length + 1));
}


import type { NextRequest } from "next/server";

function getBase(req: NextRequest, bodyBase?: string): string | null {
  const fromHeader = req.headers.get("x-backend-base");
  if (fromHeader?.startsWith("http")) return fromHeader.replace(/\/$/, "");
  if (bodyBase?.startsWith("http")) return bodyBase.replace(/\/$/, "");
  const fromQuery = req.nextUrl.searchParams.get("base");
  if (fromQuery?.startsWith("http")) return fromQuery.replace(/\/$/, "");
  const fromEnv = process.env.BACKEND_URL;
  if (fromEnv?.startsWith("http")) return fromEnv.replace(/\/$/, "");
  return null;
}

async function proxy(req: NextRequest, targetPath: string, body?: unknown) {
  const bodyBase =
    body && typeof body === "object" && "baseUrl" in body
      ? String((body as { baseUrl: string }).baseUrl)
      : undefined;
  const base = getBase(req, bodyBase);
  if (!base) {
    return Response.json(
      {
        error: "no-backend",
        message: "No backend URL set. Stay on Mock mode.",
      },
      { status: 400 },
    );
  }
  const url = `${base}${targetPath}`;
  try {
    const res = await fetch(url, {
      method: body !== undefined ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: "backend-unreachable",
        message: err instanceof Error ? err.message : "Backend fetch failed",
      },
      { status: 502 },
    );
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const target = `/${(path ?? []).join("/")}`;
  // ?base= is used by the health check; everything else also supports it.
  if (target === "/health" && !req.nextUrl.searchParams.get("base")) {
    return Response.json({
      ok: true,
      mode: "mock",
      message: "No base — mock mode",
    });
  }
  return proxy(req, target);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const target = `/${(path ?? []).join("/")}`;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return proxy(req, target, body);
}

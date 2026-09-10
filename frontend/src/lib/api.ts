// Typed fetch layer over the FastAPI backend.
// In dev, Vite proxies relative "/api" calls to :8001, and in the original
// single-origin deployment the same relative path worked in prod too.
// GitHub Pages is static-only and has no backend to proxy to, so in that build
// we point at a separately-hosted FastAPI instance via an env var instead.
// Set VITE_API_URL in your GitHub Actions build step (see README) to something
// like "https://your-backend.onrender.com/api".
const BASE = import.meta.env.VITE_API_URL ?? "/api";

// Fields are declared, not constructor parameter properties: tsconfig sets
// erasableSyntaxOnly, which rejects `constructor(readonly status: number)`.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonBody = unknown;

async function request<T>(method: string, path: string, body?: JsonBody): Promise<T> {
  // Auth rides the httpOnly session cookie automatically — never add auth headers here.
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // FastAPI reports request-validation failures as 422 with a {detail: [...]} body.
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// The response type is yours to declare: nothing infers across the Python boundary, so a
// TS interface here mirrors the endpoint's Pydantic model by hand — keep the two in sync.
export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: JsonBody) => request<T>("POST", path, body ?? null);
export const apiPut = <T>(path: string, body?: JsonBody) => request<T>("PUT", path, body ?? null);
export const apiPatch = <T>(path: string, body?: JsonBody) =>
  request<T>("PATCH", path, body ?? null);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);

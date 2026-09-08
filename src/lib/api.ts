/**
 * Transport for the Laravel backend. Server-side only: API_URL carries no
 * NEXT_PUBLIC_ prefix, so bearer tokens never reach the browser bundle.
 *
 * The host answers plain HTTP with a 301 to HTTPS — always call the https origin
 * so credentials are never sent in clear over the first hop.
 */
const BASE_URL = (
  process.env.API_URL ??
  "https://jeregrette-backend-production-b100.up.railway.app/api"
).replace(/\/$/, "");

/** Laravel validation payload: { message, errors: { field: [msg, ...] } } */
type LaravelError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** The message a form should show: first field error, else the summary. */
  get displayMessage() {
    const first = Object.values(this.errors ?? {})[0]?.[0];
    return first ?? this.message;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Sanctum personal access token. */
  token?: string;
};

/**
 * `fetch` is uncached by default in this Next version, so reads always hit the
 * API — which is what a feed wants.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    const error = new ApiError(0, "Le serveur est injoignable.");
    error.cause = cause;
    throw error;
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const error = (payload ?? {}) as LaravelError;
    throw new ApiError(
      response.status,
      error.message ?? `Erreur ${response.status}.`,
      error.errors,
    );
  }

  return payload as T;
}

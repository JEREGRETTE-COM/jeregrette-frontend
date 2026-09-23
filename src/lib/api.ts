/**
 * Transport for the Laravel backend. Server-side only: API_URL carries no
 * NEXT_PUBLIC_ prefix, so bearer tokens never reach the browser bundle.
 *
 * The host answers plain HTTP with a 301 to HTTPS — always call the https origin
 * so credentials are never sent in clear over the first hop.
 */
const DEFAULT_API_URL = "https://jeregrette-api.benrango.com/api";

/**
 * Plain http is upgraded for any real host. The API answers it with a 301 to
 * https, and fetch replays a redirected POST as a GET: login, posting and
 * reacting would all fail with "The GET method is not supported", after the
 * password had already crossed the network in clear. Local backends keep http.
 */
export function normalizeBaseUrl(raw: string) {
  const url = new URL(raw.trim());
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol === "http:" && !local) url.protocol = "https:";
  return url.toString().replace(/\/$/, "");
}

function resolveBaseUrl() {
  try {
    return normalizeBaseUrl(process.env.API_URL || DEFAULT_API_URL);
  } catch {
    console.error("[api] API_URL is not a valid URL, falling back to the default");
    return DEFAULT_API_URL;
  }
}

const BASE_URL = resolveBaseUrl();

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

  /**
   * The message a form should show: first field error, else the summary. The
   * backend sometimes sends raw translation keys ("validation.required_without"),
   * which must never reach the screen.
   */
  get displayMessage() {
    const first = Object.values(this.errors ?? {})[0]?.[0];
    const message = first ?? this.message;
    return /^[a-z_]+(\.[a-z_]+)+/.test(message) ? "Certaines informations sont invalides." : message;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON by default; a FormData goes out as multipart, for file uploads. */
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
  // fetch sets its own multipart boundary, so never force the type on FormData.
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const startedAt = Date.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch (cause) {
    // Server-side log only; never the headers (bearer token) nor the body.
    // undici hides the real reason (DNS, TLS, timeout...) in `cause.cause`.
    const inner = (cause as { cause?: { code?: string; message?: string } })?.cause;
    console.error("[api] network failure", {
      method,
      url,
      ms: Date.now() - startedAt,
      error: cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause),
      code: inner?.code,
      reason: inner?.message,
    });
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

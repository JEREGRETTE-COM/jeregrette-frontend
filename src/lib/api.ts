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

/**
 * The only backend wordings the app repeats, in French. Anything unknown falls
 * back to a generic sentence rather than exposing what the server said.
 */
const KNOWN_MESSAGES: [RegExp, string][] = [
  [/already been taken|déjà (pris|utilisé)/i, "Ce nom est déjà utilisé."],
  [/invalid credentials|incorrect/i, "Identifiant ou mot de passe incorrect."],
  [/unauthenticated|unauthorized|token/i, "Session expirée, reconnecte-toi."],
  [/too many|rate limit/i, "Trop de tentatives. Patiente une minute puis réessaie."],
  [/not found|introuvable/i, "Introuvable."],
  [/forbidden|not allowed|permission/i, "Action non autorisée."],
  [/valid email|email.*(invalid|format)/i, "Adresse email invalide."],
  [/confirmation|match/i, "Les deux mots de passe ne correspondent pas."],
  [/required|obligatoire/i, "Il manque une information."],
  [/(too|au moins).*(short|long|caractères)|max|min/i, "Une information ne respecte pas la longueur attendue."],
];

function translate(message: string | undefined) {
  const clean = message?.trim();
  if (!clean) return null;
  for (const [pattern, french] of KNOWN_MESSAGES) {
    if (pattern.test(clean)) return french;
  }
  return null;
}

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
   * What a form is allowed to show. The backend answers in English and, with
   * debug left on, has leaked SQL dumps, database hosts and even a user's email
   * onto the login screen. So nothing from the API reaches the eye unless it
   * matches a sentence we wrote: everything else becomes a plain fallback, and
   * the real cause stays in the server logs.
   */
  get displayMessage() {
    if (this.status === 0) return "Connexion impossible. Vérifie ta connexion et réessaie.";
    if (this.status === 429) return "Trop de tentatives. Patiente une minute puis réessaie.";
    if (this.status >= 500) {
      return "Le service est momentanément indisponible. Réessaie dans quelques minutes.";
    }

    const field = Object.values(this.errors ?? {})[0]?.[0];
    return translate(field) ?? translate(this.message) ?? "Une erreur est survenue. Réessaie.";
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
    // Warn, not error: the callers handle this, and console.error would raise
    // the dev overlay as if the page had crashed.
    const inner = (cause as { cause?: { code?: string; message?: string } })?.cause;
    const reason = inner?.code ?? (cause instanceof Error ? cause.name : "unknown");
    console.warn(
      `[api] ${method} ${url} unreachable after ${Date.now() - startedAt}ms — ` +
        `${reason}${inner?.message ? `: ${inner.message}` : ""}`,
    );
    const error = new ApiError(0, "Le serveur est injoignable.");
    error.cause = cause;
    throw error;
  }

  // TEMP diagnostic (dev only): follows a sign-in without ever printing tokens.
  if (process.env.NODE_ENV !== "production" && /^\/(auth|users\/me)/.test(path)) {
    console.info(
      `[auth] ${method} ${path} → ${response.status} in ${Date.now() - startedAt}ms` +
        `${token ? " (avec token)" : " (sans token)"}`,
    );
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

/** Shapes returned by the Laravel backend. */

/** "EMAIL" is confirmed; the OAuth buttons imply others, hence the fallback. */
export type AuthProvider = "EMAIL" | (string & {});

/** GET /user — note it carries no posts_count. */
export type ApiUser = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  provider: AuthProvider;
  created_at: string;
  updated_at: string;
};

/** The richer user embedded in register/login replies. */
export type ApiAuthUser = ApiUser & {
  posts_count: number;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Seconds, sent as a string. */
  expires_in: string;
};

export type AuthResponse = {
  user: ApiAuthUser;
  tokens: AuthTokens;
};

/** POST /auth/refresh — flat, unlike the auth replies, and adds a session id. */
export type RefreshResponse = AuthTokens & {
  session_id: string;
};

/** The values POST reactions accepts, and what `my_reaction` holds. */
export type ReactionType = "LIKE" | "EMPATHY" | "SUPPORT" | "LAUGH" | "SAD";

/**
 * A post. `type` distinguishes originals from reposts, but its values are not
 * documented yet — presence of `original_post` is the reliable signal.
 *
 * The backend serialises an absent `original_post` as `{}`, hence the loose type;
 * use `quotedPost()` rather than reading it directly.
 */
export type ApiPost = {
  id: string;
  type: string;
  content: string;
  media_url: string | null;
  author: ApiAuthUser;
  author_id: string;
  allow_repost: boolean;
  allow_opinion_on_repost: boolean;
  /** A single total — the API exposes no per-reaction breakdown. */
  reactions_count: number;
  reposts_count: number;
  score: number;
  /** The current user's reaction, null when they have not reacted. */
  my_reaction: ReactionType | null;
  created_at: string;
  updated_at: string;
  original_post?: ApiPost | Record<string, never> | null;
};

export type PostCursor = {
  cursor_score: string;
  cursor_id: string;
};

export type PaginationMeta = {
  next_cursor: PostCursor | null;
  has_more: boolean;
  limit: number | null;
};

/** The reposts list pages by number, unlike the cursor-based feed. */
export type PageMeta = {
  total: number;
  current_page: number;
  last_page: number;
};

/**
 * A third pagination shape: opaque string cursors, and `has_more` serialised as
 * a string. Normalised by the client.
 */
export type OpaqueCursorMeta = {
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean | string;
};

export type ApiItem<T> = { data: T };
export type ApiList<T> = { data: T[]; meta: PaginationMeta };
export type ApiPage<T> = { data: T[]; meta: PageMeta };
export type ApiCursorPage<T> = { data: T[]; meta: OpaqueCursorMeta };

/** POST /posts/{id}/reactions — `updated` marks a change rather than a first vote. */
export type ReactionResult = {
  post_id: string;
  reaction: ReactionType;
  updated: boolean;
};

/** GET /posts/{id}/reactions — counts keyed by reaction type. */
export type ReactionSummary = {
  post_id: string;
  total: number;
  breakdown: Record<string, number | string>;
};

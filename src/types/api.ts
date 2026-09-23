/** Shapes returned by the Laravel backend. */

/** "EMAIL" is confirmed; the OAuth buttons imply others, hence the fallback. */
export type AuthProvider = "EMAIL" | (string & {});

/**
 * UserResource, as /docs/api.json has it. `email` is optional and nullable,
 * presumably for OAuth accounts that come without one; the dates can be null.
 */
export type ApiUser = {
  id: string;
  /** null on a guest account, until they choose one. */
  username: string | null;
  /** Verified badge, shown next to the handle. */
  certified?: boolean;
  /** Accounts created without signing up. */
  is_guest?: boolean;
  email?: string | null;
  avatar_url: string | null;
  bio: string | null;
  provider: AuthProvider;
  created_at: string | null;
  updated_at: string | null;
};

/** The same user as embedded in register/login replies and /users/me. */
export type ApiAuthUser = ApiUser & {
  /** Not required by the spec, so it can be missing. */
  posts_count?: number;
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

/** From /docs/api.json. Presence of `original_post` stays the detection signal. */
export type PostType = "ORIGINAL" | "REPOST";

/** The values POST reactions accepts, and what `my_reaction` holds. */
export type ReactionType = "LIKE" | "EMPATHY" | "SUPPORT" | "LAUGH" | "SAD";

/** Counts per reaction type, as served inside each post. */
export type ApiReactions = {
  total: number;
  breakdown: Record<string, number | string>;
};

/** Section a post belongs to. Null on posts published before rubriques. */
export type ApiRubrique = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  posts_count: number;
  created_at: string | null;
};

/**
 * A post. `type` distinguishes originals from reposts.
 *
 * The backend serialises an absent `original_post` as `{}`, hence the loose type;
 * use `quotedPost()` rather than reading it directly.
 */
export type ApiPost = {
  id: string;
  type: PostType;
  content: string;
  media_url: string | null;
  author: ApiAuthUser;
  author_id: string;
  allow_repost: boolean;
  allow_opinion_on_repost: boolean;
  /** Kept for older payloads; `reactions` carries the same total and the detail. */
  reactions_count: number;
  /** Counts per type, straight in the post: no second call needed. */
  reactions?: ApiReactions;
  rubrique_id?: string | null;
  rubrique?: ApiRubrique | null;
  reposts_count: number;
  score: number;
  /** The current user's reaction, null when they have not reacted. */
  my_reaction: ReactionType | null;
  created_at: string;
  updated_at: string;
  original_post?: ApiPost | Record<string, never> | null;
};

/** GET /posts has no cursor: `has_more` false only when the base is nearly empty. */
export type FeedMeta = {
  has_more: boolean;
  limit: number | null;
  /** Server time of the draw (ISO 8601), sent back as is to GET /posts/new-count. */
  served_at?: string;
};

/** The reposts list pages by number, unlike the feed. */
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
export type ApiList<T> = { data: T[]; meta: FeedMeta };
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

/**
 * GET /notifications item. `data` is a string on the wire, most likely a
 * JSON-encoded payload. `read_at` is documented as a plain string, but an
 * unread notification can only carry null there.
 */
export type ApiNotification = {
  id: string;
  type: string | null;
  data: string;
  read_at: string | null;
  created_at: string;
};

/** The cursors are returned, but GET /notifications accepts none as a parameter. */
export type NotificationsMeta = {
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
  unread_count: number;
};

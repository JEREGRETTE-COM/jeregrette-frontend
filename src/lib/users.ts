import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * In-memory account list. Same caveat as the feed store: no database yet, so
 * accounts disappear when the server restarts. Passwords are still salted and
 * hashed rather than kept in clear — that part should not change when a real
 * database arrives.
 */
type Account = {
  email: string;
  handle: string;
  salt: string;
  hash: string;
};

const accounts = new Map<string, Account>();

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function matches(account: Account, password: string) {
  const candidate = Buffer.from(hashPassword(password, account.salt), "hex");
  const stored = Buffer.from(account.hash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

/** Keeps two different emails from displaying the same @handle. */
function uniqueHandle(base: string) {
  const taken = new Set([...accounts.values()].map((account) => account.handle));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}${suffix}`)) suffix += 1;
  return `${base}${suffix}`;
}

export function findAccount(email: string) {
  return accounts.get(email.toLowerCase());
}

export function createAccount(email: string, handle: string, password: string) {
  const key = email.toLowerCase();
  const salt = randomBytes(16).toString("hex");
  const account: Account = {
    email: key,
    handle: uniqueHandle(handle),
    salt,
    hash: hashPassword(password, salt),
  };
  accounts.set(key, account);
  return account;
}

export function authenticate(email: string, password: string) {
  const account = findAccount(email);
  if (!account || !matches(account, password)) return undefined;
  return account;
}

// Firma/verifica del token di sessione con Web Crypto (HMAC-SHA256).
// Niente dipendenze native: funziona sia nel runtime Node che nel middleware (edge).
import type { Role } from "./types";

export const SESSION_COOKIE = "csr_session";
const MAX_AGE_SEC = 60 * 60 * 8; // 8 ore

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(new Uint8Array(sig));
}

export async function createToken(role: Role): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = `${role}.${exp}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export interface Session {
  role: Role;
  exp: number;
}

export async function verifyToken(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, expStr, sig] = parts;
  if (role !== "admin" && role !== "editor") return null;
  const expected = await sign(`${role}.${expStr}`);
  if (sig !== expected) return null;
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
  return { role: role as Role, exp };
}

export const COOKIE_MAX_AGE = MAX_AGE_SEC;

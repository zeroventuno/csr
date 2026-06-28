// Helper di sessione lato server (usano next/headers, quindi NON nel middleware).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken, type Session } from "./auth";

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}

/** Da usare nelle pagine admin: reindirizza al login se non autenticato. */
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

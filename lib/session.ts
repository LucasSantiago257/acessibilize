import { env } from 'cloudflare:workers';

export type SessionUser = { userId: string; name: string; username: string };
export function readSessionToken(request: Request) {
  return request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith('az_session='))?.slice(11) || null;
}
export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
export async function getSession(request: Request): Promise<SessionUser | null> {
  const token = readSessionToken(request);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return env.DB!.prepare('SELECT u.id AS userId, u.name, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').bind(await hashSessionToken(token), new Date().toISOString()).first<SessionUser>();
}
export function sessionCookie(request: Request, token: string, maxAge: number) {
  return `az_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}

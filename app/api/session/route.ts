import { env } from 'cloudflare:workers';
import { z } from 'zod';
import accounts from '../../../data/classroom-accounts.json';
import { hashSessionToken, readSessionToken, sessionCookie } from '../../../lib/session';
import { equalHash, passwordHash } from '../../../lib/passwords';

export const dynamic = 'force-dynamic';
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (body: unknown, status = 200, cookie?: string) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...(cookie ? { 'Set-Cookie': cookie } : {}) } });
const sameOrigin = (request: Request) => request.headers.get('origin') === new URL(request.url).origin && request.headers.get('sec-fetch-site') !== 'cross-site';

// Dados iniciais ficam fora das migrações; não há criação de tabelas no login.
async function seedAccounts() {
  await env.DB!.batch(accounts.map(a => env.DB!.prepare('INSERT INTO users (id, username, name, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(username) DO NOTHING').bind(a.id, a.username, a.name, a.passwordHash, a.salt, a.createdAt)));
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Formato inválido.' }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 1024) return json({ error: 'Dados muito extensos.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: 'Dados inválidos.' }, 400); }
    const parsed = z.object({ username: z.string().trim().min(1).max(50), password: z.string().min(1).max(128) }).strict().safeParse(body);
    if (!parsed.success) return json({ error: 'Informe seu usuário e sua senha.' }, 400);
    await seedAccounts();
    const user = await env.DB!.prepare('SELECT id, username, name, password_hash, password_salt, locked_until FROM users WHERE username = ?').bind(parsed.data.username.toLowerCase()).first<{id:string;username:string;name:string;password_hash:string;password_salt:string;locked_until:string|null}>();
    const now = new Date();
    const candidate = await passwordHash(parsed.data.password, user?.password_salt || accounts[0].salt);
    if (user?.locked_until && user.locked_until > now.toISOString()) return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429);
    if (!user || !equalHash(candidate, user.password_hash)) {
      if (user) await env.DB!.prepare('UPDATE users SET failed_attempts = failed_attempts + 1, locked_until = CASE WHEN failed_attempts >= 4 THEN ? ELSE NULL END WHERE id = ?').bind(new Date(now.getTime() + 15 * 60000).toISOString(), user.id).run();
      return json({ error: 'Usuário ou senha incorretos.' }, 401);
    }
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    const statements = [
      env.DB!.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').bind(user.id),
      env.DB!.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(await hashSessionToken(token), user.id, now.toISOString(), new Date(now.getTime() + 7 * 86400000).toISOString()),
    ];
    const old = readSessionToken(request);
    if (old) statements.push(env.DB!.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashSessionToken(old)));
    await env.DB!.batch(statements);
    return json({ user: { name: user.name, username: user.username } }, 200, sessionCookie(request, token, 7 * 86400));
  } catch { return json({ error: 'Não foi possível entrar agora. Tente novamente.' }, 503); }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  try {
    const token = readSessionToken(request);
    if (token) await env.DB!.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashSessionToken(token)).run();
    return json({ user: null }, 200, sessionCookie(request, '', 0));
  } catch { return json({ error: 'Não foi possível sair agora. Tente novamente.' }, 503); }
}

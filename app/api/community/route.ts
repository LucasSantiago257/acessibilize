import { env } from 'cloudflare:workers';
import baseIds from '../../../data/base-ids.json';
import { placeSchema, reportSchema } from '../../../lib/community-validation';
import { getSession } from '../../../lib/session';

export const dynamic = 'force-dynamic';
const knownPlaces = new Set(baseIds);
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers });

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const [places, reports, ratings] = await env.DB!.batch<Record<string, unknown>>([
      env.DB!.prepare('SELECT id, name, category, area, address, latitude, longitude, created_at FROM community_places ORDER BY created_at DESC'),
      env.DB!.prepare('SELECT id, place_id, author_name, visited_at, created_at, features, observation, physical_rating, visual_rating, hearing_rating FROM accessibility_reports ORDER BY visited_at DESC, created_at DESC, id DESC'),
      env.DB!.prepare('SELECT place_id, AVG(physical_rating) AS physical_average, COUNT(physical_rating) AS physical_count, AVG(visual_rating) AS visual_average, COUNT(visual_rating) AS visual_count, AVG(hearing_rating) AS hearing_average, COUNT(hearing_rating) AS hearing_count FROM accessibility_reports GROUP BY place_id'),
    ]);
    return json({
      signedIn: Boolean(session),
      user: session ? { name: session.name, username: session.username } : null,
      places: places.results.map((p: Record<string, unknown>) => ({ id: p.id, name: p.name, category: p.category, area: p.area, address: p.address, lat: p.latitude, lng: p.longitude, createdAt: p.created_at, source: 'community', physical: 0, visual: 0, hearing: 0, resources: { physical: [], visual: [], hearing: [] }, art: ({ 'Cultura e lazer': 'culture', 'Parques e praças': 'park', Compras: 'shopping', Serviços: 'service', Alimentação: 'food' } as Record<string, string>)[String(p.category)] })),
      reports: reports.results.map((r: Record<string, unknown>) => ({ id: r.id, placeId: r.place_id, authorName: r.author_name, visitedAt: r.visited_at, createdAt: r.created_at, features: JSON.parse(String(r.features)), observation: r.observation, ratings: { physical: r.physical_rating, visual: r.visual_rating, hearing: r.hearing_rating } })),
      ratingsByPlace: Object.fromEntries(ratings.results.map(r => [r.place_id, Object.fromEntries(['physical', 'visual', 'hearing'].map(k => [k, { average: r[k + '_average'], count: r[k + '_count'] }]))])),
    });
  } catch (error) {
    console.error('community_read_failed', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'Não foi possível carregar a comunidade agora. Tente novamente.' }, 503);
  }
}

export async function POST(request: Request) {
  let session;
  try { session = await getSession(request); } catch { return json({ error: 'Não foi possível verificar sua sessão. Tente novamente.' }, 503); }
  if (!session) return json({ error: 'Faça login para cadastrar ou avaliar.' }, 401);
  const authorId = session.userId;
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Origem da requisição não permitida.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Formato não permitido.' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 20000) return json({ error: 'Contribuição muito extensa.' }, 413);
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 20000) return json({ error: 'Contribuição muito extensa.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: 'Dados inválidos.' }, 400); }
    const now = new Date().toISOString();
    const since = new Date(Date.now() - 3600000).toISOString();
    if (body?.type === 'place') {
      const parsed = placeSchema.safeParse(body.data);
      if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
      const p = parsed.data;
      const id = 'community-' + p.id;
      const result = await env.DB!.prepare('INSERT INTO community_places (id, author_id, name, category, area, address, latitude, longitude, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM community_places WHERE author_id = ? AND created_at >= ?) < 15 ON CONFLICT(id) DO NOTHING').bind(id, authorId, p.name, p.category, p.area, p.address, p.lat, p.lng, now, authorId, since).run();
      if (!result.meta.changes) {
        const existing = await env.DB!.prepare('SELECT id FROM community_places WHERE id = ? AND author_id = ?').bind(id, authorId).first();
        if (!existing) return json({ error: 'Limite de 15 novos locais por hora. Tente mais tarde.' }, 429);
      }
      return json({ id }, 201);
    }
    if (body?.type === 'report') {
      const parsed = reportSchema.safeParse(body.data);
      if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
      const r = parsed.data;
      if (!knownPlaces.has(r.placeId) && !await env.DB!.prepare('SELECT id FROM community_places WHERE id = ?').bind(r.placeId).first()) return json({ error: 'Local não encontrado na base real. Os exemplos fictícios não recebem registros compartilhados.' }, 404);
      const result = await env.DB!.prepare('INSERT INTO accessibility_reports (id, place_id, author_id, author_name, visited_at, created_at, features, observation, physical_rating, visual_rating, hearing_rating) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM accessibility_reports WHERE author_id = ? AND created_at >= ?) < 30 ON CONFLICT(id) DO NOTHING').bind(r.id, r.placeId, authorId, r.authorName, r.visitedAt, now, JSON.stringify(r.features), r.observation, r.ratings.physical ?? null, r.ratings.visual ?? null, r.ratings.hearing ?? null, authorId, since).run();
      if (!result.meta.changes) {
        const existing = await env.DB!.prepare('SELECT id FROM accessibility_reports WHERE id = ? AND author_id = ?').bind(r.id, authorId).first();
        if (!existing) return json({ error: 'Limite de 30 registros por hora. Tente mais tarde.' }, 429);
      }
      return json({ id: r.id }, 201);
    }
    return json({ error: 'Tipo de contribuição inválido.' }, 400);
  } catch (error) {
    console.error('community_write_failed', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'Não foi possível salvar. Seu formulário foi mantido; tente novamente.' }, 503);
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessCode, listClientFiles, signSession, verifySession } from '@/lib/portal';

// איזור אישי: אימות בקוד + session cookie חתום. ללא מייל, ללא DB חדש (Supabase REST).
export const runtime = 'nodejs';

const COOKIE = 'portal_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 יום

// rate-limit נאיבי בזיכרון (per-instance). מספיק ל-MVP: 8 ניסיונות ל-10 דק' לכל IP.
const attempts = new Map<string, { n: number; t: number }>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const e = attempts.get(ip);
  if (!e || now - e.t > windowMs) {
    attempts.set(ip, { n: 1, t: now });
    return false;
  }
  e.n += 1;
  return e.n > 8;
}

function ipOf(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

// שחזור גישה מה-cookie (רענון דף / חזרה לאתר).
export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;
  const slug = verifySession(token);
  if (!slug) return NextResponse.json({ ok: false }, { status: 401 });
  const files = await listClientFiles(slug);
  return NextResponse.json({ ok: true, files });
}

// התחברות בקוד.
export async function POST(req: Request) {
  if (tooMany(ipOf(req))) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  let body: { code?: unknown };
  try {
    body = (await req.json()) as { code?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!code) return NextResponse.json({ ok: false, error: 'missing_code' }, { status: 400 });

  const client = await verifyAccessCode(code);
  if (!client) return NextResponse.json({ ok: false, error: 'bad_code' }, { status: 401 });

  const files = await listClientFiles(client.slug);
  const res = NextResponse.json({ ok: true, name: client.name, files });
  res.cookies.set(COOKIE, signSession(client.slug), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return res;
}

// יציאה.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

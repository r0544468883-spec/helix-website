import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';

export const revalidate = 120;

type Params = Promise<{ locale: string }>;

// ביטויי-כוונה: אנשים שמחפשים כלי/פתרון/המלצה
const INTENT = [
  'מחפש', 'מחפשת', 'צריך', 'צריכה', 'המלצה', 'ממליצים', 'מישהו יודע', 'יש כלי', 'יש פתרון',
  'looking for', 'need a', 'need an', 'recommend', 'anyone know', 'is there a', 'suggestions for',
];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return { title: t.signals.title, description: t.signals.metaDesc, alternates: { canonical: `/${locale}/signals` } };
}

type Post = {
  id: string;
  body: string;
  created_at: string;
  profiles: { name: string | null; username: string | null } | null;
};

export default async function SignalsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale);
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const supabase = await createClient();

  const orFilter = INTENT.map((p) => `body.ilike.%${p}%`).join(',');
  const { data } = await supabase
    .from('posts')
    .select('id, body, created_at, profiles (name, username)')
    .or(orFilter)
    .order('created_at', { ascending: false })
    .limit(40);

  const posts = (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
  })) as Post[];

  return (
    <div dir={dir} className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <span className="inline-flex items-center gap-2 text-[13px] text-brand font-semibold mb-3">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> {t.signals.badge}
      </span>
      <h1 className="font-display text-[clamp(28px,5vw,42px)] font-extrabold tracking-tight">{t.signals.title}</h1>
      <p className="text-ink-secondary text-[16px] mt-3 mb-10 max-w-xl">{t.signals.subtitle}</p>

      {posts.length === 0 ? (
        <p className="text-ink-muted text-[15px]">{t.signals.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-2xl p-5">
              <p className="text-ink text-[15px] leading-relaxed whitespace-pre-line line-clamp-4" dir="auto">{p.body}</p>
              <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                <span className="text-[13px] text-ink-secondary">
                  {t.signals.by} {p.profiles?.name ?? p.profiles?.username ?? '—'} · {formatDate(p.created_at, locale)}
                </span>
                <Link href={`/${locale}/community`} className="text-brand hover:text-brand-hover text-[13px] font-semibold">
                  {t.signals.respond} ←
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

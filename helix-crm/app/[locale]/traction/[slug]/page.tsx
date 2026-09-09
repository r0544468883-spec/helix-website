import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app';

type Params = Promise<{ locale: string; slug: string }>;

async function countRows(
  db: ReturnType<typeof createAdminClient>,
  table: string,
  productId: string,
  since?: string
): Promise<number> {
  if (!db) return 0;
  let q = db.from(table).select('id', { count: 'exact', head: true }).eq('product_id', productId);
  if (since) q = q.gte('created_at', since);
  const { count } = await q;
  return count ?? 0;
}

export default async function TractionPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const dir = locale === 'en' ? 'ltr' : 'rtl';

  // Public read for the product + owner; admin read for aggregate proof (bypasses RLS,
  // exposes only counts — never raw emails/rows).
  const supabase = await createClient();
  const admin = createAdminClient();
  const db = admin ?? supabase;

  const { data: product } = await db
    .from('products')
    .select(
      `id, name, slug, tagline, description, logo_url, website_url, status, created_at,
       profiles!products_owner_id_fkey (name, username, avatar_url, role_title, company, linkedin_url, bio, is_verified)`
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!product) notFound();

  const owner = (Array.isArray(product.profiles) ? product.profiles[0] : product.profiles) as {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    role_title: string | null;
    company: string | null;
    linkedin_url: string | null;
    bio: string | null;
    is_verified: boolean | null;
  } | null;

  const now = Date.now();
  const d7 = new Date(now - 7 * 864e5).toISOString();
  const d14 = new Date(now - 14 * 864e5).toISOString();

  const [{ data: launch }, waitlist, views, reviewsRes] = await Promise.all([
    db.from('launches').select('votes_count, comments_count, launch_date').eq('product_id', product.id).order('launch_date', { ascending: false }).limit(1).maybeSingle(),
    countRows(admin, 'waitlist_signups', product.id),
    countRows(admin, 'product_views', product.id),
    admin ? admin.from('reviews').select('rating').eq('product_id', product.id) : Promise.resolve({ data: [] as { rating: number }[] }),
  ]);

  const views7 = await countRows(admin, 'product_views', product.id, d7);
  const viewsPrev7 = (await countRows(admin, 'product_views', product.id, d14)) - views7;
  const growthPct =
    viewsPrev7 > 0 ? Math.round(((views7 - viewsPrev7) / viewsPrev7) * 100) : views7 > 0 ? 100 : 0;

  const ratings = (reviewsRes.data ?? []) as { rating: number }[];
  const reviewAvg = ratings.length ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length) : 0;

  const votes = launch?.votes_count ?? 0;
  const comments = launch?.comments_count ?? 0;
  const tr = t.traction;

  const metrics = [
    { label: tr.mWaitlist, value: waitlist, hot: waitlist >= 50 },
    { label: tr.mUpvotes, value: votes, hot: votes >= 50 },
    { label: tr.mReviews, value: ratings.length ? `${reviewAvg.toFixed(1)}★ · ${ratings.length}` : '—' },
    { label: tr.mViews, value: views },
    { label: tr.mGrowth, value: growthPct > 0 ? `+${growthPct}%` : '—', hot: growthPct >= 20 },
    { label: tr.mComments, value: comments },
  ];

  return (
    <div dir={dir} className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-16">
      {/* trust stamp */}
      <div className="inline-flex items-center gap-2 text-[13px] text-brand font-semibold mb-6">
        <span className="w-2 h-2 rounded-full bg-brand" /> {tr.verifiedByHelix}
      </div>

      {/* product header */}
      <div className="flex items-start gap-4 mb-8">
        {product.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight">{product.name}</h1>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-surface border border-border text-ink-secondary">{t.statuses[product.status as keyof typeof t.statuses] ?? product.status}</span>
          </div>
          <p className="text-ink-secondary text-[16px] mt-1">{product.tagline}</p>
          {product.website_url && (
            <a href={product.website_url} target="_blank" rel="noopener noreferrer" className="text-brand text-[14px] font-semibold mt-1 inline-block" dir="ltr">
              {product.website_url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* traction metrics */}
      <h2 className="text-[13px] font-bold text-ink-muted uppercase tracking-wide mb-3">{tr.demandSignals}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-2xl p-5">
            <div className={`font-mono text-[28px] font-bold ${m.hot ? 'text-brand' : 'text-ink'}`}>{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
            <div className="text-[13px] text-ink-secondary mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* founder — investors underwrite the founder */}
      {owner && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-10">
          <h2 className="text-[13px] font-bold text-ink-muted uppercase tracking-wide mb-4">{tr.founder}</h2>
          <div className="flex items-start gap-4">
            {owner.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={owner.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border border-border shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[17px]">{owner.name ?? owner.username}</span>
                {owner.is_verified && <span className="text-[11px] font-semibold text-brand">✓ {tr.verified}</span>}
              </div>
              {(owner.role_title || owner.company) && (
                <p className="text-ink-secondary text-[14px]">{[owner.role_title, owner.company].filter(Boolean).join(' · ')}</p>
              )}
              {owner.bio && <p className="text-ink text-[15px] leading-relaxed mt-2">{owner.bio}</p>}
              {owner.linkedin_url && (
                <a href={owner.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand text-[14px] font-semibold mt-2 inline-block">LinkedIn ↗</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* about */}
      {product.description && (
        <div className="mb-10">
          <h2 className="text-[13px] font-bold text-ink-muted uppercase tracking-wide mb-3">{tr.about}</h2>
          <p className="text-ink text-[16px] leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {/* footer */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-6 border-t border-border">
        <Link href={`/${locale}/products/${product.slug}`} className="text-brand font-semibold text-[15px]">{tr.viewProduct} ←</Link>
        <span className="text-ink-muted text-[13px]">{tr.since} {formatDate(product.created_at, locale)}</span>
      </div>
      <p className="text-ink-muted text-[12px] mt-6 text-center">{tr.disclaimer} · {SITE_URL.replace(/^https?:\/\//, '')}/{locale}/traction/{product.slug}</p>
    </div>
  );
}

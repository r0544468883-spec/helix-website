import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import ListingForm from '@/components/ListingForm';
import ContactListingButton from '@/components/ContactListingButton';
import VerifiedBadge from '@/components/VerifiedBadge';

export const dynamic = 'force-dynamic';

type ListingRow = {
  id: string;
  type: string;
  role_title: string | null;
  body: string;
  created_at: string;
  contact_email: string | null;
  profiles: {
    name: string | null;
    username: string;
    linkedin_url: string | null;
    is_verified: boolean;
  } | null;
  products: { name: string; slug: string } | null;
};

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale } = await params;
  const { t: tabParam } = await searchParams;
  const tab =
    tabParam === 'hiring' || tabParam === 'open_to_work' || tabParam === 'collab' ? tabParam : 'all';
  const t = getDict(locale);

  let listings: ListingRow[] = [];
  let isLoggedIn = false;
  let myProducts: { id: string; name: string }[] = [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from('listings')
      .select(
        'id, type, role_title, body, created_at, contact_email, profiles (name, username, linkedin_url, is_verified), products (name, slug)'
      )
      .order('created_at', { ascending: false })
      .limit(80);
    if (tab !== 'all') query = query.eq('type', tab);
    const { data } = await query;
    listings = (data ?? []).map((l: Record<string, unknown>) => ({
      ...l,
      profiles: Array.isArray(l.profiles) ? l.profiles[0] : l.profiles,
      products: Array.isArray(l.products) ? l.products[0] : l.products,
    })) as ListingRow[];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const { data: prods } = await supabase
        .from('products')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(100);
      myProducts = (prods ?? []) as { id: string; name: string }[];
    }
  } catch {
    // אין חיבור עדיין
  }

  const tabs: { key: string; label: string; href: string }[] = [
    { key: 'all', label: t.board.all, href: `/${locale}/board` },
    { key: 'hiring', label: t.board.hiring, href: `/${locale}/board?t=hiring` },
    { key: 'open_to_work', label: t.board.openToWork, href: `/${locale}/board?t=open_to_work` },
    { key: 'collab', label: t.board.collab, href: `/${locale}/board?t=collab` },
  ];
  const typeLabel: Record<string, string> = {
    hiring: t.board.hiring,
    open_to_work: t.board.openToWork,
    collab: t.board.collab,
  };

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight mb-2">
        {t.board.title}
      </h1>
      <p className="text-ink-secondary text-[15px] mb-8">{t.board.subtitle}</p>

      {isLoggedIn ? (
        <div className="mb-8">
          <ListingForm locale={locale} products={myProducts} t={t.listing} boardT={t.board} />
        </div>
      ) : (
        <Link
          href={`/${locale}/login`}
          className="inline-block mb-8 text-brand hover:text-brand-hover font-semibold"
        >
          {t.board.loginToPost}
        </Link>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tb) => (
          <Link
            key={tb.key}
            href={tb.href}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
              tab === tb.key
                ? 'bg-ink text-bg border-ink'
                : 'bg-surface border-border text-ink-secondary hover:border-border-strong'
            }`}
          >
            {tb.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="text-ink-secondary">{t.board.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wide bg-brand/10 text-brand rounded-full px-2 py-0.5">
                  {typeLabel[l.type]}
                </span>
                {l.role_title && <span className="font-bold text-[16px]" dir="auto">{l.role_title}</span>}
                <span className="text-[12px] text-ink-muted ms-auto">
                  {formatDate(l.created_at, locale)}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed whitespace-pre-line mb-3" dir="auto">
                {l.body}
              </p>
              {l.products && (
                <Link
                  href={`/${locale}/products/${l.products.slug}`}
                  className="inline-block text-brand hover:text-brand-hover text-[13px] font-semibold mb-3"
                  dir="auto"
                >
                  {l.products.name} ←
                </Link>
              )}
              <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border">
                <Link
                  href={`/${locale}/profile/${l.profiles?.username}`}
                  className="font-semibold text-[13px] hover:text-brand transition-colors"
                >
                  {l.profiles?.name ?? l.profiles?.username}
                </Link>
                {l.profiles?.is_verified && <VerifiedBadge label={t.reviews.verified} />}
                {l.profiles?.linkedin_url && (
                  <a
                    href={l.profiles.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-ink-secondary hover:text-brand transition-colors"
                  >
                    {t.listing.linkedin} ↗
                  </a>
                )}
                <div className="ms-auto">
                  <ContactListingButton
                    listingId={l.id}
                    isLoggedIn={isLoggedIn}
                    locale={locale}
                    t={t.listing}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

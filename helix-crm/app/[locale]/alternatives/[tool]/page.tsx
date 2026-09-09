import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { fetchAltProducts } from '@/lib/alternatives';
import { toolSlug } from '@/lib/slugify';
import LaunchCard from '@/components/LaunchCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tool: string }>;
}): Promise<Metadata> {
  const { locale, tool } = await params;
  const t = getDict(locale);
  try {
    const supabase = await createClient();
    const products = await fetchAltProducts(supabase);
    const match = products
      .flatMap((p) => p.alternative_to)
      .find((name) => toolSlug(name) === tool);
    if (!match) return {};
    const title = `${t.alternatives.heading}${match}`;
    return { title, description: t.alternatives.subtitle };
  } catch {
    return {};
  }
}

export default async function AlternativeToolPage({
  params,
}: {
  params: Promise<{ locale: string; tool: string }>;
}) {
  const { locale, tool } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const products = await fetchAltProducts(supabase);
  const matched = products.filter((p) =>
    (p.alternative_to ?? []).some((name) => toolSlug(name) === tool)
  );
  if (matched.length === 0) notFound();

  // שם התצוגה של הכלי (מהערך המקורי הראשון שתואם)
  const toolName =
    products.flatMap((p) => p.alternative_to).find((name) => toolSlug(name) === tool) ?? tool;

  const rows = matched
    .map((p) => ({ product: p, launch: (p.launches ?? [])[0] ?? null }))
    .filter((r) => r.launch)
    .sort((a, b) => (b.launch!.votes_count ?? 0) - (a.launch!.votes_count ?? 0));

  let votedIds = new Set<string>();
  let isLoggedIn = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    isLoggedIn = true;
    if (rows.length > 0) {
      const { data: votes } = await supabase
        .from('votes')
        .select('launch_id')
        .eq('user_id', user.id)
        .in(
          'launch_id',
          rows.map((r) => r.launch!.id)
        );
      votedIds = new Set((votes ?? []).map((v: { launch_id: string }) => v.launch_id));
    }
  }

  const path = `/${locale}/alternatives/${tool}`;

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <Link
        href={`/${locale}/alternatives`}
        className="text-brand hover:text-brand-hover text-[14px] font-semibold"
      >
        ← {t.alternatives.backToAll}
      </Link>
      <h1
        className="font-display text-[clamp(26px,5vw,40px)] font-extrabold tracking-tight mt-3 mb-8"
        dir="auto"
      >
        {t.alternatives.heading}
        {toolName}
      </h1>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <LaunchCard
            key={r.launch!.id}
            locale={locale}
            path={path}
            isLoggedIn={isLoggedIn}
            hasVoted={votedIds.has(r.launch!.id)}
            launch={r.launch!}
            product={{
              name: r.product.name,
              slug: r.product.slug,
              tagline: r.product.tagline,
              logo_url: r.product.logo_url,
              status: r.product.status,
            }}
          />
        ))}
      </div>
    </div>
  );
}

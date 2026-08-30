import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { fetchAltProducts, groupTools } from '@/lib/alternatives';

export const dynamic = 'force-dynamic';

export default async function AlternativesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);

  let tools: { slug: string; name: string; count: number }[] = [];
  try {
    const supabase = await createClient();
    const products = await fetchAltProducts(supabase);
    tools = groupTools(products);
  } catch {
    // אין חיבור עדיין
  }

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight mb-2">
        {t.alternatives.title}
      </h1>
      <p className="text-ink-secondary text-[16px] mb-10">{t.alternatives.subtitle}</p>

      {tools.length === 0 ? (
        <p className="text-ink-secondary">{t.alternatives.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${locale}/alternatives/${tool.slug}`}
              className="card-hover bg-surface border border-border rounded-2xl p-5 flex items-center gap-3"
            >
              <ArrowLeftRight size={18} className="text-brand shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[16px]" dir="auto">
                  {t.alternatives.onProduct} {tool.name}
                </div>
                <div className="text-ink-muted text-[13px] font-mono">
                  {tool.count} {t.alternatives.count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

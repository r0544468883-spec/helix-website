import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict, categoryName } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);

  let categories: { id: number; slug: string; name_he: string; name_en: string }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('categories')
      .select('id, slug, name_he, name_en')
      .order('id');
    categories = data ?? [];
  } catch {
    // אין חיבור עדיין
  }

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight mb-10">
        {t.categoriesPage.title}
      </h1>
      {categories.length === 0 && (
        <p className="text-ink-secondary">{t.categoriesPage.empty}</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/categories/${c.slug}`}
            className="card-hover bg-surface border border-border rounded-2xl p-6 font-bold text-[17px]"
          >
            {categoryName(c, locale)}
          </Link>
        ))}
      </div>
    </div>
  );
}

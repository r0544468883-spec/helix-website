import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import SubmitForm from '@/components/SubmitForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: product } = await supabase
    .from('products')
    .select(
      'id, owner_id, name, tagline, description, website_url, logo_url, video_url, status, screenshots, alternative_to, product_categories (category_id)'
    )
    .eq('id', id)
    .maybeSingle();

  if (!product || product.owner_id !== user.id) notFound();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_he, name_en')
    .order('id');

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight mb-10">
        {t.submit.editTitle}
      </h1>
      <SubmitForm
        locale={locale}
        categories={categories ?? []}
        t={t.submit}
        statuses={t.statuses}
        mode="edit"
        productId={product.id}
        initial={{
          name: product.name,
          tagline: product.tagline,
          description: product.description ?? '',
          website: product.website_url ?? '',
          status: product.status as 'pre_launch' | 'beta' | 'live',
          categoryIds: (product.product_categories ?? []).map(
            (pc: { category_id: number }) => pc.category_id
          ),
          logoUrl: product.logo_url,
          screenshots: (product.screenshots ?? []) as string[],
          alternativeTo: (product.alternative_to ?? []) as string[],
          videoUrl: product.video_url ?? '',
        }}
      />
    </div>
  );
}

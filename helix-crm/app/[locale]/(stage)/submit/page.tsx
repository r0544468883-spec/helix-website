import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import SubmitForm from '@/components/SubmitForm';
import BecomeMakerPrompt from '@/components/BecomeMakerPrompt';

export const dynamic = 'force-dynamic';

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.user_type === 'consumer') {
    return (
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 pb-10">
        <BecomeMakerPrompt
          path={`/${locale}/submit`}
          title={t.becomeMaker.title}
          text={t.becomeMaker.text}
          button={t.becomeMaker.button}
        />
      </div>
    );
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_he, name_en')
    .order('id');

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight">
        {t.submit.title}
      </h1>
      <p className="text-ink-secondary text-[16px] mt-2 mb-10">{t.submit.subtitle}</p>
      <SubmitForm
        locale={locale}
        categories={categories ?? []}
        t={t.submit}
        statuses={t.statuses}
      />
    </div>
  );
}

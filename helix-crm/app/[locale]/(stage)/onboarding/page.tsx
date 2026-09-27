import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import OnboardingFlow from '@/components/OnboardingFlow';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({
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
    .select('name, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) redirect(`/${locale}`);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_he, name_en')
    .order('id');

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-16 pb-10">
      <h1 className="font-display text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight mb-10">
        {t.onboarding.title}
      </h1>
      <OnboardingFlow
        locale={locale}
        categories={categories ?? []}
        t={t.onboarding}
        initialName={profile?.name ?? ''}
      />
    </div>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import CampaignComposer from '@/components/CampaignComposer';
import BecomeMakerPrompt from '@/components/BecomeMakerPrompt';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage({
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
    .select('user_type, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.user_type === 'consumer') {
    return (
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 pb-10">
        <BecomeMakerPrompt path={`/${locale}/dashboard/email`} title={t.becomeMaker.title} text={t.becomeMaker.text} button={t.becomeMaker.button} />
      </div>
    );
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const { data: templates } = await supabase
    .from('email_templates')
    .select('id, name, subject, body_html')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <Link href={`/${locale}/dashboard/email`} className="text-brand hover:text-brand-hover text-[14px] font-semibold">
        ← {t.email.back}
      </Link>
      <h1 className="font-display text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight mt-3 mb-8">
        {t.email.compose}
      </h1>
      <CampaignComposer
        locale={locale}
        t={t.email}
        isAdmin={Boolean(profile?.is_admin)}
        products={(products ?? []) as { id: string; name: string }[]}
        templates={(templates ?? []) as { id: string; name: string; subject: string; body_html: string }[]}
        defaultFromEmail=""
      />
    </div>
  );
}

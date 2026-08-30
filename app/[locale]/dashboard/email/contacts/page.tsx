import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import ContactsManager from '@/components/ContactsManager';
import BecomeMakerPrompt from '@/components/BecomeMakerPrompt';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app';

export default async function ContactsPage({
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
    .select('user_type, subscribe_token')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.user_type === 'consumer') {
    return (
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 pb-10">
        <BecomeMakerPrompt path={`/${locale}/dashboard/email`} title={t.becomeMaker.title} text={t.becomeMaker.text} button={t.becomeMaker.button} />
      </div>
    );
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, email, name, tags, source')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1000);

  const embedUrl = `${SITE_URL}/embed/subscribe/${profile?.subscribe_token}?lang=${locale}`;
  const embedCode = `<iframe src="${embedUrl}" width="440" height="150" frameborder="0" style="border:none;max-width:100%;"></iframe>`;

  return (
    <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <Link href={`/${locale}/dashboard/email`} className="text-brand hover:text-brand-hover text-[14px] font-semibold">
        ← {t.email.back}
      </Link>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mt-3 mb-2">
        <h1 className="font-display text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight">{t.contacts.title}</h1>
        <span className="text-ink-muted text-[14px] font-mono">
          {(contacts ?? []).length} {t.contacts.count}
        </span>
      </div>
      <p className="text-ink-secondary text-[15px] mb-8">{t.contacts.subtitle}</p>

      <ContactsManager
        locale={locale}
        t={t.contacts}
        contacts={(contacts ?? []) as { id: string; email: string; name: string | null; tags: string[]; source: string | null }[]}
        embedCode={embedCode}
      />
    </div>
  );
}

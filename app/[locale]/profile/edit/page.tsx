import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import ProfileEditForm from '@/components/ProfileEditForm';

export const dynamic = 'force-dynamic';

export default async function ProfileEditPage({
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
    .select('name, role_title, company, linkedin_url, website_url, bio, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  // פרטים מהחשבון המחובר (OAuth: Google/LinkedIn) למשיכה אוטומטית
  const meta = user.user_metadata ?? {};
  const fromAuth = {
    name: (meta.full_name as string) || (meta.name as string) || null,
    avatar: (meta.avatar_url as string) || (meta.picture as string) || null,
  };

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight mb-2">
        {t.profileEdit.title}
      </h1>
      <p className="text-ink-secondary text-[15px] mb-8">{t.profileEdit.subtitle}</p>
      <ProfileEditForm
        locale={locale}
        t={t.profileEdit}
        fromAuth={fromAuth}
        initial={{
          name: profile?.name ?? '',
          roleTitle: profile?.role_title ?? '',
          company: profile?.company ?? '',
          linkedinUrl: profile?.linkedin_url ?? '',
          websiteUrl: profile?.website_url ?? '',
          bio: profile?.bio ?? '',
          avatarUrl: profile?.avatar_url ?? null,
        }}
      />
    </div>
  );
}

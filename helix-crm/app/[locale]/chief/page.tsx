import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChiefChat from '@/components/ChiefChat';

// HELIX CHIEF — conversational front-door over the CRM (and, later, every tool).
export const dynamic = 'force-dynamic';

export default async function ChiefPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <ChiefChat locale={locale} />
    </div>
  );
}

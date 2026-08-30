import { redirect } from 'next/navigation';

// HELIX CHIEF CRM — the app opens straight on the CRM board.
// Unauthenticated visitors are bounced to /login by the CRM page itself.
export const dynamic = 'force-dynamic';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/crm`);
}

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ExternalLink, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import { channelLabel } from '@/lib/attribution';
import Funnel from '@/components/Funnel';
import ChannelBreakdown from '@/components/ChannelBreakdown';
import ChannelConversion from '@/components/ChannelConversion';
import Trend from '@/components/Trend';
import ChannelLinks from '@/components/ChannelLinks';
import GtmSettingsForm from '@/components/GtmSettingsForm';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app';

export default async function CommandCenterPage({
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
      'id, owner_id, name, slug, tagline, status, beta_enabled, beta_whatsapp_url, beta_note, landing_enabled, landing_headline, landing_subheadline, landing_cta, launches(id, votes_count, comments_count)'
    )
    .eq('id', id)
    .maybeSingle();
  if (!product || product.owner_id !== user.id) notFound();

  const launch = (product.launches ?? [])[0] as { votes_count: number; comments_count: number } | undefined;

  // צפיות ואירועים (30 יום)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: views } = await supabase
    .from('product_views')
    .select('event, source, created_at')
    .eq('product_id', id)
    .gte('created_at', since)
    .limit(5000);

  const rows = (views ?? []) as { event: string; source: string | null; created_at: string }[];
  const viewRows = rows.filter((r) => r.event === 'view');
  const betaClicks = rows.filter((r) => r.event === 'beta_click').length;
  const totalViews = viewRows.length;

  // פילוח לפי ערוץ
  const bySource = new Map<string, number>();
  for (const r of viewRows) {
    const s = r.source || 'direct';
    bySource.set(s, (bySource.get(s) ?? 0) + 1);
  }
  const channelRows = Array.from(bySource.entries())
    .map(([source, count]) => ({ source, label: channelLabel(source), count }))
    .sort((a, b) => b.count - a.count);

  // המרה לפי ערוץ — איזה ערוץ באמת ממיר (צפייה → קליק בטא), לא רק מביא צפיות
  const convBySource = new Map<string, number>();
  for (const r of rows.filter((r) => r.event === 'beta_click')) {
    const s = r.source || 'direct';
    convBySource.set(s, (convBySource.get(s) ?? 0) + 1);
  }
  const conversionRows = channelRows
    .map((c) => {
      const conversions = convBySource.get(c.source) ?? 0;
      return {
        source: c.source,
        label: c.label,
        views: c.count,
        conversions,
        rate: c.count > 0 ? Math.round((conversions / c.count) * 100) : 0,
      };
    })
    .filter((r) => r.views > 0)
    .sort((a, b) => b.rate - a.rate || b.conversions - a.conversions);

  // מגמת 30 יום
  const dayCounts = new Map<string, number>();
  for (const r of viewRows) {
    const day = r.created_at.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const trend: { label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    trend.push({ label: d, count: dayCounts.get(d) ?? 0 });
  }

  // רשימת המתנה
  const { count: waitlistCount } = await supabase
    .from('waitlist_signups')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);

  // ציון PMF (מבחן Sean Ellis 40%)
  const { data: pmfRows } = await supabase
    .from('pmf_responses')
    .select('sentiment')
    .eq('product_id', id);
  const pmf = (pmfRows ?? []) as { sentiment: string }[];
  const pmfVery = pmf.filter((p) => p.sentiment === 'very').length;
  const pmfScore = pmf.length ? Math.round((pmfVery / pmf.length) * 100) : 0;

  // העשרת קהל — מי נרשם (מבוסס דומיין)
  const { data: wlRows } = await supabase
    .from('waitlist_signups')
    .select('email_domain, is_business')
    .eq('product_id', id);
  const wl = (wlRows ?? []) as { email_domain: string | null; is_business: boolean | null }[];
  const businessCount = wl.filter((r) => r.is_business).length;
  const byDomain = new Map<string, number>();
  for (const r of wl) {
    if (r.is_business && r.email_domain) byDomain.set(r.email_domain, (byDomain.get(r.email_domain) ?? 0) + 1);
  }
  const topCompanies = Array.from(byDomain.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // לידים (מודעות עניין למוצר)
  const { data: leadRows } = await supabase
    .from('listings')
    .select('id, body, created_at, profiles (name, username, linkedin_url)')
    .eq('type', 'collab')
    .eq('product_id', id)
    .order('created_at', { ascending: false });
  const leads = (leadRows ?? []).map((l: Record<string, unknown>) => ({
    ...l,
    profiles: Array.isArray(l.profiles) ? l.profiles[0] : l.profiles,
  })) as {
    id: string;
    body: string;
    created_at: string;
    profiles: { name: string | null; username: string; linkedin_url: string | null } | null;
  }[];

  const baseUrl = `${SITE_URL}/${locale}/products/${product.slug}`;

  return (
    <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <Link
        href={`/${locale}/dashboard`}
        className="text-brand hover:text-brand-hover text-[14px] font-semibold"
      >
        ← {t.commandCenter.back}
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3 mt-3 mb-8">
        <div>
          <h1 className="font-display text-[clamp(24px,4vw,34px)] font-extrabold tracking-tight" dir="auto">
            {product.name}
          </h1>
          <p className="text-ink-secondary text-[14px]">{t.commandCenter.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/dashboard/products/${id}/edit`}
            className="flex items-center gap-1.5 border border-border hover:border-brand text-ink-secondary hover:text-ink rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors"
          >
            <Pencil size={14} />
            {t.dashboard.edit}
          </Link>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="flex items-center gap-1.5 border border-border hover:border-brand text-ink-secondary hover:text-ink rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors"
          >
            <ExternalLink size={14} />
            {t.dashboard.viewPublic}
          </Link>
        </div>
      </div>

      {/* פאנל + מגמה */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-[16px] mb-4">{t.commandCenter.funnelTitle}</h2>
          <Funnel
            steps={[
              { label: t.commandCenter.funnelViews, value: totalViews },
              { label: t.commandCenter.funnelWaitlist, value: waitlistCount ?? 0 },
              { label: t.commandCenter.funnelBeta, value: betaClicks },
              { label: t.commandCenter.funnelVotes, value: launch?.votes_count ?? 0 },
            ]}
          />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-[16px] mb-4">{t.commandCenter.trendTitle}</h2>
          <Trend days={trend} />
          <p className="text-ink-muted text-[13px] font-mono mt-3">
            {totalViews} {t.commandCenter.views30}
          </p>
        </div>
      </div>

      {/* ערוצים — צפיות + המרה */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-[16px] mb-4">{t.commandCenter.channelsTitle}</h2>
          <ChannelBreakdown rows={channelRows} emptyLabel={t.commandCenter.channelsEmpty} />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-[16px] mb-1">{t.commandCenter.convTitle}</h2>
          <p className="text-ink-muted text-[12px] mb-4">{t.commandCenter.convHint}</p>
          <ChannelConversion rows={conversionRows} emptyLabel={t.commandCenter.channelsEmpty} />
        </div>
      </div>

      {/* ציון PMF */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-[16px] mb-1">{t.pmf.scoreTitle}</h2>
        <p className="text-ink-muted text-[12px] mb-4">{t.pmf.scoreHint}</p>
        {pmf.length === 0 ? (
          <p className="text-ink-muted text-[14px]">{t.pmf.scoreEmpty}</p>
        ) : (
          <div className="flex items-baseline gap-3">
            <span className={`font-mono text-[40px] font-extrabold ${pmfScore >= 40 ? 'text-brand' : 'text-ink'}`}>{pmfScore}%</span>
            <span className="text-ink-secondary text-[14px]">{pmf.length} {t.pmf.responses}</span>
          </div>
        )}
      </div>

      {/* העשרת קהל — מי נרשם */}
      {wl.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
          <h2 className="font-bold text-[16px] mb-1">{t.commandCenter.audienceTitle}</h2>
          <p className="text-ink-muted text-[12px] mb-4">{t.commandCenter.audienceHint}</p>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-[28px] font-bold text-brand">{businessCount}</span>
            <span className="text-ink-secondary text-[14px]">
              {t.commandCenter.audienceBusiness} · {wl.length ? Math.round((businessCount / wl.length) * 100) : 0}%
            </span>
          </div>
          {topCompanies.length > 0 && (
            <>
              <p className="text-ink-muted text-[12px] mb-2">{t.commandCenter.audienceCompanies}</p>
              <div className="flex flex-wrap gap-2">
                {topCompanies.map((c) => (
                  <span key={c.domain} className="text-[13px] bg-bg border border-border rounded-full px-3 py-1 font-mono" dir="ltr">
                    {c.domain} · {c.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* מחולל לינקים */}
      <div className="mb-8">
        <ChannelLinks
          baseUrl={baseUrl}
          t={{
            linksTitle: t.commandCenter.linksTitle,
            linksHint: t.commandCenter.linksHint,
            custom: t.commandCenter.custom,
            customPlaceholder: t.commandCenter.customPlaceholder,
            copy: t.commandCenter.copy,
            copied: t.commandCenter.copied,
          }}
        />
      </div>

      {/* הגדרות GTM */}
      <div className="mb-8">
        <GtmSettingsForm
          locale={locale}
          productId={product.id}
          slug={product.slug}
          siteUrl={SITE_URL}
          t={t.gtm}
          initial={{
            betaEnabled: product.beta_enabled ?? false,
            betaWhatsappUrl: product.beta_whatsapp_url ?? '',
            betaNote: product.beta_note ?? '',
            landingEnabled: product.landing_enabled ?? false,
            landingHeadline: product.landing_headline ?? '',
            landingSubheadline: product.landing_subheadline ?? '',
            landingCta: product.landing_cta ?? '',
          }}
        />
      </div>

      {/* לידים */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="font-bold text-[16px] mb-4">{t.commandCenter.leadsTitle}</h2>
        {leads.length === 0 ? (
          <p className="text-ink-muted text-[14px]">{t.commandCenter.leadsEmpty}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {leads.map((l) => (
              <div key={l.id} className="bg-bg border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[14px]">
                    {l.profiles?.name ?? l.profiles?.username}
                  </span>
                  {l.profiles?.linkedin_url && (
                    <a
                      href={l.profiles.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:text-brand-hover text-[12px] font-semibold"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  <span className="text-[12px] text-ink-muted ms-auto">
                    {formatDate(l.created_at, locale)}
                  </span>
                </div>
                <p className="text-[14px] text-ink-secondary whitespace-pre-line" dir="auto">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

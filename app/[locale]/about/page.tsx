import { getDict } from '@/lib/i18n';

const HELIX_URL = 'https://helix-website-nine.vercel.app/';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-16 pb-10">
      <h1 className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight mb-8">
        {t.about.title}
      </h1>
      <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-ink">
        <p>{t.about.p1}</p>
        <p>{t.about.p2}</p>
        <p>{t.about.p3}</p>
      </div>

      <div className="bg-soft border border-border rounded-2xl p-8 mt-12">
        <h2 className="font-extrabold text-[20px]">{t.about.helixCtaTitle}</h2>
        <p className="text-ink-secondary text-[15px] mt-2 mb-5">{t.about.helixCtaText}</p>
        <a
          href={HELIX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-brand hover:bg-brand-hover text-bg font-bold px-6 py-3 rounded-[10px] transition-colors"
        >
          {t.about.helixCtaButton}
        </a>
      </div>
    </div>
  );
}

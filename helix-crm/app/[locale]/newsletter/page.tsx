import { getDict } from '@/lib/i18n';
import NewsletterForm from '@/components/NewsletterForm';

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 pb-10">
      <h1 className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight">
        {t.newsletter.title}
      </h1>
      <p className="text-ink-secondary text-[17px] mt-3 mb-8">{t.newsletter.subtitle}</p>
      <NewsletterForm
        locale={locale}
        placeholder={t.product.emailPlaceholder}
        buttonLabel={t.newsletter.button}
        doneLabel={t.newsletter.done}
      />
    </div>
  );
}

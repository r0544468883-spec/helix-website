import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, faqSchema, contentPageSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../../components/ScrollReveal';
import ArticleShell from '../../components/ArticleShell';
import { USE_CASES, getUseCase } from '../use-cases-data';

export const dynamic = 'force-static';

// Shared across every persona (methodology persona-template trick): the "how it
// works" is identical, only the Hero + pains change per audience.
const HOW: { n: string; title: string; text: string }[] = [
  { n: '01', title: 'מגישים בקשה', text: 'אומרים במילים פשוטות מה צריך. בלי הכשרה, בלי הגדרות מסובכות.' },
  { n: '02', title: 'הצוות מבצע', text: 'סוכנים מתכננים, עושים, ומבקר פוסל תוכן או פעולה חלשה.' },
  { n: '03', title: 'אתם מאשרים', text: 'עוברים, עורכים בלחיצה, מאשרים. מתג אוטונומיה בשליטתכם.' },
  { n: '04', title: 'רץ לבד', text: 'ברגע שאתם בוטחים, מדליקים אוטופיילוט לפעולה, והיא רצה בלעדיכם.' },
];

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) return {};
  const url = `/use-cases/${u.slug}`;
  return {
    title: u.metaTitle,
    description: u.excerpt,
    alternates: { canonical: url },
    openGraph: { title: `${u.title} | HELIX.`, description: u.excerpt, url, type: 'website', images: ['/opengraph-image'] },
  };
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) notFound();

  const url = `${SITE.url}/use-cases/${u.slug}`;
  return (
    <>
      <JsonLd
        data={[
          contentPageSchema({ name: u.title, description: u.excerpt, path: `/use-cases/${u.slug}` }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'למי זה מתאים', url: `${SITE.url}/use-cases` },
            { name: u.persona, url },
          ]),
          faqSchema(u.faq),
        ]}
      />

      <ArticleShell
        category={u.persona}
        title={u.title}
        lede={u.lede}
        tldr={u.tldr}
        faq={u.faq}
        related={u.related}
        ctaTitle="נראה לכם איך זה נראה על העסק שלכם?"
        ctaText="שיחת היכרות של 30 דקות, בלי התחייבות. נבין מה צריך ונגיד בכנות אם ואיך נוכל לעזור."
        backHref="/use-cases"
        backLabel="← לכל הקהלים"
        className="usecase-single"
      >
        <div className="article-body">
          <h2>הכאב</h2>
        </div>
        <ScrollReveal className="usecase-pains" direction="up" stagger staggerDelay={0.08}>
          {u.pains.map((p) => (
            <div key={p.title} className="usecase-pain">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </ScrollReveal>

        <div className="article-body">
          <h2>איך זה עובד</h2>
        </div>
        <ScrollReveal className="usecase-how" direction="up" stagger staggerDelay={0.08}>
          {HOW.map((s) => (
            <div key={s.n} className="usecase-how-step">
              <span className="usecase-how-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </ScrollReveal>

        <div className="article-body">
          <h2>{u.fitTitle}</h2>
          <ul>
            {u.fit.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </ArticleShell>
    </>
  );
}

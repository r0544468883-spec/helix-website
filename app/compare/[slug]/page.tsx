import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, faqSchema, contentPageSchema, countWords } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import ArticleShell from '../../components/ArticleShell';
import { COMPARISONS, getComparison } from '../compare-data';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return {};
  const url = `/compare/${c.slug}`;
  return {
    title: c.metaTitle,
    description: c.excerpt,
    alternates: { canonical: url },
    openGraph: { title: `${c.title} | HELIX.`, description: c.excerpt, url, type: 'article', images: ['/opengraph-image'] },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  const url = `${SITE.url}/compare/${c.slug}`;
  return (
    <>
      <JsonLd
        data={[
          contentPageSchema({
            name: c.title,
            description: c.excerpt,
            path: `/compare/${c.slug}`,
            wordCount: countWords(
              c.tldr,
              c.lede,
              c.intro,
              c.tradeoff,
              c.rows.flatMap((r) => [r.dim, r.helix, r.other]),
              (c.body ?? []).flatMap((s) => [s.h2, ...s.paras]),
              c.faq.flatMap((f) => [f.q, f.a])
            ),
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'השוואות', url: `${SITE.url}/compare` },
            { name: c.title, url },
          ]),
          faqSchema(c.faq),
        ]}
      />

      <ArticleShell
        category="השוואה"
        title={c.title}
        lede={c.lede}
        tldr={c.tldr}
        faq={c.faq}
        related={c.related}
        ctaTitle="לא בטוחים שזה מתאים לכם?"
        ctaText="שיחת היכרות של 30 דקות. נבין מה צריך ונגיד בכנות אם ואיך נוכל לעזור, וגם אם התשובה היא שעדיף לכם אחרת."
        backHref="/compare"
        backLabel="← לכל ההשוואות"
        className="compare-single"
      >
        <div className="article-body">
          <ScrollTextHighlight>
            {c.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </ScrollTextHighlight>

          <h2>{c.rowsTitle}</h2>
          <ScrollReveal direction="up" className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th scope="col">HELIX</th>
                  <th scope="col">{c.against}</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((r, i) => (
                  <tr key={i}>
                    <th scope="row">{r.dim}</th>
                    <td data-label="HELIX">{r.helix}</td>
                    <td data-label={c.against}>{r.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollReveal>

          {/* Honest "when the alternative wins" — the trust differentiator (methodology §3.5). */}
          <h2 data-role="limits">{c.tradeoffTitle}</h2>
          {c.tradeoff.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {c.body?.map((sec, i) => (
            <div key={i}>
              <h2>{sec.h2}</h2>
              {sec.paras.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </ArticleShell>
    </>
  );
}

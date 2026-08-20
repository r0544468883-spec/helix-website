import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import { ARTICLES, getArticle, type Block } from '../articles-data';
import ClusterSiblings from '@/app/components/ClusterSiblings';
import NewsletterForm from '../NewsletterForm';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | HELIX.`,
      description: article.excerpt,
      url,
      type: 'article',
      images: ['/opengraph-image'],
      publishedTime: article.datePublished,
    },
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={i}>{block.text}</h2>;
    case 'p':
      return <p key={i}>{block.text}</p>;
    case 'quote':
      return <blockquote key={i}>{block.text}</blockquote>;
    case 'list':
      return (
        <ul key={i}>
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    case 'sources':
      return (
        <section key={i} className="article-sources" aria-label="מקורות">
          <h2>{block.title || 'מקורות'}</h2>
          <ol>
            {block.items.map((s, j) => (
              <li key={j}>
                <a href={s.href} target="_blank" rel="noopener noreferrer nofollow">
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      );
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE.url}/articles/${article.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    inLanguage: 'he-IL',
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: article.category,
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
    // Answer engines read speakable to lift the H1 + answer-first summary.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.article-tldr'],
    },
  };

  return (
    <>
      <JsonLd
        data={[
          articleSchema,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מאמרים', url: `${SITE.url}/articles` },
            { name: article.title, url },
          ]),
          ...(article.faq && article.faq.length > 0 ? [faqSchema(article.faq)] : []),
        ]}
      />

      <article className="article-single">
        <div className="container container-narrow">
          <div className="article-meta">
            <span className="category">{article.category}</span>
            <span className="dot">·</span>
            <span>{article.readTime}</span>
            <span className="dot">·</span>
            <span>{article.dateLabel}</span>
          </div>
          <h1>{article.title}</h1>
          <p className="article-lede">{article.lede}</p>

          {article.tldr && (
            <div className="article-tldr">
              <span className="article-tldr-label">בקצרה</span>
              <p>{article.tldr}</p>
            </div>
          )}

          <div className="article-body">{article.body.map(renderBlock)}</div>

          {article.faq && article.faq.length > 0 && (
            <div className="article-faq">
              <h2>שאלות ותשובות</h2>
              <dl>
                {article.faq.map((f, i) => (
                  <div key={i} className="article-faq-item">
                    <dt>{f.q}</dt>
                    <dd>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {article.related && article.related.length > 0 && (
            <div className="article-related">
              <h2>להעמיק בנושא</h2>
              <ul>
                {article.related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href}>{r.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ClusterSiblings slug={article.slug} />

          <div className="article-byline">
            מאת {article.author} · HELIX.
          </div>

          <div className="article-cta">
            <h2>רוצים לדבר על העסק שלכם?</h2>
            <p>שיחת היכרות של 30 דקות, בלי התחייבות. נבין מה צריך ונגיד בכנות אם ואיך נוכל לעזור.</p>
            <a href={SITE.calendlyUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              לקביעת שיחה
            </a>
            <Link href="/articles" className="article-back">← לכל המאמרים</Link>
          </div>
        </div>
      </article>

      <section className="newsletter">
        <div className="container">
          <h2>
            מאמר חדש לאימייל,<br />פעם בחודש.
          </h2>
          <p>
            ניוזלטר חודשי, בלי spam, בלי מבצעים. רק התראה כשמאמר חדש מתפרסם, וכמה מילות הקדמה.
          </p>
          <NewsletterForm />
          <p className="newsletter-note">בכל רגע אפשר להסיר את עצמך. כתובת האימייל לא תופץ.</p>
        </div>
      </section>
    </>
  );
}

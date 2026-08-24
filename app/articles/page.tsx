import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import NewsletterForm from './NewsletterForm';
import ArticlesFilter from './ArticlesFilter';
import { ARTICLES } from './articles-data';
import ArticleChart from '../components/ArticleChart';
import GlossaryBook from '../components/GlossaryBook';
import { ARTICLE_GRAPHICS } from '../components/graphics/registry';

export const metadata: Metadata = {
  title: 'מאמרים',
  description:
    'טקסטים ארוכים על פיתוח, שיווק, ואסטרטגיה. בלי טיפים, בלי קליקבייט. עברית בעיקר.',
  alternates: { canonical: '/articles' },
  openGraph: {
    title: 'מאמרים | HELIX.',
    description:
      'טקסטים ארוכים על פיתוח, שיווק, ואסטרטגיה. בלי טיפים, בלי קליקבייט.',
    url: '/articles',
    type: 'website',
    images: ['/opengraph-image'],
  },
};

// The glossary is always the lead of the blog. Articles follow it by upload
// order, newest first (datePublished is an ISO 'YYYY-MM-DD' string).
const articles = [...ARTICLES].sort((a, b) => b.datePublished.localeCompare(a.datePublished));

// Category -> ascii slug, so the CSS filter (globals.css) can match on data-cat.
const CAT_SLUG: Record<string, string> = {
  'שיווק': 'marketing',
  'פיתוח עסקי': 'bizdev',
  'ניתוח נתונים': 'data',
};
// Categories actually present, in a stable order, for the filter chips.
const usedCategories = ['שיווק', 'פיתוח עסקי', 'ניתוח נתונים']
  .filter((label) => articles.some((a) => a.category === label))
  .map((label) => ({ slug: CAT_SLUG[label], label }));

export default function ArticlesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'בית', url: SITE.url },
          { name: 'מאמרים', url: `${SITE.url}/articles` },
        ])}
      />
      <section className="page-header">
        <div className="container">
          <div className="eyebrow">מאמרים</div>
          <h1>
            טקסטים ארוכים<br />על מה שבאמת עובד.
          </h1>
          <p className="intro">
            פיתוח, שיווק, אסטרטגיה, וניהול פרויקטים. בלי "10 טיפים", בלי קליקבייט. רק נושאים בעומק, מהיומיום של עבודה עם לקוחות אמיתיים. עברית בעיקר.
          </p>
        </div>
      </section>

      <section className="articles">
        <div className="container">
          <Link href="/glossary" className="article-featured">
            <div className="featured-image"><GlossaryBook /></div>
            <div>
              <div className="article-meta">
                <span className="category">מילון מושגים</span>
                <span className="dot">·</span>
                <span>מתעדכן תמיד</span>
              </div>
              <h2>מילון המושגים של HELIX</h2>
              <p className="excerpt">כל מונחי השיווק, הצמיחה וה-AI שאנחנו משתמשים בהם, ראש-גשר, ICP, קוהורט, שכבת AI שפועלת, מתג אוטונומיה ועוד, בהגדרות קצרות בעברית פשוטה, כל אחת עם קישור למאמר שנכנס לעומק.</p>
              <span className="read-more">למילון המושגים ←</span>
            </div>
          </Link>

          <Link href="/learn" className="topic-hub-link">
            מחפשים לפי נושא? מרכז הלמידה מסדר את המאמרים למסלולים, עמוד-עוגן לכל תחום ומאמרי המשך סביבו ←
          </Link>

          <ArticlesFilter categories={usedCategories}>
            {articles.map((article) => {
              const Graphic = ARTICLE_GRAPHICS[article.slug];
              return (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="article-item" data-cat={CAT_SLUG[article.category] ?? 'other'}>
                <div className="article-image">
                  {Graphic ? <Graphic /> : <ArticleChart slug={article.slug} />}
                </div>
                <div>
                  <div className="article-meta">
                    <span className="category">{article.category}</span>
                    <span className="dot">·</span>
                    <span>{article.readTime}</span>
                    <span className="dot">·</span>
                    <span>{article.dateLabel}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p className="excerpt">{article.excerpt}</p>
                  <span className="read-more">לקריאה ←</span>
                </div>
              </Link>
              );
            })}
          </ArticlesFilter>
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <h2>
            מאמר חדש לאימייל,<br />פעם בחודש.
          </h2>
          <p>
            ניוזלטר חודשי, בלי spam, בלי מבצעים, בלי "עוד טיפ אחד". רק התראה כשמאמר חדש מתפרסם, וכמה מילות הקדמה ממני.
          </p>
          <NewsletterForm />
          <p className="newsletter-note">
            בכל רגע אפשר להסיר את עצמך. כתובת האימייל לא תופץ.
          </p>
        </div>
      </section>
    </>
  );
}

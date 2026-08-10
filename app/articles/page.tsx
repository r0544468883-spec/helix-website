import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import NewsletterForm from './NewsletterForm';
import { ARTICLES } from './articles-data';
import ArticleChart from '../components/ArticleChart';

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

const featured = ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
const articles = ARTICLES.filter((a) => a.slug !== featured.slug);

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
          <Link href={`/articles/${featured.slug}`} className="article-featured">
            <div className="featured-image"><ArticleChart slug={featured.slug} /></div>
            <div>
              <div className="article-meta">
                <span className="category">{featured.category}</span>
                <span className="dot">·</span>
                <span>{featured.readTime}</span>
                <span className="dot">·</span>
                <span>{featured.dateLabel}</span>
              </div>
              <h2>{featured.title}</h2>
              <p className="excerpt">{featured.excerpt}</p>
              <span className="read-more">לקריאה ←</span>
            </div>
          </Link>

          <div className="article-list">
            {articles.map((article) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="article-item">
                <div className="article-image"><ArticleChart slug={article.slug} /></div>
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
            ))}
          </div>
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

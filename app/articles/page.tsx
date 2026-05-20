import type { Metadata } from 'next';
import NewsletterForm from './NewsletterForm';

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
  },
};

interface FeaturedArticle {
  href: string;
  category: string;
  readTime: string;
  date: string;
  title: string;
  excerpt: string;
}

interface Article {
  href: string;
  category: string;
  readTime: string;
  date: string;
  title: string;
  excerpt: string;
}

const featured: FeaturedArticle = {
  href: '#',
  category: 'על הדרך שלנו',
  readTime: '4 דקות קריאה',
  date: '[תאריך]',
  title: 'למה אנחנו לא נותנים הצעת מחיר באתר.',
  excerpt:
    'מחיר באתר זה anchor. בעלי עסקים מגיעים לשיחה עם מספר כבר בראש, וזה הופך את כל השיחה ל"להסכים על מה שראיתי" במקום "לבנות יחד פתרון". המאמר הזה מסביר למה החלטנו לא לפרסם מחירים, ואיך זה משפיע על תהליך המכירה.',
};

const articles: Article[] = [
  {
    href: '#',
    category: 'קמפיינים',
    readTime: '7 דקות',
    date: '[תאריך]',
    title: '300 לידים, 30 לידים, או 3: איך לקרוא קמפיין באמת.',
    excerpt:
      'סוכנויות אוהבות להבטיח "X לידים בעלות Y", אבל המספר הזה לבד לא אומר כלום. הנה איך לקרוא את הנתונים של הקמפיין שלך בלי שיעבדו עליך - מה השאלות לשאול, איזה מטריקות באמת חשובות, ואיך מבינים אם הספק עושה עבודה טובה.',
  },
  {
    href: '#',
    category: 'ניהול פרויקטים',
    readTime: '6 דקות',
    date: '[תאריך]',
    title: 'המפתח והשיווקיסט שלא מדברים. למה זה כל כך שכיח.',
    excerpt:
      'החטא הקדמון של רוב הפרויקטים: שני ספקים שאף אחד מהם לא רואה את התמונה השלמה. המאמר הזה מציע 3 דרכים פרקטיות לפתור את זה - גם אם אתה לא עובד איתנו.',
  },
  {
    href: '#',
    category: 'ניהול פרויקטים',
    readTime: '9 דקות',
    date: '[תאריך]',
    title: 'המדריך לאפיון פרויקט שלא נופל באמצע.',
    excerpt:
      'Scope creep הורג יותר פרויקטים מבעיות טכניות. הנה תהליך אפיון בן 5 שלבים שאנחנו משתמשים בו מ-2020, ואת המסמך הסטנדרטי שאנחנו חותמים עליו לפני שמתחילים פרויקט.',
  },
  {
    href: '#',
    category: 'פיתוח',
    readTime: '11 דקות',
    date: '[תאריך]',
    title: 'OCR בעברית: למה רוב הפתרונות נכשלים, ואיך פתרנו את זה.',
    excerpt:
      'פיתחנו pipeline של OCR לתעודות משלוח בעברית במסגרת datashop.co.il. הגענו מ-40% דיוק ל-94% עם כמה החלטות ארכיטקטוניות. המאמר הזה מפרט את הצעדים, את הכלים, ואת הטעויות שעשינו בדרך.',
  },
];

export default function ArticlesPage() {
  return (
    <>
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
          <a href={featured.href} className="article-featured">
            <div className="featured-image">תמונת מאמר</div>
            <div>
              <div className="article-meta">
                <span className="category">{featured.category}</span>
                <span className="dot">·</span>
                <span>{featured.readTime}</span>
                <span className="dot">·</span>
                <span>{featured.date}</span>
              </div>
              <h2>{featured.title}</h2>
              <p className="excerpt">{featured.excerpt}</p>
              <span className="read-more">לקריאה ←</span>
            </div>
          </a>

          <div className="article-list">
            {articles.map((article) => (
              <a key={article.title} href={article.href} className="article-item">
                <div className="article-image">תמונה</div>
                <div>
                  <div className="article-meta">
                    <span className="category">{article.category}</span>
                    <span className="dot">·</span>
                    <span>{article.readTime}</span>
                    <span className="dot">·</span>
                    <span>{article.date}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p className="excerpt">{article.excerpt}</p>
                  <span className="read-more">לקריאה ←</span>
                </div>
              </a>
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

import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';

export const metadata: Metadata = {
  title: 'פודקאסט',
  description:
    'שיחות עם founders ובעלי עסקים ישראלים על מה באמת קורה מאחורי הקלעים. פרק חדש כל שבועיים.',
  alternates: { canonical: '/podcast' },
  openGraph: {
    title: 'פודקאסט | HELIX.',
    description:
      'שיחות עם founders ובעלי עסקים ישראלים על מה באמת קורה מאחורי הקלעים.',
    url: '/podcast',
    type: 'website',
  },
};

interface SubscribeLink {
  label: string;
  href: string;
}

const subscribeLinks: SubscribeLink[] = [
  { label: 'Spotify', href: '#' },
  { label: 'Apple Podcasts', href: '#' },
  { label: 'YouTube', href: '#' },
];

interface Episode {
  num: string;
  title: string;
  desc: string;
  date: string;
  duration: string;
  links?: string;
}

const featuredEpisode = {
  num: 'PODCAST · EP 03',
  title: 'המסעדה שלקחה 7 חודשים להשיק - והטעות שעלתה 200K.',
  date: '[תאריך]',
  duration: '47 דקות',
  intro: 'שיחה עם [שם בעל המסעדה] על הקמת מסעדה מהקצה השני.',
  desc: 'הוא תכנן להשיק תוך 3 חודשים. בפועל זה לקח 7. השיחה הזו על מה השתבש - הפיתוח של המערכת, הקמפיין שיצא חצי שנה מוקדם מדי, ולמה אף אחד מהספקים לא דיבר אחד עם השני. ולמה הוא בכל זאת הצליח.',
};

const episodes: Episode[] = [
  {
    num: 'EP 03',
    title: 'המסעדה שלקחה 7 חודשים להשיק - והטעות שעלתה 200K.',
    desc:
      'שיחה עם [שם] על הקמת מסעדה מהקצה השני. למה התכנון של 3 חודשים הפך ל-7. למה הקמפיין שיצא מוקדם הוריד אותה לאחור. ולמה היא בכל זאת הצליחה.',
    date: '[תאריך]',
    duration: '47 דקות',
    links: '12 קישורים בתיאור',
  },
  {
    num: 'EP 02',
    title: 'איך לבנות 12 סניפים בלי VP טכנולוגיות.',
    desc:
      'ראיון עם [שם] שבנה רשת של 12 סניפים בענף ההסעדה בלי לגייס VP טכנולוגיות. אילו החלטות הוא קיבל בדרך, איפה הוא טעה, ולמה הוא חושב ש-Fractional CTO היה יכול לקצר לו 18 חודשים.',
    date: '[תאריך]',
    duration: '52 דקות',
    links: '8 קישורים',
  },
  {
    num: 'EP 01',
    title: 'הקמפיין שכמעט הרסנו, ומה למדנו ממנו.',
    desc:
      'הפרק הראשון. סיפור על קמפיין Google Ads שהפעלנו ב-2024 ללקוח SaaS, איך טעינו בכמה החלטות critical בשבועיים הראשונים, איך הצלחנו לתקן, ומה זה לימד אותנו על איך אנחנו עובדים עם לקוחות חדשים מאז.',
    date: '[תאריך]',
    duration: '38 דקות',
    links: '5 קישורים',
  },
];

const podcastSchema = {
  '@context': 'https://schema.org',
  '@type': 'PodcastSeries',
  name: 'HELIX. Podcast',
  description:
    'שיחות עם founders ובעלי עסקים ישראלים על מה באמת קורה מאחורי הקלעים.',
  url: `${SITE.url}/podcast`,
  inLanguage: 'he-IL',
  author: { '@type': 'Person', name: 'Eran Lipshtain' },
};

export default function PodcastPage() {
  return (
    <>
      <JsonLd
        data={[
          podcastSchema,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'פודקאסט', url: `${SITE.url}/podcast` },
          ]),
        ]}
      />

      <section className="page-header">
        <div className="container">
          <div className="eyebrow">פודקאסט</div>
          <h1>
            שיחות אמיתיות.<br />בלי "סיפורי הצלחה".
          </h1>
          <p className="intro">
            פעם בשבועיים, שיחה של 45 דקות עם founder או בעל עסק ישראלי על מה <em>באמת</em> קרה מאחורי הקלעים. הטעויות שעלו ביוקר, ההחלטות שלא היו ברורות, והשעות 3 בלילה שאחרי כל זה.
          </p>

          <div className="subscribe-bar">
            {subscribeLinks.map((link) => (
              <a key={link.label} href={link.href} className="subscribe-btn">
                <span className="symbol" aria-hidden="true"></span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-episode">
        <div className="container">
          <div className="featured-card">
            <div className="episode-art">
              <div className="ep-number">{featuredEpisode.num}</div>
              <h3 className="ep-title">{featuredEpisode.title}</h3>
              <div className="ep-meta">
                {featuredEpisode.date} · {featuredEpisode.duration}
              </div>
            </div>

            <div className="episode-info">
              <div className="featured-label">הפרק האחרון</div>
              <h2>{featuredEpisode.intro}</h2>
              <p className="ep-description">{featuredEpisode.desc}</p>
              <button className="play-btn" type="button">
                <span className="play-icon" aria-hidden="true"></span>
                השמע פרק
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="episodes">
        <div className="container">
          <div className="episodes-header">
            <h2 className="episodes-title">כל הפרקים</h2>
            <span className="episodes-count">
              {episodes.length} פרקים · פרק חדש כל שבועיים
            </span>
          </div>

          <div className="episode-list">
            {episodes.map((ep) => (
              <div key={ep.num} className="episode-item">
                <div className="ep-num">{ep.num}</div>
                <div>
                  <h3 className="episode-title">{ep.title}</h3>
                  <p className="episode-desc">{ep.desc}</p>
                  <div className="episode-meta">
                    {ep.date} <span className="dot">·</span> {ep.duration}
                    {ep.links && (
                      <>
                        {' '}
                        <span className="dot">·</span> {ep.links}
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="ep-play"
                  type="button"
                  aria-label={`השמע פרק ${ep.num}`}
                >
                  <span className="play-icon-small" aria-hidden="true"></span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

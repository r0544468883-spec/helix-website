import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'שיווק דיגיטלי · Hands-on',
  description: 'מאסטרטגיה ועד ביצוע. קמפיינים, SEO, סושיאל ותוכן. 500 ₪ לחודש.',
};

export default function MarketingPage() {
  return (
    <section className="service-page">
      <div className="container">
        <p className="service-tag">חבילה 01</p>
        <h1 className="service-title">שיווק דיגיטלי · Hands-on</h1>
        <p className="service-subtitle">מאסטרטגיה ועד ביצוע. אנחנו לא רק ממליצים, אנחנו מריצים.</p>
        <div className="service-price">500 &#8362; <small>/ לחודש</small></div>
        <div className="service-body">
          <p>דף השירות בבנייה. בקרוב כאן יהיה מידע מלא על חבילת השיווק הדיגיטלי.</p>
        </div>
      </div>
    </section>
  );
}

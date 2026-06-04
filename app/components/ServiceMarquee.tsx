'use client';

const services = [
  'בניית אתרים',
  'שיווק דיגיטלי',
  'אוטומציה שיווקית',
  'פיתוח עסקי',
  'פיתוח תוכנה',
  'AI Chatbots',
  'SEO',
  'Google Ads',
  'Meta Ads',
  'CRM',
  'Email Automation',
  'Landing Pages',
  'eCommerce',
  'Data Enrichment',
  'LinkedIn Sales Navigator',
];

export default function ServiceMarquee() {
  const doubled = [...services, ...services];

  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <span key={i} className="service-pill">{s}</span>
        ))}
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * רצועת "עובדים עם" לדפי GTM Engineering — לוגואים אמיתיים של הפלטפורמות.
 * כל פריט עם `src` מרנדר לוגו; פריט בלי קובץ לוגו (fallback) מרנדר צ'יפ טקסט,
 * כדי שכלי שעדיין אין לו PNG (Clay/Marketo) לא ישבור את הרצועה. ברגע שמפילים
 * את הקובץ ל-public/logos, מוסיפים לו `src` והוא הופך אוטומטית ללוגו.
 */
type Logo = { src?: string; alt: string };

const CRM: Logo[] = [
  { src: '/logos/hubspot.png', alt: 'HubSpot' },
  { src: '/logos/salesforce.svg', alt: 'Salesforce' },
  { src: '/logos/zoho.svg', alt: 'Zoho' },
  { src: '/logos/pipedrive.svg', alt: 'Pipedrive' },
];

// שורת ה-CRM משותפת (הערך הוא שאנחנו חוצי-CRM). שורת ה-Stack משתנה לפי הדף:
// שיווק = כלי שיווק (Meta/Google/LinkedIn/Mailchimp), מכירות = כלי מכירות (ZoomInfo/Gong/Lusha/Aircall).
const STACKS: Record<'marketing' | 'sales' | 'hub', Logo[]> = {
  marketing: [
    { src: '/logos/clay.png', alt: 'Clay' },
    { src: '/logos/apollo.png', alt: 'Apollo' },
    { src: '/logos/meta.png', alt: 'Meta Ads' },
    { src: '/logos/google-ads.png', alt: 'Google Ads' },
    { src: '/logos/linkedin.png', alt: 'LinkedIn' },
    { src: '/logos/mailchimp.svg', alt: 'Mailchimp' },
    { src: '/logos/make.png', alt: 'Make' },
    { src: '/logos/n8n.png', alt: 'n8n' },
  ],
  sales: [
    { src: '/logos/clay.png', alt: 'Clay' },
    { src: '/logos/apollo.png', alt: 'Apollo' },
    { src: '/logos/zoominfo.png', alt: 'ZoomInfo' },
    { src: '/logos/gong.png', alt: 'Gong' },
    { src: '/logos/lusha.png', alt: 'Lusha' },
    { src: '/logos/aircall.svg', alt: 'Aircall' },
    { src: '/logos/slack.png', alt: 'Slack' },
    { src: '/logos/make.png', alt: 'Make' },
  ],
  hub: [
    { src: '/logos/clay.png', alt: 'Clay' },
    { src: '/logos/apollo.png', alt: 'Apollo' },
    { src: '/logos/zoominfo.png', alt: 'ZoomInfo' },
    { src: '/logos/gong.png', alt: 'Gong' },
    { src: '/logos/meta.png', alt: 'Meta Ads' },
    { src: '/logos/make.png', alt: 'Make' },
    { src: '/logos/n8n.png', alt: 'n8n' },
    { src: '/logos/slack.png', alt: 'Slack' },
  ],
};

function LogoItem({ logo }: { logo: Logo }) {
  const [failed, setFailed] = useState(false);
  if (!logo.src || failed) {
    return <span className="gtm-logo-chip">{logo.alt}</span>;
  }
  return (
    <span className="gtm-logo-item" title={logo.alt}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={112}
        height={40}
        style={{ height: 28, width: 'auto', objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export default function GtmLogoStrip({
  variant = 'hub',
  title = 'עובדים על הכלים שאתם כבר משתמשים בהם',
  subtitle = 'חוצה CRM ומעבר לו. מחברים את המערכות שלכם במקום להחליף אותן.',
}: { variant?: 'marketing' | 'sales' | 'hub'; title?: string; subtitle?: string }) {
  const STACK = STACKS[variant];
  return (
    <section className="gtm-logos-section">
      <style>{`
        .gtm-logos-section { padding: clamp(40px, 7vw, 72px) 0; }
        .gtm-logos-head { text-align: center; margin-bottom: 28px; }
        .gtm-logos-head h2 { font-size: clamp(1.3rem, 3vw, 1.9rem); font-weight: 800; margin-bottom: 8px; }
        .gtm-logos-head p { color: var(--ink-muted); max-width: 560px; margin: 0 auto; line-height: 1.55; font-size: 0.98rem; }
        .gtm-logos-group { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center; max-width: 900px; margin: 0 auto; }
        .gtm-logos-group + .gtm-logos-group { margin-top: 14px; }
        /* אריח לבן-שקוף כדי שכל לוגו (צבעוני או כהה) יהיה קריא על הרקע הכהה, עם הצבעים האמיתיים של המותג */
        .gtm-logo-item, .gtm-logo-chip { display: inline-flex; align-items: center; justify-content: center; height: 56px; padding: 0 22px; border: 1px solid rgba(255,255,255,0.10); border-radius: 14px; background: rgba(255,255,255,0.94); box-shadow: 0 2px 10px rgba(0,0,0,0.18); transition: transform 0.2s, box-shadow 0.2s; }
        .gtm-logo-item:hover, .gtm-logo-chip:hover { transform: translateY(-3px); box-shadow: 0 6px 18px color-mix(in srgb, var(--brand) 30%, rgba(0,0,0,0.25)); }
        .gtm-logo-item img { opacity: 1; }
        .gtm-logo-chip { font-weight: 800; font-size: 0.95rem; color: #0b3b2e; letter-spacing: 0.01em; }
      `}</style>
      <div className="container">
        <div className="gtm-logos-head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="gtm-logos-group">
          {CRM.map((l) => <LogoItem key={l.alt} logo={l} />)}
        </div>
        <div className="gtm-logos-group">
          {STACK.map((l) => <LogoItem key={l.alt} logo={l} />)}
        </div>
      </div>
    </section>
  );
}

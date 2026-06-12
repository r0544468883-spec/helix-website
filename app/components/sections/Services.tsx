'use client';

import { useState } from 'react';
import SectionHeader from '../SectionHeader';
import { SITE } from '@/lib/site';

const whatsappHref = (msg: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;

type Addon = { name: string; price: string };

type Package = {
  tag: string;
  name: string;
  pitch: string;
  target: string;
  items: string[];
  bonuses: string[];
  addons?: Addon[];
  price: string;
  priceNote?: string;
  marketPrice?: string;
  ctaMsg: string;
  href: string;
};

const corePackages: Package[] = [
  {
    tag: 'חבילה 01',
    name: 'שיווק דיגיטלי · Hands-on',
    pitch: 'מאסטרטגיה ועד ביצוע. אנחנו לא רק ממליצים, אנחנו מריצים.',
    target: 'לעסקים שרוצים שיווק אמיתי עם תוצאות מדידות, לא דוחות עם impressions.',
    items: [
      'אסטרטגיית שיווק, מחקר קהלים ומסרים',
      'ניהול קמפיינים: Google · Meta · TikTok',
      'SEO אורגני + GEO (אופטימיזציה למנועי AI)',
      'ניהול סושיאל, תוכן וקריאייטיב',
      'דוחות שקופים: לידים ומכירות, לא impressions',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'שיחת אסטרטגיה ראשונה חינם'],
    addons: [
      { name: 'מאמר SEO מותאם', price: '550 ₪' },
      { name: 'SEO בסיסי לעמוד', price: '350 ₪' },
      { name: 'SEO מתקדם לעמוד', price: '1,200 ₪' },
      { name: 'שעת ייעוץ דיגיטלי', price: '350 ₪' },
    ],
    price: '500',
    marketPrice: '5,000–8,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק',
    href: '/services/marketing',
  },
  {
    tag: 'חבילה 02',
    name: 'אתרים ואיקומרס',
    pitch: 'מאסטרטגיה ועד תחזוקה שוטפת. האתר עולה לאוויר ונשאר חי.',
    target: 'לעסקים שצריכים אתר שעובד, לא אתר שיושב.',
    items: [
      'אפיון ואסטרטגיית אתר / חנות',
      'עיצוב UX/UI ופיתוח מלא',
      'חנות eCommerce · דף נחיתה · אתר תדמית',
      'חיבור פיקסלים, אוטומציות ו-WhatsApp',
      'SEO בסיסי + תחזוקה, עדכונים וגיבויים שוטפים',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'בלי דמי הקמה'],
    addons: [
      { name: 'עמוד אינטרנט נוסף', price: '480 ₪' },
      { name: 'הקמת תשתית בלוג', price: '550 ₪' },
      { name: 'תרגום שפה לעמוד', price: '480 ₪' },
      { name: 'תחזוקה מורחבת חודשית', price: '350 ₪/חודש' },
      { name: 'פיתוח WordPress לשעה', price: '220 ₪' },
      { name: 'פיתוח בקוד לשעה', price: '450 ₪' },
    ],
    price: '500',
    marketPrice: '8,000–15,000 חד פעמי',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אתרים',
    href: '/services/websites',
  },
  {
    tag: 'חבילה 03',
    name: 'אוטומציות',
    pitch: 'מאסטרטגיה, דרך הטמעה, ועד ניהול שוטף של כל התהליך.',
    target: 'לעסקים שעייפו מעבודה ידנית ורוצים שהמכונה תעבוד בשבילם.',
    items: [
      'מיפוי תהליכים ואסטרטגיית אוטומציה',
      'הטמעת כלים: CRM · Email Automation · Lead Nurturing',
      'בניית Funnel אוטומטי מקצה לקצה',
      'מעקב, ניהול ואופטימיזציה שוטפת',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'מיפוי תהליכים ראשוני חינם'],
    addons: [
      { name: 'איסוף לידים ל-Google Sheets', price: '350 ₪' },
      { name: 'חיבור לידים ל-CRM', price: 'החל מ-650 ₪' },
      { name: 'הקמת מערכת דיוור', price: '750 ₪' },
      { name: 'בניית סדרת אימיילים', price: '350 ₪/שעה' },
    ],
    price: '500',
    marketPrice: '4,000–7,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אוטומציה',
    href: '/services/automation',
  },
  {
    tag: 'חבילה 04',
    name: 'Growth Hacking',
    pitch: 'צמיחה מהירה בשיטות לא שגרתיות. ניסויים, אופטימיזציה, ותוצאות.',
    target: 'לסטארטאפים ועסקים שרוצים לצמוח מהר בלי לשרוף תקציבים.',
    items: [
      'אסטרטגיית צמיחה מותאמת לעסק',
      'ניסויי A/B ואופטימיזציית המרות',
      'Funnel analysis ושיפור ביצועים',
      'Viral loops ותוכניות referral',
      'Growth metrics ודשבורד מותאם',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'אבחון צמיחה ראשוני חינם'],
    price: '500',
    marketPrice: '6,000–12,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על Growth Hacking',
    href: '/services/growth',
  },
  {
    tag: 'חבילה 05',
    name: 'תהליכי מכירה אוטומטיים',
    pitch: 'SDR שעובד 24/7. בניית מערך פיתוח עסקי אוטומטי מקצה לקצה.',
    target: 'לעסקי B2B שרוצים לידים חמים בלי להגדיל צוות מכירות.',
    items: [
      'בניית אסטרטגיית מכירות דיגיטלית',
      'חיבור Data Enrichment + LinkedIn Sales Navigator',
      'הקמת תהליכי SDR אוטומטיים',
      'ניהול pipeline אוטומטי ב-CRM',
      'Outreach sequences מותאמים אישית',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'מיפוי ICP ראשוני חינם'],
    price: '500',
    marketPrice: '8,000–15,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על תהליכי מכירה אוטומטיים',
    href: '/services/sales',
  },
];

const extraPackages: Package[] = [
  {
    tag: 'גישה לתוכנות',
    name: 'הכלים של HELIX',
    pitch: 'התוכנות שכבר בנינו ושנמשיך לבנות. בתשלום חודשי, בלי לפתח מאפס.',
    target: 'לעסקים שצריכים כלי עבודה מוכנים עם תמיכה מלאה.',
    items: [
      'גישה מלאה לתוכנה, כולל עדכונים ותמיכה',
      'לדוגמה: Datashop — ניהול מלאי לאיקומרס עם AI',
      'ניתן להכין פיצ׳רים נוספים בהתאמה אישית',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['שבוע ניסיון חינם'],
    price: '500',
    priceNote: 'לתוכנה בודדת · חבילת 3 תוכנות ב-1,000 ₪',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על התוכנות',
    href: '/services/tools',
  },
  {
    tag: 'פיתוח בהתאמה',
    name: 'בנק שעות פיתוח ואפיון',
    pitch: 'לתוכנות ואפליקציות בהתאמה אישית. גמיש לפי הצורך שלכם.',
    target: 'כשיש משימה ברורה ולא בטוחים איך לבצע.',
    items: [
      'שעות פיתוח ואפיון לפי בנק שעות',
      'MVP · פיצ׳ר חדש · אינטגרציה · אפליקציה',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['שיחת אפיון ראשונה חינם'],
    addons: [
      { name: 'פיתוח WordPress', price: '220 ₪/שעה' },
      { name: 'פיתוח בקוד', price: '450 ₪/שעה' },
      { name: 'שעת ייעוץ דיגיטלי', price: '350 ₪/שעה' },
    ],
    price: 'לפי הצעה',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על פיתוח בהתאמה',
    href: '/services/development',
  },
];

function PackageCard({ pkg }: { pkg: Package }) {
  const [showAddons, setShowAddons] = useState(false);

  return (
    <div className="pk-card">
      <div className="pk-card-header">
        <div className="pk-tag">{pkg.tag}</div>
        <h3 className="pk-name">{pkg.name}</h3>
        <p className="pk-pitch">{pkg.pitch}</p>
      </div>
      <div className="pk-card-body">
        <p className="pk-target">{pkg.target}</p>

        <div className="pk-section-label">מה כלול</div>
        <ul className="pk-features">
          {pkg.items.map((item) => (
            <li key={item} className="pk-feature">
              <span className="pk-check">✓</span>{item}
            </li>
          ))}
        </ul>

        {pkg.bonuses.length > 0 && (
          <>
            <div className="pk-section-label pk-bonus-label">בונוסים</div>
            <ul className="pk-features">
              {pkg.bonuses.map((bonus) => (
                <li key={bonus} className="pk-feature pk-bonus">
                  <span className="pk-gift">🎁</span>{bonus}
                </li>
              ))}
            </ul>
          </>
        )}

        {pkg.marketPrice && (
          <div className="pk-market">
            <span className="pk-market-old">בשוק: {pkg.marketPrice} ₪/חודש</span>
          </div>
        )}

        <div className="pk-price-area">
          <div className="pk-price">
            {pkg.price === 'לפי הצעה' ? pkg.price : <>{pkg.price} <span className="pk-currency">₪</span></>}
            {pkg.price !== 'לפי הצעה' && <small>/ לחודש</small>}
          </div>
          {pkg.priceNote && <div className="pk-price-note">{pkg.priceNote}</div>}
        </div>

        <a
          href={whatsappHref(pkg.ctaMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="pk-cta"
        >
          דברו איתנו בוואטסאפ
        </a>

        {pkg.addons && pkg.addons.length > 0 && (
          <div className="pk-addons">
            <button
              className={`pk-addons-toggle ${showAddons ? 'open' : ''}`}
              onClick={() => setShowAddons(!showAddons)}
            >
              אפשר להוסיף {showAddons ? '▲' : '▼'}
            </button>
            {showAddons && (
              <div className="pk-addons-list">
                {pkg.addons.map((addon) => (
                  <div key={addon.name} className="pk-addon-row">
                    <span>{addon.name}</span>
                    <b>{addon.price}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <a href={pkg.href} className="pk-more-link">
          פרטים נוספים על החבילה ←
        </a>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section className="packages-section" id="packages">
      <div className="container">
        <SectionHeader
          eyebrow="החבילות"
          titleHtml="שבע חבילות. 500 &#8362; לחודש כל אחת."
          description="בינה מלאכותית חתכה לנו את שעות העבודה. במקום לשבת על ההפרש, העברנו אותו אליכם. כל חבילה כוללת הכל, מאסטרטגיה ועד ביצוע. בלי הפתעות."
        />

        <div className="pk-trust">
          <span>✓ בלי חוזה</span>
          <span>✓ בלי התחייבות</span>
          <span>✓ ביטול בכל עת</span>
          <span>✓ עשרות לקוחות מרוצים</span>
        </div>

        <div className="pk-grid pk-grid-3">
          {corePackages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.tag} pkg={pkg} />
          ))}
        </div>

        <div className="pk-grid pk-grid-2">
          {corePackages.slice(3, 5).map((pkg) => (
            <PackageCard key={pkg.tag} pkg={pkg} />
          ))}
        </div>

        <div className="pk-divider-line"><span>חבילות נוספות</span></div>

        <div className="pk-grid pk-grid-2">
          {extraPackages.map((pkg) => (
            <PackageCard key={pkg.tag} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}

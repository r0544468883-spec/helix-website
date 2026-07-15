'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../SectionHeader';
import { SITE } from '@/lib/site';

const ScissorsLottie = dynamic(() => import('../ScissorsLottie'), { ssr: false });

const whatsappHref = (msg: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;

type Addon = { name: string; price: string };

type SubPackage = { name: string; price: string; popular?: boolean };

type Package = {
  tag: string;
  name: string;
  pitch: string;
  target: string;
  items: string[];
  bonuses: string[];
  addons?: Addon[];
  subPackages?: SubPackage[];
  subPackagesLabel?: string;
  price: string;
  priceFrom?: boolean;
  priceNote?: string;
  priceUnit?: string;
  marketPrice?: string;
  ctaMsg: string;
  href: string;
  showAllInclusive?: boolean;
};

export const corePackages: Package[] = [
  {
    tag: 'חבילה 01',
    name: 'שיווק דיגיטלי · Hands-on',
    pitch: 'קמפיין שפועל. לידים שמגיעים. דוח שאפשר לקרוא בלי תרגום.',
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
    bonuses: ['בלי חוזה, ביטול בכל עת', 'בלי דמי הקמה', 'שיחת אסטרטגיה ראשונה חינם', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    addons: [
      { name: 'מאמר SEO מותאם', price: '550 ₪ · חד פעמי' },
      { name: 'SEO בסיסי לעמוד', price: '350 ₪ · חד פעמי' },
      { name: 'SEO מתקדם לעמוד', price: '1,200 ₪ · חד פעמי' },
      { name: 'שעת ייעוץ דיגיטלי', price: '350 ₪ · חד פעמי' },
      { name: 'ניתוח אטריביוציה — מעקב שמראה איזה ערוץ באמת הביא את הליד', price: '1,400 ₪ · חד פעמי' },
      { name: 'מיפוי מילות מפתח ל-AI Search', price: '800 ₪ · חד פעמי' },
      { name: 'ריטרגטינג דינמי — מודעות שרודפות מבקרים שכבר היו באתר, עם תוכן מותאם', price: '650 ₪ · חד פעמי' },
      { name: 'ניתוח מתחרים ממומן (Ad Intelligence)', price: '750 ₪ · חד פעמי' },
      { name: 'קמפיין Brand Awareness (Taboola / Outbrain)', price: '800 ₪ · חודשי' },
    ],
    price: '1,250',
    priceFrom: true,
    marketPrice: '5,000–8,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק',
    href: '/services/marketing',
    showAllInclusive: true,
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
    bonuses: ['בלי חוזה, ביטול בכל עת', 'בלי דמי הקמה', 'שיחה ראשונית לאפיון אתר ללא עלות', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    addons: [
      { name: 'עמוד אינטרנט נוסף', price: '480 ₪ · חד פעמי' },
      { name: 'הקמת תשתית בלוג', price: '550 ₪ · חד פעמי' },
      { name: 'תרגום שפה לעמוד', price: '480 ₪ · חד פעמי' },
      { name: 'תחזוקה מורחבת', price: '350 ₪ · חודשי' },
      { name: 'פיתוח WordPress לשעה', price: '220 ₪ · לשעה' },
      { name: 'פיתוח בקוד (או בנק שעות בחבילת פיתוח)', price: '350 ₪ · לשעה' },
      { name: 'הטמעת נגישות (תקן 5568)', price: '1,200 ₪ · חד פעמי' },
      { name: 'הקמת Progressive Web App (PWA)', price: '1,500 ₪ · חד פעמי' },
      { name: 'מיקרו-אנימציות ואינטראקציות', price: '900 ₪ · חד פעמי' },
      { name: 'אופטימיזציית מהירות + CDN', price: '650 ₪ · חד פעמי' },
    ],
    price: '1,250',
    priceFrom: true,
    marketPrice: '8,000–15,000 חד פעמי',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אתרים',
    href: '/services/websites',
    showAllInclusive: true,
  },
  {
    tag: 'חבילה 03',
    name: 'אוטומציות וסוכני AI',
    pitch: 'לידים נכנסים, סוכן AI עונה, הודעות נשלחות, סטטוסים מתעדכנים — הכל אוטומטי. הילדים הטובים מסדרים את התהליכים שלך.',
    target: 'לעסקים שעייפו מעבודה ידנית ורוצים שהמכונה תעבוד בשבילם.',
    items: [
      'מיפוי תהליכים ואסטרטגיית אוטומציה',
      'הטמעת כלים: CRM · Email · WhatsApp · Lead Nurturing',
      'בניית Funnel אוטומטי מקצה לקצה',
      'שיחת אפיון ללא עלות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'בלי דמי הקמה', 'מיפוי תהליכים ראשוני חינם', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    subPackagesLabel: 'חבילות האוטומציה שלנו הן בעלות חד פעמית:',
    subPackages: [
      { name: 'צינור מכירה', price: 'מ-300 ₪' },
      { name: 'קביעת פגישות', price: 'מ-650 ₪' },
      { name: 'אוטומציית לידים', price: 'מ-980 ₪', popular: true },
      { name: 'תשלומים וגבייה', price: 'מ-1,000 ₪' },
      { name: 'בהתאמה אישית', price: 'לפי שעות' },
    ],
    price: '300',
    priceFrom: true,
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
      'AI Chatbot אחד לבחירה (פייסבוק / אינסטגרם / לינקדאין / אתר Live Chat)',
      'דוח מתחרים ומיפוי שוק חודשי',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'בלי דמי הקמה', 'אבחון צמיחה ראשוני חינם', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    addons: [
      { name: 'צ׳אטבוט נוסף לפלטפורמה נוספת', price: '600 ₪ · חודשי' },
      { name: 'חיזוק פרופיל לינקדין — 4 פוסטים חודשיים מותאמים לקהל היעד', price: '600 ₪ · חודשי' },
      { name: 'בניית תוכנית הפניות (Referral) מקצה לקצה', price: '1,800 ₪ · חד פעמי' },
      { name: 'מגנט לידים חכם — קוויז, מחשבון או כלי AI שמושך לידים', price: '1,200 ₪ · חד פעמי' },
      { name: 'איסוף לידים אוטומטי מלינקדין, גוגל ורשתות', price: '600 ₪ · חודשי' },
      { name: 'גיימיפיקציה לאתר — אלמנטים אינטראקטיביים שמגדילים מעורבות', price: '1,500 ₪ · חד פעמי' },
      { name: 'מנוע ביקורות — בקשת ביקורות גוגל אוטומטית + ניטור אזכורים ברשת', price: '500 ₪ · חודשי' },
      { name: 'סדנת חוויית משתמש לצמיחה — חצי יום עם הצוות: מיפוי חיכוכים ו-5 שיפורים מיידיים', price: '2,200 ₪ · חד פעמי' },
      { name: 'בניית כלי שיווקי — מחשבון, בודק או כלי חינמי שמושך לידים לאתר שלכם', price: '2,500 ₪ · חד פעמי' },
      { name: 'בדיקת מוכנות AI — האם העסק מונגש ל-ChatGPT, Gemini ו-Claude', price: '1,600 ₪ · חד פעמי' },
      { name: 'ספרינט צמיחה — 3 ניסויים ב-14 ימים, ביצוע מהיר, מדידה ודוח תוצאות', price: '1,800 ₪ · חד פעמי' },
    ],
    price: '1,250',
    priceFrom: true,
    marketPrice: '6,000–12,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על Growth Hacking',
    href: '/services/growth',
    showAllInclusive: true,
  },
  {
    tag: 'חבילה 05',
    name: 'תהליכי מכירה אוטומטיים',
    pitch: 'SDR שעובד 24/7. בניית מערך פיתוח עסקי אוטומטי מקצה לקצה.',
    target: 'לעסקי B2B שרוצים לידים חמים בלי להגדיל צוות מכירות.',
    items: [
      'בניית אסטרטגיית מכירות דיגיטלית',
      'חיבור Data Enrichment + LinkedIn Sales Navigator',
      'הקמת תהליכי SDR אוטומטיים (לינקדאין או אימייל)',
      'ניהול pipeline אוטומטי ב-CRM',
      'Outreach sequences מותאמים אישית',
      'A/B טסטינג למסרי פנייה — בדיקה מה עובד הכי טוב',
      'דשבורד מכירות + דוח ROI שבועי',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['בלי חוזה, ביטול בכל עת', 'בלי דמי הקמה', 'מיפוי ICP ראשוני חינם', 'פגישת ייעוץ ראשונה חינם', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    addons: [
      { name: 'העשרת רשומות B2B — הוספת מיילים, טלפונים ונתונים לרשימה קיימת', price: '490 ₪ · חודשי' },
      { name: 'ניהול תיבת לינקדין — מענה להודעות נכנסות וניתוב לידים חמים', price: '390 ₪ · חודשי' },
      { name: 'כתיבת סדרת מסרים מותאמת אישית', price: '650 ₪ · חודשי' },
      { name: 'מעקב אוטומטי — שליחת תזכורות למי שלא הגיב למייל או הודעה', price: '350 ₪ · חודשי' },
      { name: 'בניית רשימת לקוחות פוטנציאליים (1,000 רשומות לפי פרופיל אידיאלי)', price: '850 ₪ · חודשי' },
      { name: 'זיהוי לידים חמים — התראה כשמישהו מגלה עניין (פתח מייל, ביקר באתר)', price: '550 ₪ · חודשי' },
      { name: 'פנייה רב-ערוצית — רצף שמשלב לינקדין + אימייל + וואטסאפ בתזמון חכם', price: '1,100 ₪ · חודשי' },
    ],
    price: '1,250',
    priceFrom: true,
    marketPrice: '8,000–15,000',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על תהליכי מכירה אוטומטיים',
    href: '/services/sales',
    showAllInclusive: true,
  },
];

export const extraPackages: Package[] = [
  {
    tag: 'פיתוח בהתאמה',
    name: 'בנק שעות פיתוח, אפיון וייעוץ טרנספורמציה עסקית לבינה מלאכותית',
    pitch: 'פיתוח, אפיון, ייעוץ AI — גמיש לפי הצורך שלכם.',
    target: 'לעסקים שצריכים פיתוח, אפיון או ייעוץ טרנספורמציה לבינה מלאכותית.',
    items: [
      'שעת פיתוח או ייעוץ — 300 ₪',
      '3 שעות — 800 ₪ · חוסכים 100 ₪',
      'ספרינט 5 שעות — 1,250 ₪ · חוסכים 250 ₪ ⭐ מומלץ',
      'Pay As You Go מעל 10 שעות — 220 ₪ לשעה · חוסכים 80 ₪ לשעה',
      'דוח חודשי מפורט',
    ],
    bonuses: ['שיחת אפיון ראשונה חינם', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    price: '300',
    priceFrom: true,
    priceUnit: 'לשעה',
    priceNote: 'חבילות מ-800 ₪',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על בנק שעות פיתוח וייעוץ AI',
    href: '/services/development',
  },
  {
    tag: 'גישה לתוכנות',
    name: 'הכלים של HELIX',
    pitch: 'התוכנות שכבר בנינו ושנמשיך לבנות. בתשלום חודשי, בלי לפתח מאפס.',
    target: 'לעסקים שצריכים כלי עבודה מוכנים עם תמיכה מלאה.',
    items: [
      'גישה מלאה לתוכנה, כולל עדכונים ותמיכה',
      'פיצ׳רים נוספים בהתאמה אישית ברכישת שעות פיתוח',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    bonuses: ['שבוע ניסיון חינם', '20% הנחה ליזמים, סטארטאפים ועסקים קטנים'],
    price: '1,250',
    priceFrom: true,
    priceNote: '* או 500 ₪ לתוכנה בודדת',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על התוכנות',
    href: '/services/tools',
  },
];

export function PackageCard({ pkg }: { pkg: Package }) {
  const [showAddons, setShowAddons] = useState(false);
  const [showAllInclusive, setShowAllInclusive] = useState(false);

  return (
    <div className="pk-card">
      <div className="pk-card-header">
        <div className="pk-tag">{pkg.tag}</div>
        <h3 className="pk-name">{pkg.name}</h3>
        <p className="pk-pitch">{pkg.pitch}</p>
      </div>

      <div className="pk-card-body">
        {/* Price — hero element at the top */}
        <div className="pk-price-area">
          <div className="pk-price">
            {pkg.price === 'לפי הצעה'
              ? pkg.price
              : <>{pkg.priceFrom ? `החל מ-${pkg.price}` : pkg.price} <span className="pk-currency">₪</span></>}
          </div>
          {pkg.price !== 'לפי הצעה' && <div className="pk-price-sub">{pkg.priceUnit || 'לחודש'}</div>}
          {pkg.priceNote && <div className="pk-price-note">{pkg.priceNote}</div>}
          {pkg.marketPrice && (
            <div className="pk-market-inline">במקום {pkg.marketPrice} ₪</div>
          )}
        </div>

        {/* Description */}
        <div className="pk-target-wrap">
          <span className="pk-target-label">מיועד ל:</span>
          <p className="pk-target">{pkg.target}</p>
        </div>

        {/* Features */}
        <div className="pk-section-label">מה כלול?</div>
        <ul className="pk-features">
          {pkg.items.map((item) => (
            <li key={item} className="pk-feature">
              <span className="pk-check">✓</span>{item}
            </li>
          ))}
        </ul>

        {pkg.bonuses.length > 0 && (
          <ul className="pk-features pk-bonuses">
            {pkg.bonuses.map((bonus) => (
              <li key={bonus} className="pk-feature pk-bonus">
                <span className="pk-gift">🎁</span>{bonus}
              </li>
            ))}
          </ul>
        )}

        {/* Sub-packages chips */}
        {pkg.subPackages && pkg.subPackages.length > 0 && (
          <div className="pk-sub-packages">
            <div className="pk-sub-label">{pkg.subPackagesLabel || 'חבילות הקמה:'}</div>
            <div className="pk-sub-grid">
              {pkg.subPackages.map((sp) => (
                <a key={sp.name} href={pkg.href} className="pk-sub-chip">
                  <span className="pk-sub-chip-name">{sp.name}{sp.popular ? ' ⭐' : ''}</span>
                  <span className="pk-sub-chip-price">{sp.price}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA — pushed to bottom */}
        <a
          href={whatsappHref(pkg.ctaMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="pk-cta"
        >
          דברו איתנו
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
                {pkg.showAllInclusive && (
                  <div
                    className={`pk-all-inclusive ${showAllInclusive ? 'revealed' : ''}`}
                    onClick={() => setShowAllInclusive(true)}
                  >
                    <div className="pk-all-inclusive-blur">
                      <span className="pk-all-inclusive-icon">✨</span>
                      <span>או פשוט — <strong>הכל כלול ב-5,000 ₪ לחודש</strong></span>
                    </div>
                    {!showAllInclusive && (
                      <div className="pk-all-inclusive-overlay">
                        <span>גרדו כדי לגלות 🎁</span>
                      </div>
                    )}
                  </div>
                )}
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
        <div className="pk-intro-row">
          <div className="pk-intro-text">
            <SectionHeader
              eyebrow="החבילות"
              titleHtml="שבע חבילות. החל מ-1,250 &#8362; לחודש."
              description="כל שירות כולל אסטרטגיה, ביצוע, דוח חודשי ופגישה שבועית. מחיר קבוע. בלי שעות נוספות, בלי הפתעות."
            />
          </div>
          <div className="pk-intro-lottie" aria-hidden="true">
            <ScissorsLottie />
          </div>
        </div>

        <div className="pk-trust">
          <span>✓ בלי חוזה</span>
          <span>✓ ביטול בכל עת</span>
          <span>✓ פגישה שבועית קבועה ביומן</span>
          <span>✓ 30+ לקוחות מרוצים</span>
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

        <div className="pk-bottom-cta">
          <p className="pk-bottom-cta-text">ראיתם מה מתאים לכם? שלחו הודעה ונסגור פגישת היכרות.</p>
          <a
            href={whatsappHref('שלום, ראיתי את helix.co.il ורציתי לשמוע עוד על החבילות')}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            דברו איתנו בוואטסאפ
          </a>
          <span className="pk-bottom-note">✓ בלי חוזה &middot; ✓ תשובה תוך שעות</span>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, type Product } from '../products-data';
import ProductPageClient from '../ProductPageClient';

// DEMO — coherence variant of the HELIX OPS product page. Reuses the EXACT same data,
// images, screens, logos, video and components as /products/marketing-ops, and only
// overrides the text fields that carry the "one coherent product" narrative:
//   • hero reframed from "content manager" to "one team that does content + budget +
//     engagement" — content is no longer the ceiling.
//   • the browser extension positioned as the agent's invisible hands, not a 2nd product.
//   • the how-it-works loop shows all three jobs as ONE flow under ONE autonomy switch.
// Nothing visual is redesigned — this is a messaging/packaging demo on localhost.

export const metadata: Metadata = {
  title: 'HELIX OPS — גרסת קוהרנטיות (דמו)',
  robots: { index: false, follow: false },
};

function coherentProduct(): Product | null {
  const base = getProduct('marketing-ops');
  if (!base) return null;
  return {
    ...base,
    eyebrow: 'מוצר · צוות שיווק אוטונומי',
    title:
      "<span class='hero-from'>לא עוד מנהל תוכן</span><br/><span class='hero-to'>צוות שיווק שלם שעובד לבד</span>",
    subtitle:
      'מערכת אחת שעושה את כל העבודה: מייצרת ומפרסמת תוכן, מנהלת ומייעלת את תקציב הפרסום, ומגיבה בסושיאל והופכת תגובות ללידים. הכל בעברית, במקום אחד, ברמת האוטונומיה שאתם בוחרים, מהמלצה ועד אוטופיילוט. התוסף בדפדפן הוא פשוט הידיים של הסוכן, לא עוד כלי שצריך ללמוד.',
    heroResult: 'צוות שלם. מסך אחד.',
    steps3: ['מייצר ומפרסם', 'מנהל תקציב', 'מגיב והופך ללידים'],
    narrative1: {
      h2: 'לא שלושה כלים. מערכת אחת.',
      paragraphs: [
        'מתחרים גלובליים נותנים לכם עוד כלי לתזמון פוסטים. את התקציב אתם עדיין מנהלים במקום אחר, את התגובות במקום שלישי, ומדביקים הכל ביד.',
        'HELIX OPS הוא צוות סוכנים אחד: אותו מוח שמייצר את התוכן גם מפרסם אותו, גם מנהל את התקציב הממומן, וגם מגיב בשמכם והופך תגובות ללידים. משטח אחד, התחברות אחת, סיפור אחד.',
      ],
      highlight: 'אתם לא לומדים שלוש מערכות. אתם מפעילים צוות אחד, ובוחרים כמה חופש לתת לו.',
    },
    scrolly: [
      { kicker: 'שלב 1', title: 'מבקשים במילים', text: 'כותבים מה צריך, פוסט, קמפיין, מודעה. אותו לוח אחד לכל בקשה.', icon: '📝' },
      { kicker: 'שלב 2', title: 'הצוות מייצר ומפרסם', text: 'ה-AI מנסח תוכן מותאם-מותג לכל רשת, בקולכם, ומפיץ ל-9 ערוצים בזמן הנכון.', icon: '🚀' },
      { kicker: 'שלב 3', title: 'ומנהל את התקציב', text: 'אותה מערכת מנקדת כל קריאייטיב, עוצרת מפסידים ומזרימה תקציב למנצחים, במקום סוכנות.', icon: '📊' },
      { kicker: 'שלב 4', title: 'ומגיב, והופך ללידים', text: 'הצוות מגיב בסושיאל בשמכם והופך תגובות ל-DM וללידים, הכל תחת מתג אוטונומיה אחד.', icon: '💬' },
    ],
    finalCtaTitle: 'צוות שיווק שלם. מסך אחד.',
    finalCtaSubtitle:
      'תוכן, תקציב ו-engagement, במערכת אחת בעברית, ברמת האוטונומיה שאתם בוחרים. בואו נראה לכם איך זה נראה על המותג שלכם.',
  };
}

export default function MarketingOpsCoherentDemo() {
  const product = coherentProduct();
  if (!product) notFound();
  return <ProductPageClient product={product} />;
}

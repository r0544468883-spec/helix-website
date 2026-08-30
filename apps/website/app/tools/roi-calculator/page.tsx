import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../../components/ScrollReveal';
import Calculator from './Calculator';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'מחשבון ROI: לעשות לבד מול HELIX',
  description: 'כמה עולה לכם באמת העבודה החוזרת בשעות, ומתי מנוי HELIX מחזיר את עצמו. מחשבון כנה, כולל התשובה שעדיף לכם ידני.',
  alternates: { canonical: '/tools/roi-calculator' },
};

export default function RoiCalculatorPage() {
  const url = `${SITE.url}/tools/roi-calculator`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מחשבון ROI', url },
          ]),
        ]}
      />
      <ScrollReveal direction="up">
        <div className="page-header container">
          <h1>מחשבון ROI</h1>
          <p className="page-header-sub">
            לא כמה HELIX עולה, אלא כמה עולה לכם היום לעשות את זה לבד. אם המספר יוצא לרעתנו, נגיד לכם.
          </p>
        </div>
      </ScrollReveal>

      <div className="container container-narrow">
        <Calculator />
        <p className="roi-disclaimer">
          החישוב שמרני: שעות כפול שווי-שעה מול מנוי חודשי. בלי מכפילי ROI מומצאים. המספר האמיתי תלוי בכמה משימות חוזרות יש לכם.
        </p>
        <div className="article-cta" data-role="cta">
          <h2>רוצים את המספר המדויק לעסק שלכם?</h2>
          <p>בשיחת היכרות נעבור על העבודה החוזרת שלכם ונגיד בכנות אם ואיפה מערכת תחזיר את עצמה.</p>
          <a href={SITE.calendlyUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            לקביעת שיחה
          </a>
          <Link href="/learn" className="article-back">← למרכז הלמידה</Link>
        </div>
      </div>
    </>
  );
}

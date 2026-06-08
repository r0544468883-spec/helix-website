import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import ToolsShowcase from '../../components/ToolsShowcase';

export const metadata: Metadata = {
  title: 'הכלים של HELIX',
  description: 'גישה לתוכנות שכבר בנינו. תוכנה בודדת 500 ₪/חודש, חבילת 3 תוכנות 1,000 ₪/חודש.',
};

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על התוכנות')}`;

export default function ToolsPage() {
  return (
    <section className="service-page">
      <div className="container">
        <p className="service-tag">גישה לתוכנות</p>
        <h1 className="service-title">הכלים של HELIX</h1>
        <p className="service-subtitle">
          התוכנות שכבר בנינו ושנמשיך לבנות. בתשלום חודשי, בלי לפתח מאפס.
          ניתן להכין פיצ׳רים נוספים בהתאמה אישית.
        </p>

        <div className="tools-pricing-summary">
          <div className="tools-pricing-item">
            <span>תוכנה בודדת</span>
            <b>500 &#8362; / חודש</b>
          </div>
          <div className="tools-pricing-item">
            <span>חבילת 3 תוכנות</span>
            <b>1,000 &#8362; / חודש</b>
          </div>
        </div>

        <ToolsShowcase />

        <div className="tools-cta">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            דברו איתנו על תוכנות
          </a>
        </div>
      </div>
    </section>
  );
}

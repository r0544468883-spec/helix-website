import { SITE } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer-new">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-col footer-brand">
            <div className="footer-logo-big">HELIX<span className="dot">.</span></div>
            <p className="footer-tagline">הילדים הטובים של עולם הדיגיטל.</p>
            <p className="footer-sub">מבטיחים פחות. מספקים יותר.</p>
          </div>

          {/* Column 2: Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">שירותים</h4>
            <a href="/services/marketing">שיווק דיגיטלי</a>
            <a href="/services/websites">בניית אתרים</a>
            <a href="/services/ecommerce">איקומרס</a>
            <a href="/services/automation">אוטומציות</a>
            <a href="/services/growth">Growth Hacking</a>
            <a href="/services/sales">תהליכי מכירה</a>
            <a href="/services/development">פיתוח תוכנה</a>
          </div>

          {/* Column 3: Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">החברה</h4>
            <a href="#cases">פרויקטים</a>
            <a href="#faq">שאלות נפוצות</a>
            <a href="#about">אודות</a>
            <a href="/articles">מאמרים</a>
            <a href="/podcast">פודקאסט</a>
            <a href="/privacy">מדיניות פרטיות</a>
          </div>

          {/* Column 4: Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">דברו איתנו</h4>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
            <a href="https://www.linkedin.com/in/eranlipi/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} HELIX. כל הזכויות שמורות.</span>
          <span>Founded by Eran Lipshtain & Ron Keli</span>
        </div>
      </div>
    </footer>
  );
}

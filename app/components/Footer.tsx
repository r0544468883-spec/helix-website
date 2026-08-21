import { SITE } from '@/lib/site';
import CookieSettingsLink from './CookieSettingsLink';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

/** Social profiles that are actually configured (label + url). */
const socialLinks = (
  [
    ['LinkedIn', SITE.social.linkedin],
    ['Facebook', SITE.social.facebook],
    ['Instagram', SITE.social.instagram],
    ['YouTube', SITE.social.youtube],
    ['TikTok', SITE.social.tiktok],
    ['X', SITE.social.x],
  ] as const
).filter(([, url]) => Boolean(url));

const addressLine = [SITE.address.street, SITE.address.city, SITE.address.postalCode]
  .filter(Boolean)
  .join(', ');

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
            <h2 className="footer-col-title">שירותים</h2>
            <a href="/services/automation">אוטומציות ובוטים</a>
            <a href="/services/ai-consulting">ליווי והטמעת AI</a>
            <a href="/services/development">פיתוח תוכנה ואפליקציות</a>
            <a href="/services/growth">Growth Hacking</a>
            <a href="/products/sdr">תהליכי מכירה</a>
            <a href="/products">התוכנות של HELIX</a>
          </div>

          {/* Column 3: Company */}
          <div className="footer-col">
            <h2 className="footer-col-title">החברה</h2>
            <a href="#cases">פרויקטים</a>
            <a href="#faq">שאלות נפוצות</a>
            <a href="#about">אודות</a>
            <a href="/partners">תכנית שותפים</a>
            <a href="/articles">מאמרים</a>
            <a href="/glossary">מילון מושגים</a>
            <a href="/podcast">פודקאסט</a>
            <a href="/privacy">מדיניות פרטיות</a>
            <a href="/accessibility">הצהרת נגישות</a>
            <CookieSettingsLink />
          </div>

          {/* Column 4: Learn & resources (the content machine) */}
          <div className="footer-col">
            <h2 className="footer-col-title">למידה ומשאבים</h2>
            <a href="/learn">מרכז הלמידה</a>
            <a href="/compare">השוואות</a>
            <a href="/use-cases">למי זה מתאים</a>
            <a href="/playbook">המדריך התפעולי</a>
            <a href="/tools/roi-calculator">מחשבון ROI</a>
            <a href="/trust">שקיפות ואמון</a>
          </div>

          {/* Column 5: Contact */}
          <div className="footer-col">
            <h2 className="footer-col-title">דברו איתנו</h2>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
            {socialLinks.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} HELIX. כל הזכויות שמורות.</span>
          {SITE.company.legalName && (
            <span>
              {SITE.company.legalName}
              {SITE.company.businessId ? ` · ח.פ ${SITE.company.businessId}` : ''}
            </span>
          )}
          {addressLine && <span>{addressLine}</span>}
          <span>Founded by Eran Lipshtain & Ron Keli</span>
        </div>
      </div>
    </footer>
  );
}

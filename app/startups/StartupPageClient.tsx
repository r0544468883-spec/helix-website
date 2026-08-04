'use client';

import { SITE } from '@/lib/site';
import type { Startup } from './startups-data';
import ServiceHero from '../components/service/ServiceHero';
import PainSection from '../components/service/PainSection';
import ForWhoSection from '../components/service/ForWhoSection';
import TrustBar from '../components/service/TrustBar';
import FinalCTA from '../components/service/FinalCTA';
import LeadForm from '../components/sections/LeadForm';
import ScrollReveal from '../components/ScrollReveal';
import ScrollTextHighlight from '../components/ScrollTextHighlight';
import FAQItem from '../components/FAQItem';
import SectionHeader from '../components/SectionHeader';
import ProductReviews from '../products/ProductReviews';
import ProductTimeline from '../products/ProductTimeline';
import ProductConstellation from '../products/ProductConstellation';
import ProductMetricProof from '../products/ProductMetricProof';
import StartupDiscountBanner from './StartupDiscountBanner';
import dynamic from 'next/dynamic';

const GrowthHackingLottie = dynamic(() => import('./GrowthHackingLottie'), { ssr: false });
const BusinessDevLottie = dynamic(() => import('./BusinessDevLottie'), { ssr: false });
const DigitalMarketingLottie = dynamic(() => import('../components/DigitalMarketingLottie'), { ssr: false });
const WorldMapLottie = dynamic(() => import('../components/WorldMapLottie'), { ssr: false });

const STAGE_LOGIN = 'https://helix-stage.vercel.app/he/login';
const STAGE_APP = 'https://helix-stage.vercel.app';

export default function StartupPageClient({ startup }: { startup: Startup }) {
  const accent = startup.accent || '#10B981';
  const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `שלום, ראיתי את helix.co.il ורציתי לשמוע על ${startup.name}`
  )}`;

  const heroCta = startup.isStage ? STAGE_LOGIN : wa;
  const heroCtaText = startup.isStage ? 'כניסה למערכת STAGE ←' : 'דברו איתנו בוואטסאפ';

  return (
    <div className="service-page" style={{ ['--pac' as string]: accent, ['--brand' as string]: accent }}>
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow={startup.eyebrow}
        title={startup.title}
        subtitle={startup.subtitle}
        ctaHref={heroCta}
        ctaText={heroCtaText}
      >
        {startup.slug === 'growth-hacking' ? (
          <GrowthHackingLottie />
        ) : startup.slug === 'business-development' ? (
          <BusinessDevLottie />
        ) : startup.slug === 'marketing' ? (
          <DigitalMarketingLottie />
        ) : startup.slug === 'market-entry' ? (
          <WorldMapLottie />
        ) : undefined}
      </ServiceHero>

      {/* ──── 3. DISCOUNT / FREE BANNER ──── */}
      <StartupDiscountBanner />

      {/* ──── 3b. STAGE LOGIN (STAGE page only) ──── */}
      {startup.isStage && (
        <section className="stage-login-section">
          <style>{`
            .stage-login-section { padding: clamp(12px, 3vw, 28px) 0 clamp(28px, 5vw, 48px); }
            .stage-login-section .container { max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); }
            .stage-login { border: 1px solid rgba(16,185,129,0.28); border-radius: 20px; padding: clamp(28px, 5vw, 44px); background: linear-gradient(160deg, rgba(16,185,129,0.08), rgba(0,0,0,0.2)); text-align: center; }
            .stage-login h3 { font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 800; color: #fff; margin-bottom: 8px; }
            .stage-login p { color: #b9c2bd; font-size: 0.95rem; margin-bottom: 22px; }
            .stage-login-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
            .stage-btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem; padding: 13px 26px; border-radius: 12px; text-decoration: none; transition: all 0.2s; }
            .stage-btn-g { background: #fff; color: #111; }
            .stage-btn-g:hover { background: #f1f1f1; }
            .stage-btn-l { background: #0A66C2; color: #fff; }
            .stage-btn-l:hover { background: #08528f; }
            .stage-login-note { margin-top: 16px; font-size: 0.8rem; color: #6b7280; }
          `}</style>
          <div className="container">
            <ScrollReveal direction="up">
              <div className="stage-login">
                <h3>עלו לבמה — חינם לסטארטאפים</h3>
                <p>מתחברים בלחיצה עם Google או LinkedIn, ומתחילים לפרסם, למצוא שותפים ולקבל פידבק.</p>
                <div className="stage-login-btns">
                  <a className="stage-btn stage-btn-g" href={STAGE_LOGIN} target="_blank" rel="noopener noreferrer">התחברו עם Google</a>
                  <a className="stage-btn stage-btn-l" href={STAGE_LOGIN} target="_blank" rel="noopener noreferrer">התחברו עם LinkedIn</a>
                </div>
                <p className="stage-login-note">ההתחברות מתבצעת באפליקציית HELIX STAGE ({STAGE_APP.replace('https://', '')}) · בלי כרטיס אשראי</p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ──── 4. NARRATIVE + BURNING MONEY VIDEO ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>{startup.narrative.h2}</h2>
              {startup.narrative.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="sp-narrative-highlight">{startup.narrative.highlight}</p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── 5. PAIN ──── */}
      <PainSection title="מכירים את זה?" cards={startup.pains} />

      {/* ──── 6. TIMELINE — HOW IT WORKS ──── */}
      <ProductTimeline
        steps={startup.timeline}
        eyebrow="איך זה עובד"
        titleHtml={startup.isStage ? 'מהתחברות<br/>לקהילה.' : 'מהשיחה הראשונה<br/>לתוצאה.'}
      />

      {/* ──── 7. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <ProductReviews
          reviews={startup.reviews}
          eyebrow={`${startup.name} · לקוחות`}
          titleHtml={startup.isStage ? 'מה קרה<br>על הבמה.' : 'מה קרה אחרי<br>שהתחילו איתנו.'}
        />
      </ScrollReveal>

      {/* ──── 8. METRIC PROOF ──── */}
      <ProductMetricProof accent={accent} items={startup.metricProof} />

      {/* ──── 9. WHAT WE DO — FLIP CARDS ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">{startup.isStage ? 'מה יש ב-HELIX STAGE' : 'מה אנחנו עושים'}</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {startup.whatWeDo.map((svc) => (
                <div key={svc.title} className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <span className="flip-card-icon">{svc.icon}</span>
                      <h3>{svc.title}</h3>
                    </div>
                    <div className="flip-card-back">
                      <span className="flip-card-icon">{svc.icon}</span>
                      <h3>{svc.title}</h3>
                      <p>{svc.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 11. CONSTELLATION ──── */}
      <ProductConstellation
        tools={startup.constellation}
        title={startup.isStage ? 'איך STAGE עובד' : 'מחובר לכל מה שאתם כבר עובדים איתו'}
        subtitle={startup.isStage ? 'התחברות מאומתת, לוח פרסומים, וקהילה של סטארטאפים במקום אחד.' : 'הכלים והמערכות שאנחנו מחברים כדי שהצמיחה תעבוד. הנה חלק מהם.'}
      />

      {/* ──── 12. FOR WHO ──── */}
      <ForWhoSection yes={startup.forWho.yes} no={startup.forWho.no} />

      {/* ──── 13. LEAD FORM — STRONG (services only) ──── */}
      {!startup.isStage && (
        <ScrollReveal direction="up">
          <LeadForm />
        </ScrollReveal>
      )}

      {/* ──── 14. TRUST BAR ──── */}
      <TrustBar items={startup.isStage
        ? ['חינם לסטארטאפים', 'התחברות Google / LinkedIn', 'פרופיל מאומת', 'בלי כרטיס אשראי', 'קהילה אמיתית']
        : ['20% הנחה אוטומטית לסטארטאפים', 'שיחת אפיון ראשונה חינם', 'בלי חוזה', 'בעברית מלאה', 'HELIX STAGE חינם']} />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml={`שאלות על<br>${startup.name}.`} />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              {startup.faq.map((item) => (
                <FAQItem key={item.q} question={item.q}>
                  <p>{item.a}</p>
                </FAQItem>
              ))}
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 16. LEAD FORM — SOFT (services only) ──── */}
      {!startup.isStage && (
        <ScrollReveal direction="up">
          <LeadForm variant="soft" />
        </ScrollReveal>
      )}

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA
        title={startup.finalCtaTitle}
        subtitle={startup.finalCtaSubtitle}
        ctaHref={startup.isStage ? STAGE_LOGIN : wa}
        ctaText={startup.isStage ? 'עלו לבמה — חינם' : 'בואו נדבר'}
      />
    </div>
  );
}

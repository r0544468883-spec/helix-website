'use client';

import { SITE } from '@/lib/site';
import type { Product } from './products-data';
import ServiceHero from '../components/service/ServiceHero';
import PainSection from '../components/service/PainSection';
import FeaturesSection from '../components/service/FeaturesSection';
import ForWhoSection from '../components/service/ForWhoSection';
import TrustBar from '../components/service/TrustBar';
import FinalCTA from '../components/service/FinalCTA';
import LeadForm from '../components/sections/LeadForm';
import ScrollReveal from '../components/ScrollReveal';
import ScrollTextHighlight from '../components/ScrollTextHighlight';
import FAQItem from '../components/FAQItem';
import SectionHeader from '../components/SectionHeader';
import ProductReviews from './ProductReviews';
import ProductTimeline from './ProductTimeline';
import ProductConstellation from './ProductConstellation';
import ProductScreens from './ProductScreens';
import ProductHeroUnfold from './ProductHeroUnfold';
import dynamic from 'next/dynamic';

const ScissorsLottie = dynamic(() => import('../components/ScissorsLottie'), { ssr: false });
const ProductHeroLottie = dynamic(() => import('./ProductHeroLottie'), { ssr: false });

export default function ProductPageClient({ product }: { product: Product }) {
  const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `שלום, ראיתי את helix.co.il ורציתי לשמוע על ${product.name}`
  )}`;

  const accent = product.accent || '#10B981';

  return (
    <div className="service-page product-page" style={{ ['--pac' as string]: accent }}>
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow={product.eyebrow}
        title={product.title}
        subtitle={product.subtitle}
        price={product.price}
        priceNote={product.priceNote}
        ctaHref={wa}
      >
        {!product.accent && product.heroLottie ? <ProductHeroLottie src={product.heroLottie} /> : false}
      </ServiceHero>

      {/* ──── 1b. HERO UNFOLD SCREEN (scroll-driven, in the hero) ──── */}
      {product.accent && product.screenViews && (
        <ProductHeroUnfold slug={product.slug} accent={accent} view={product.screenViews[0]} />
      )}

      {/* ──── 2. NARRATIVE #1 + BURNING MONEY ──── */}
      {product.narrative1 && (
        <section className="sp-narrative">
          <div className="container">
            <div className="sp-narrative-with-video">
              <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
                <h2>{product.narrative1.h2}</h2>
                {product.narrative1.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {product.narrative1.highlight && (
                  <p className="sp-narrative-highlight">{product.narrative1.highlight}</p>
                )}
              </ScrollTextHighlight>
              <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
            </div>
          </div>
        </section>
      )}

      {/* ──── 2b. SYSTEM SCREENS SHOWCASE (5-screen carousel, after the narrative) ──── */}
      {product.screenViews && product.screenViews.length === 5 && (
        <ProductScreens slug={product.slug} accent={accent} views={product.screenViews} />
      )}

      {/* ──── 3. PAIN ──── */}
      <PainSection title="מכירים את הסיפור?" cards={product.pains} />

      {/* ──── 4. REVIEWS ──── */}
      {product.reviews && product.reviews.length > 0 && (
        <ScrollReveal direction="up">
          <ProductReviews
            reviews={product.reviews}
            eyebrow={`לקוחות ${product.name}`}
            titleHtml={'מה קרה אחרי<br>שהתחילו איתנו.'}
          />
        </ScrollReveal>
      )}

      {/* ──── 5. LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      {product.constellation && product.constellation.length > 0 && (
        <ProductConstellation tools={product.constellation} />
      )}

      {/* ──── 7. TIMELINE ──── */}
      {product.timeline && product.timeline.length > 0 && <ProductTimeline steps={product.timeline} />}

      {/* ──── 8. SUB-SERVICES — FLIP CARDS ──── */}
      {product.subServices && product.subServices.length > 0 && (
        <section className="sp2-section">
          <div className="container">
            <ScrollReveal direction="up">
              <h2 className="sp2-section-title">מה כולל {product.name}</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" stagger staggerDelay={0.08}>
              <div className="sp-services-grid">
                {product.subServices.map((svc) => (
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
      )}

      {/* ──── 9. FEATURES + STATS (flip) ──── */}
      <FeaturesSection
        title="מה זה עושה"
        lead={`${product.name} — הכל במקום אחד, בעברית, ומחובר לשאר עולם ה-HELIX.`}
        stats={product.stats}
        features={product.features}
      />

      {/* ──── 10. NARRATIVE #2 ──── */}
      {product.narrative2 && (
        <section className="sp-narrative">
          <div className="container">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>{product.narrative2.h2}</h2>
              {product.narrative2.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </ScrollTextHighlight>
          </div>
        </section>
      )}

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection yes={product.forWho.yes} no={product.forWho.no} />

      {/* ──── 12. PRICING CARD + SCISSORS ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors">
              <div className="sp-scissors-wrap" aria-hidden="true">
                <ScissorsLottie />
              </div>
              <div className="product-price-card">
                <span className="product-price-eyebrow">{product.eyebrow}</span>
                <span className="product-price-value">{product.price || 'בהתאמה'}</span>
                {product.priceNote && <span className="product-price-note">{product.priceNote}</span>}
                <ul className="product-price-list">
                  {product.features.slice(0, 5).map((f) => (
                    <li key={f.title}>{f.title}</li>
                  ))}
                </ul>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="product-price-cta">
                  דברו איתנו בוואטסאפ
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 13. LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── 14. TRUST BAR ──── */}
      <TrustBar items={['בעברית מלאה', 'בלי חוזה', 'ביטול בכל עת', 'הדגמה חינם', 'תמיכה אנושית']} />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml={`שאלות על<br>${product.name}.`} />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              {product.faq.map((item) => (
                <FAQItem key={item.q} question={item.q}>
                  <p>{item.a}</p>
                </FAQItem>
              ))}
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 16. LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA title={product.finalCtaTitle} subtitle={product.finalCtaSubtitle} ctaHref={wa} ctaText="בואו נדבר" />
    </div>
  );
}

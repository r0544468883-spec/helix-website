'use client';

import { SITE } from '@/lib/site';
import { getTier, type Product } from './products-data';
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
import ProductScreens from './ProductScreens';
import ProductHeroUnfold from './ProductHeroUnfold';
import ProductLogoGrid from './ProductLogoGrid';
import ProductHoverCharts from './ProductHoverCharts';
import ProductWorkflowNodes from './ProductWorkflowNodes';
import ProductAskDoctor from './ProductAskDoctor';
import ProductOfferBar from './ProductOfferBar';
import ProductMetricProof from './ProductMetricProof';
import ProductVerticalTabs from './ProductVerticalTabs';
import ProductBeforeAfter from './ProductBeforeAfter';
import ProductOrchestration from './ProductOrchestration';
import ProductAgentDemo from './ProductAgentDemo';
import ProductScrollytelling from './ProductScrollytelling';
import ProductBuilderDemo from './ProductBuilderDemo';
import ProductBento from './ProductBento';
import ProductChiefMockup from './ProductChiefMockup';
import ProductAutonomyModes from './ProductAutonomyModes';
import PricingCarousel from '../components/PricingCarousel';
import WhatsAppCostNote from '../components/WhatsAppCostNote';
import dynamic from 'next/dynamic';

const ScissorsLottie = dynamic(() => import('../components/ScissorsLottie'), { ssr: false });
const ProductHeroLottie = dynamic(() => import('./ProductHeroLottie'), { ssr: false });

// Hue (deg) of a #rrggbb color — used to tint brand-green assets (the scissors
// Lottie) to each product's accent so a yellow product isn't left with a green
// animation. The scissors art is a single green family (~160°), so rotating the
// whole thing by (accentHue - 160) maps it onto the accent while keeping shading.
const SCISSORS_BASE_HUE = 160;
function hexHue(hex: string): number {
  const n = hex.replace('#', '');
  if (n.length < 6) return SCISSORS_BASE_HUE;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export default function ProductPageClient({ product }: { product: Product }) {
  const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `שלום, ראיתי את helix.co.il ורציתי לשמוע על ${product.name}`
  )}`;

  const accent = product.accent || '#10B981';
  const scissorsHue = Math.round(hexHue(accent) - SCISSORS_BASE_HUE);
  const tier = getTier(product.slug);

  return (
    <div className={`service-page product-page pp-${product.slug}`} style={{ ['--pac' as string]: accent, ['--brand' as string]: accent }}>
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow={product.eyebrow}
        title={product.title}
        subtitle={product.subtitle}
        price={product.price ?? `החל מ-${tier.starter} ₪`}
        priceNote={product.priceNote}
        ctaHref={wa}
      >
        {!product.accent && product.heroLottie ? <ProductHeroLottie src={product.heroLottie} /> : false}
      </ServiceHero>

      {/* ──── 1a. OFFER BAR (above-the-fold: result + 3-step + free offer CTA + trust badge) ──── */}
      <ProductOfferBar
        accent={accent}
        wa={wa}
        result={product.heroResult}
        steps={product.steps3}
        offer={product.heroOffer}
        badge={product.heroBadge}
      />

      {/* ──── 1a.5 CHIEF interface mockup (rendered, no image files) ──── */}
      {product.slug === 'chief' && (
        <section className="sp2-section"><div className="container"><ProductChiefMockup accent={accent} /></div></section>
      )}

      {/* ──── 1a.6 AUTONOMY MODES (high on the page, emphasize full autonomy) ──── */}
      {product.autonomyModes && (
        <ProductAutonomyModes accent={accent} modes={product.autonomyModes} />
      )}

      {/* ──── 1b. HERO UNFOLD SCREEN (scroll-driven, in the hero) ──── */}
      {product.slug !== 'chief' && product.accent && product.screenViews && (
        <ProductHeroUnfold slug={product.slug} accent={accent} view={product.screenViews[0]} />
      )}

      {/* ──── 1c. INTEGRATIONS LOGO GRID (Ramp-style) ──── */}
      {product.logos && product.logos.length > 0 && (
        <ProductLogoGrid accent={accent} logos={product.logos} />
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

      {/* ──── 2c. HOVER-REACTIVE CHARTS (Dashboards signature effect) ──── */}
      {product.slug === 'dashboards' && <ProductHoverCharts accent={accent} />}

      {/* ──── 2d. PINNED SCROLLYTELLING "how it works" (pages without workflow nodes) ──── */}
      {product.scrolly && product.scrolly.length > 0 && (
        <ProductScrollytelling
          accent={accent}
          steps={product.scrolly}
          title={product.slug === 'dashboards' ? <>3 דרכים <em>לדשבורד מוכן</em></> : undefined}
        />
      )}

      {/* ──── 2e. DRAG-DROP BUILDER (products with a real builder) ──── */}
      {product.slug === 'dashboards' && <ProductBuilderDemo accent={accent} />}
      {product.slug === 'forms' && (
        <ProductBuilderDemo
          accent={accent}
          title={<>בונים טופס, <em>גוררים שדות למקום</em></>}
          fig="FIG 0.2, Build · Send · Sign"
          widgets={[
            { label: 'שם מלא', kind: 'field' },
            { label: 'ת.ז. / ח.פ.', kind: 'field' },
            { label: 'תאריך', kind: 'field' },
            { label: 'חתימה', kind: 'sign' },
          ]}
        />
      )}

      {/* ──── 3. PAIN ──── */}
      <PainSection title="מכירים את הסיפור?" cards={product.pains} />

      {/* ──── 3b. WORKFLOW NODES (Attio-style, for products with a defined flow) ──── */}
      {product.workflow && product.workflow.length > 0 && (
        <ProductWorkflowNodes accent={accent} steps={product.workflow} />
      )}

      {/* ──── 3c. ASK-THE-DOCTOR PANEL (Growth Doctor signature) ──── */}
      {product.slug === 'growth-doctor' && <ProductAskDoctor accent={accent} />}

      {/* ──── 3d. LIVE AGENT DEMO (Framer-style, for agent products) ──── */}
      {product.agentDemo && (
        <ProductAgentDemo accent={accent} steps={product.agentDemo.steps} agentName={product.agentDemo.agentName} />
      )}

      {/* ──── 4. REVIEWS ──── */}
      {product.reviews && product.reviews.length > 0 && (
        <ScrollReveal direction="up">
          <ProductReviews
            reviews={product.reviews}
            eyebrow={`לקוחות ${product.name}`}
            titleHtml={'מה קרה אחרי שהתחילו<br>לעבוד עם התוכנה.'}
          />
        </ScrollReveal>
      )}

      {/* ──── 4b. METRIC PROOF (Retool-style hard numbers) ──── */}
      {product.metricProof && product.metricProof.length > 0 && (
        <ProductMetricProof accent={accent} items={product.metricProof} />
      )}

      {/* ──── 4c. BEFORE / AFTER (Framer/Linear proof) ──── */}
      {product.beforeAfter && <ProductBeforeAfter accent={accent} data={product.beforeAfter} />}

      {/* ──── 5. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" accentHue={scissorsHue} />
      </ScrollReveal>

      {/* ──── 6. ORCHESTRATION (Stripe-style hub diagram, upgrades the constellation) ──── */}
      {product.constellation && product.constellation.length > 0 && (
        <ProductOrchestration accent={accent} hub={product.name} nodes={product.constellation} />
      )}

      {/* ──── 7. TIMELINE ──── */}
      {product.timeline && product.timeline.length > 0 && <ProductTimeline steps={product.timeline} lottieHue={scissorsHue} />}

      {/* ──── 8. SUB-SERVICES, FLIP CARDS ──── */}
      {product.subServices && product.subServices.length > 0 && (
        <section className="sp2-section">
          <div className="container">
            <ScrollReveal direction="up">
              <h2 className="sp2-section-title">מה כולל {product.name}</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" stagger staggerDelay={0.08}>
              <div className={`sp-services-grid${product.subServices.length % 3 === 0 ? ' sp-grid-3' : ''}`}>
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
        lead={`${product.name}, הכל במקום אחד, בעברית, ומחובר לשאר עולם ה-HELIX.`}
        stats={product.stats}
        features={product.features}
        showFeatures={false}
      />

      {/* ──── 9a. BENTO FEATURE GRID + tilt + FIG (all products) ──── */}
      {product.features && product.features.length > 0 && (
        <ProductBento accent={accent} features={product.features} />
      )}

      {/* ──── 9b. VERTICAL / USE-CASE TABS (Retool-style) ──── */}
      {product.verticals && product.verticals.length > 0 && (
        <ProductVerticalTabs
          accent={accent}
          verticals={product.verticals}
          title={product.verticalsTitle ? <>מותאם <em>{product.verticalsTitle}</em></> : undefined}
        />
      )}

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

      {/* ──── 10c. RELATED METHODOLOGY ARTICLE (internal link, SEO) ──── */}
      {product.relatedArticle && (
        <section className="sp-narrative">
          <div className="container">
            <a href={product.relatedArticle.href}
               style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, border: `1px solid ${accent}`, color: accent, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              📖 {product.relatedArticle.label} ←
            </a>
          </div>
        </section>
      )}

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection yes={product.forWho.yes} no={product.forWho.no} />

      {/* ──── 12. PRICING CAROUSEL + SCISSORS ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors" style={{ flexDirection: 'column', alignItems: 'center', gap: 0, maxWidth: 'none' }}>
              <div
                className="sp-scissors-wrap"
                aria-hidden="true"
                style={{ filter: scissorsHue ? `hue-rotate(${scissorsHue}deg)` : undefined }}
              >
                <ScissorsLottie />
              </div>
              <SectionHeader
                eyebrow="מחירים"
                titleHtml="מחיר אחד ברור.<br/>שלושה מסלולים."
                description={product.bundleRecommend
                  ? `מחיר אחיד ושקוף, בלי מחיר מוסתר. ${product.bundleRecommend.note}`
                  : "מחיר אחיד ושקוף לכל התוכנות של HELIX, בלי הפתעות ובלי מחיר מוסתר. עלות הודעות וואטסאפ נפרדת ולפי שימוש."}
              />
            </div>
          </ScrollReveal>
        </div>
        <PricingCarousel wa={wa} product={{ name: product.name, starter: tier.starter, pro: tier.pro, business: tier.business, recommend: product.bundleRecommend?.systems }} />
      </section>

      {/* ──── 12b. WHATSAPP COST NOTE (products that use WhatsApp) ──── */}
      {product.usesWhatsapp !== false && <WhatsAppCostNote />}

      {/* ──── 13. LEAD FORM, STRONG ──── */}
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
              <img src="/faq-team.png" alt="ערן ורון, הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 16. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" accentHue={scissorsHue} />
      </ScrollReveal>

      {/* ──── 16b. HELIX CHIEF band — every product is orchestrated by CHIEF ──── */}
      {product.slug !== 'crm' && (
        <ScrollReveal direction="up">
          <section className="sp2-section" id="chief">
            <div className="container">
              <div
                className="sp-chief-band"
                style={{ ['--acc' as string]: product.accent || '#10B981' }}
              >
                <div className="sp-chief-emoji">🧠</div>
                <div className="sp-chief-copy">
                  <div className="sp-chief-eyebrow">מנוהל ע״י HELIX CHIEF</div>
                  <h2 className="sp-chief-title">הראש והידיים של {product.name}</h2>
                  <p className="sp-chief-text">
                    {product.name} לא עובד לבד — הוא מתחבר ל-HELIX CHIEF, סוכן ה-AI שיושב מעל ה-CRM
                    החינמי ומעל כל כלי HELIX. אתה מבקש בעברית, CHIEF מתכנן, מפעיל את {product.name},
                    ומבצע — בשליטת מתג האוטונומיה (מציע · מאשר · אוטופיילוט).
                  </p>
                  <a href="/products/crm" className="sp-chief-cta">
                    להכיר את HELIX CHIEF CRM · חינם ←
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA title={product.finalCtaTitle} subtitle={product.finalCtaSubtitle} ctaHref={wa} ctaText="בואו נדבר" />
    </div>
  );
}

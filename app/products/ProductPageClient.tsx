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

export default function ProductPageClient({ product }: { product: Product }) {
  const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `שלום, ראיתי את helix.co.il ורציתי לשמוע על ${product.name}`
  )}`;

  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow={product.eyebrow}
        title={product.title}
        subtitle={product.subtitle}
        price={product.price}
        priceNote={product.priceNote}
        ctaHref={wa}
      />

      {/* ──── PAIN ──── */}
      <PainSection title="מכירים את הסיפור?" cards={product.pains} />

      {/* ──── FEATURES + STATS ──── */}
      <FeaturesSection
        title="מה זה עושה"
        lead={`${product.name} — הכל במקום אחד, בעברית, ומחובר לשאר עולם ה-HELIX.`}
        stats={product.stats}
        features={product.features}
      />

      {/* ──── LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection yes={product.forWho.yes} no={product.forWho.no} />

      {/* ──── TRUST BAR ──── */}
      <TrustBar items={['בעברית מלאה', 'בלי חוזה', 'ביטול בכל עת', 'הדגמה חינם', 'תמיכה אנושית']} />

      {/* ──── FAQ ──── */}
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

      {/* ──── LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── FINAL CTA ──── */}
      <FinalCTA title={product.finalCtaTitle} subtitle={product.finalCtaSubtitle} ctaHref={wa} ctaText="בואו נדבר" />
    </div>
  );
}

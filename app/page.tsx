import Hero from './components/sections/Hero';
import Pain from './components/sections/Pain';
import HowItWorks from './components/sections/HowItWorks';
import PackagesCarousel from './components/sections/PackagesCarousel';
import About from './components/sections/About';
import FAQ from './components/sections/FAQ';
import Resources from './components/sections/Resources';
import FinalCTA from './components/sections/FinalCTA';
import WhyHelix from './components/sections/WhyHelix';
import ReviewsCarousel from './components/sections/ReviewsCarousel';
import LeadForm from './components/sections/LeadForm';
import ServiceMarquee from './components/ServiceMarquee';
import TestimonialsMarquee from './components/TestimonialsMarquee';
import ToolsConstellation from './components/ToolsConstellation';
import StatsBar from './components/StatsBar';
import ScrollReveal from './components/ScrollReveal';

// Ordered to match the standard service-page flow (docs/SERVICE-PAGES.md):
// Hero → trust → Pain → Reviews → LeadForm(soft) → Constellation → Timeline →
// Features → Pricing → LeadForm(strong) → About → FAQ → Resources → FinalCTA.
export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* Trust band, instant credibility right after the hero */}
      <ScrollReveal direction="up" delay={0.1}>
        <StatsBar />
      </ScrollReveal>
      <ScrollReveal direction="left">
        <ServiceMarquee />
      </ScrollReveal>

      {/* 3. Pain, relatability */}
      <ScrollReveal direction="up">
        <Pain />
      </ScrollReveal>

      {/* 4. Reviews / social proof */}
      <ScrollReveal direction="up">
        <ReviewsCarousel />
      </ScrollReveal>
      <ScrollReveal direction="up">
        <TestimonialsMarquee />
      </ScrollReveal>

      {/* 5. Lead form, soft ask, after the visitor is warmed up */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* 6. Constellation, "connects to everything you already use" */}
      <ScrollReveal direction="up">
        <ToolsConstellation />
      </ScrollReveal>

      {/* 7. Process / timeline */}
      <ScrollReveal direction="right" stagger staggerDelay={0.15}>
        <HowItWorks />
      </ScrollReveal>

      {/* 9. Features, why HELIX */}
      <ScrollReveal direction="up" stagger staggerDelay={0.1}>
        <WhyHelix />
      </ScrollReveal>

      {/* 12. Pricing, 3D packages carousel */}
      <PackagesCarousel />

      {/* 13. Lead form, strong close, right after pricing */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* About */}
      <ScrollReveal direction="up">
        <About />
      </ScrollReveal>

      {/* 15. FAQ */}
      <ScrollReveal direction="up">
        <FAQ />
      </ScrollReveal>

      {/* Resources */}
      <ScrollReveal direction="up">
        <Resources />
      </ScrollReveal>

      {/* 17. Final CTA */}
      <ScrollReveal direction="up">
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}

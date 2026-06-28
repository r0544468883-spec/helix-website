import Hero from './components/sections/Hero';
import Pain from './components/sections/Pain';
import HowItWorks from './components/sections/HowItWorks';
import Services from './components/sections/Services';
import Cases from './components/sections/Cases';
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
import FloatingCTA from './components/FloatingCTA';

export default function HomePage() {
  return (
    <>
      {/* Hero — GSAP entrance animations built-in */}
      <Hero />

      {/* Customer reviews carousel */}
      <ScrollReveal direction="up">
        <ReviewsCarousel />
      </ScrollReveal>

      {/* Stats bar — instant credibility */}
      <ScrollReveal direction="up" delay={0.1}>
        <StatsBar />
      </ScrollReveal>

      <ScrollReveal direction="left">
        <ServiceMarquee />
      </ScrollReveal>

      {/* Social proof screenshots */}
      <ScrollReveal direction="up">
        <TestimonialsMarquee />
      </ScrollReveal>

      {/* Lead form — early, soft ask */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* Pain — relatability */}
      <ScrollReveal direction="up">
        <Pain />
      </ScrollReveal>

      {/* Why Helix — 6 feature cards with stagger */}
      <ScrollReveal direction="up" stagger staggerDelay={0.1}>
        <WhyHelix />
      </ScrollReveal>

      {/* Lead form — strong close, after social proof */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* Cases — full-width Sefi-style project showcase */}
      <ScrollReveal direction="up">
        <Cases />
      </ScrollReveal>

      {/* Process */}
      <ScrollReveal direction="right" stagger staggerDelay={0.15}>
        <HowItWorks />
      </ScrollReveal>

      {/* Packages */}
      <ScrollReveal direction="up" stagger staggerDelay={0.12}>
        <Services />
      </ScrollReveal>

      {/* FAQ — right after pricing */}
      <ScrollReveal direction="up">
        <FAQ />
      </ScrollReveal>

      {/* About */}
      <ScrollReveal direction="up">
        <About />
      </ScrollReveal>

      {/* Resources */}
      <ScrollReveal direction="up">
        <Resources />
      </ScrollReveal>

      {/* Final CTA */}
      <ScrollReveal direction="up">
        <FinalCTA />
      </ScrollReveal>

      {/* Tools constellation — footer hero */}
      <ScrollReveal direction="up">
        <ToolsConstellation />
      </ScrollReveal>

      <FloatingCTA />
    </>
  );
}

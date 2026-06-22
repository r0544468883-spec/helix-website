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
import ScrollFadeIn from './components/ScrollFadeIn';
import ServiceMarquee from './components/ServiceMarquee';
import TestimonialsMarquee from './components/TestimonialsMarquee';
import ToolsConstellation from './components/ToolsConstellation';
import StatsBar from './components/StatsBar';

export default function HomePage() {
  return (
    <>
      {/* Hero — first impression */}
      <Hero />

      {/* Customer reviews carousel */}
      <ReviewsCarousel />

      {/* Stats bar — instant credibility */}
      <StatsBar />

      <ServiceMarquee />

      {/* Social proof screenshots */}
      <TestimonialsMarquee />

      {/* Lead form — early, soft ask */}
      <LeadForm variant="soft" />

      {/* Pain — relatability */}
      <Pain />

      {/* Why Helix — 6 feature cards */}
      <WhyHelix />

      {/* Lead form — strong close, after social proof */}
      <LeadForm />

      {/* Cases — full-width Sefi-style project showcase */}
      <Cases />

      {/* Process */}
      <HowItWorks />

      {/* Packages */}
      <Services />

      {/* FAQ — right after pricing */}
      <FAQ />

      {/* About */}
      <About />

      {/* Resources */}
      <Resources />

      {/* Final CTA */}
      <FinalCTA />

      {/* Tools constellation — footer hero */}
      <ToolsConstellation />
    </>
  );
}

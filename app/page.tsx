import Hero from './components/sections/Hero';
import Pain from './components/sections/Pain';
import HowItWorks from './components/sections/HowItWorks';
import Services from './components/sections/Services';
import Cases from './components/sections/Cases';
import About from './components/sections/About';
import FAQ from './components/sections/FAQ';
import Resources from './components/sections/Resources';
import FinalCTA from './components/sections/FinalCTA';
import Expertise from './components/sections/Expertise';
import WhyHelix from './components/sections/WhyHelix';
import ScrollFadeIn from './components/ScrollFadeIn';
import ServiceMarquee from './components/ServiceMarquee';
import TestimonialsMarquee from './components/TestimonialsMarquee';
import LottoBall from './components/LottoBall';
import ToolsConstellation from './components/ToolsConstellation';
import StatsBar from './components/StatsBar';

export default function HomePage() {
  return (
    <>
      {/* Hero — first impression */}
      <Hero />

      {/* Stats bar — instant credibility */}
      <StatsBar />

      {/* Quick expertise scan */}
      <ScrollFadeIn><Expertise /></ScrollFadeIn>
      <ServiceMarquee />

      {/* Pain — relatability */}
      <TestimonialsMarquee />
      <ScrollFadeIn><Pain /></ScrollFadeIn>

      {/* Why Helix — 6 feature cards */}
      <ScrollFadeIn><WhyHelix /></ScrollFadeIn>

      {/* Cases — full-width Sefi-style project showcase */}
      <Cases />

      {/* Process */}
      <ScrollFadeIn><HowItWorks /></ScrollFadeIn>

      {/* Packages */}
      <ScrollFadeIn><Services /></ScrollFadeIn>

      {/* Tools popcorn machine */}
      <LottoBall />

      {/* FAQ — right after pricing */}
      <ScrollFadeIn><FAQ /></ScrollFadeIn>

      {/* About */}
      <ScrollFadeIn><About /></ScrollFadeIn>

      {/* Resources */}
      <ScrollFadeIn><Resources /></ScrollFadeIn>

      {/* Final CTA */}
      <FinalCTA />

      {/* Tools constellation — footer hero */}
      <ToolsConstellation />
    </>
  );
}

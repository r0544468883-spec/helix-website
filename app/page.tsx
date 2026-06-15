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
import ScrollFadeIn from './components/ScrollFadeIn';
import ServiceMarquee from './components/ServiceMarquee';
import TestimonialsMarquee from './components/TestimonialsMarquee';
import LottoBall from './components/LottoBall';
import ToolsConstellation from './components/ToolsConstellation';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — first impression + founders coin */}
      <Hero />

      {/* 2. Expertise pills — quick scan of what we do */}
      <ScrollFadeIn><Expertise /></ScrollFadeIn>

      {/* 3. Service marquee — reinforces breadth */}
      <ServiceMarquee />

      {/* 4. Pain — relatability, "we get you" */}
      <TestimonialsMarquee />
      <ScrollFadeIn><Pain /></ScrollFadeIn>

      {/* 5. Cases — proof before pricing */}
      <ScrollFadeIn><Cases /></ScrollFadeIn>

      {/* 6. How it works — process clarity */}
      <ScrollFadeIn><HowItWorks /></ScrollFadeIn>

      {/* 7. Packages — the offer (removed duplicate Capabilities) */}
      <ScrollFadeIn><Services /></ScrollFadeIn>

      {/* 8. Tools popcorn machine */}
      <LottoBall />

      {/* 9. FAQ — objection handling, right after pricing */}
      <ScrollFadeIn><FAQ /></ScrollFadeIn>

      {/* 10. About — who we are */}
      <ScrollFadeIn><About /></ScrollFadeIn>

      {/* 11. Resources */}
      <ScrollFadeIn><Resources /></ScrollFadeIn>

      {/* 12. Final CTA */}
      <FinalCTA />

      {/* 13. Tools constellation — footer hero */}
      <ToolsConstellation />
    </>
  );
}

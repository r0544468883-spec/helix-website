import Hero from './components/sections/Hero';
import Pain from './components/sections/Pain';
import Capabilities from './components/sections/Capabilities';
import HowItWorks from './components/sections/HowItWorks';
import Services from './components/sections/Services';
import Cases from './components/sections/Cases';
import About from './components/sections/About';
import FAQ from './components/sections/FAQ';
import Resources from './components/sections/Resources';
import FinalCTA from './components/sections/FinalCTA';
import ScrollFadeIn from './components/ScrollFadeIn';
import ServiceMarquee from './components/ServiceMarquee';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceMarquee />
      <ScrollFadeIn><Pain /></ScrollFadeIn>
      <ScrollFadeIn><Capabilities /></ScrollFadeIn>
      <ScrollFadeIn><HowItWorks /></ScrollFadeIn>
      <ScrollFadeIn><Services /></ScrollFadeIn>
      <ScrollFadeIn><Cases /></ScrollFadeIn>
      <ScrollFadeIn><About /></ScrollFadeIn>
      <ScrollFadeIn><FAQ /></ScrollFadeIn>
      <ScrollFadeIn><Resources /></ScrollFadeIn>
      <FinalCTA />
    </>
  );
}

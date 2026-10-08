import Hero from './components/sections/Hero';
import StatsBar from './components/StatsBar';
import HomeNarrativeBurn from './components/sections/HomeNarrativeBurn';
import Pain from './components/sections/Pain';
import HowItWorks from './components/sections/HowItWorks';
import About from './components/sections/About';
import PackagesCarousel from './components/sections/PackagesCarousel';
import ReviewsCarousel from './components/sections/ReviewsCarousel';
import FAQ from './components/sections/FAQ';
import LeadForm from './components/sections/LeadForm';
import ScrollReveal from './components/ScrollReveal';

// Homepage, rebuilt as a focused, high-converting landing page following the
// HELIX customer-journey: hook → pain → how it works → who we are (range of
// services, not an "all-in-one bundle") → pricing → proof → FAQ → CTA.
export default function HomePage() {
  return (
    <>
      {/* 1. Hero — the hook + the promise (renders immediately, no reveal flash) */}
      <Hero />

      {/* Thin trust strip right under the hero */}
      <StatsBar />

      {/* 2. Pain — the burning money (emotional hook + video), then the stories */}
      <ScrollReveal direction="up">
        <HomeNarrativeBurn />
      </ScrollReveal>
      <ScrollReveal direction="up">
        <Pain />
      </ScrollReveal>

      {/* 3. How it works — from one message to real results */}
      <ScrollReveal direction="up" stagger staggerDelay={0.12}>
        <HowItWorks />
      </ScrollReveal>

      {/* 4. Who we are — establishes the range of services (marketing, dev,
          automation, AI) and why we're affordable. Not an "all-in-one" sell. */}
      <ScrollReveal direction="up">
        <About />
      </ScrollReveal>

      {/* 5. Pricing — the 3D packages carousel */}
      <PackagesCarousel />

      {/* 6. Proof — what clients say */}
      <ScrollReveal direction="up">
        <ReviewsCarousel />
      </ScrollReveal>

      {/* 7. FAQ */}
      <ScrollReveal direction="up">
        <FAQ />
      </ScrollReveal>

      {/* Closing CTA — one lead form, the single conversion goal */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>
    </>
  );
}

import Hero from './components/sections/Hero';
import Pain from './components/sections/Pain';
import Capabilities from './components/sections/Capabilities';
import Method from './components/sections/Method';
import Journey from './components/sections/Journey';
import Services from './components/sections/Services';
import Cases from './components/sections/Cases';
import About from './components/sections/About';
import FAQ from './components/sections/FAQ';
import Resources from './components/sections/Resources';
import FinalCTA from './components/sections/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pain />
      <Capabilities />
      <Method />
      <Journey />
      <Services />
      <Cases />
      <About />
      <FAQ />
      <Resources />
      <FinalCTA />
    </>
  );
}

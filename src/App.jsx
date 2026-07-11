import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import SideSocials from "./components/SideSocials";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import Home from "./sections/Home";
import Education from "./sections/Education";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Awards from "./sections/Awards";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  return (
    <Preloader>
      <div className="bg-surface text-on-surface font-body selection:bg-tertiary-container selection:text-on-tertiary-container overflow-x-hidden">
        <CustomCursor />
        <ScrollProgress />
        <Navbar />
        <SideSocials />

        <main>
          <Home />
          <Education />
          <Experience />
          <Skills />
          <Awards />
          <Projects />
          <Contact />
        </main>

        <Footer />
        <BackToTop />

        {/* BG decorative layer */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-10]">
          <span className="material-symbols-outlined absolute top-1/4 left-1/4 text-[18rem] rotate-12">
            brush
          </span>
          <span className="material-symbols-outlined absolute bottom-1/4 right-1/4 text-[14rem] -rotate-12">
            draw
          </span>
        </div>
      </div>
    </Preloader>
  );
}

export default App;

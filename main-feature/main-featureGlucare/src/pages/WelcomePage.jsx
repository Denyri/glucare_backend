import { useLenis } from "../hooks/useLenis";
import Navbar from "../components/Navbar";
import HeroFeatureShowcase from "../components/HeroFeatureShowcase";
import AboutFeatureSection from "../components/FeatureSection";
import StatsSection from "../components/StatsSection";
import TestimonialSection from "../components/TestimonialSection";
import FAQ from "../components/FAQ";
import CTASection from "../components/CTAsection";
import Footer from "../components/Footer";

export default function WelcomePage() {
    useLenis(); // Initialize Lenis smooth scroll
    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", background: "#F4F8FF" }}>
            <Navbar />
            <HeroFeatureShowcase />
            <AboutFeatureSection />
            <StatsSection />
            <TestimonialSection />
            <FAQ />
            <CTASection />
            <Footer />
        </div>
    );
}
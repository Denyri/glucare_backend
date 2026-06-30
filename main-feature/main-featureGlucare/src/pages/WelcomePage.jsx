import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeatureSection";
import FAQSection from "../components/FAQ";
import CTAsection from "../components/CTAsection";
import Footer from "../components/Footer";

export default function WelcomePage() {
    return (
        <div className="font-[Poppins]">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <FAQSection />
            <CTAsection />
            <Footer />
        </div>
    );
}
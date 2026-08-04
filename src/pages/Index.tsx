import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LoanTypesSection from "@/components/LoanTypesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    navigate("/apply");
  };

  return (
    <main className="min-h-screen">
      <Navbar onApplyClick={handleApplyClick} />
      <HeroSection onApplyClick={handleApplyClick} />
      <LoanTypesSection onApplyClick={handleApplyClick} />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection onApplyClick={handleApplyClick} />
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container px-4 md:px-8 max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-6 text-nyota-charcoal">About NYOTA Fund</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            NYOTA Fund is a dedicated financial initiative aimed at empowering the youth in Kenya through accessible and affordable credit. 
            Operated as a legal financial services provider, we focus on driving economic growth by supporting small businesses and personal development. 
            Our mission is to foster self-reliance and opportunity for the next generation of entrepreneurs in Uasin Gishu and beyond.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Index;

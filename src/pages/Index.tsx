import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import TargetSection from "@/components/TargetSection";
import MissionSection from "@/components/MissionSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import OrderSection from "@/components/OrderSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductsSection />
        <TargetSection />
        <MissionSection />
        <TestimonialsSection />
        <OrderSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import QuickOrderDialog from "@/components/QuickOrderDialog";
import ShoppingCart from "@/components/ShoppingCart";
import heroBackground from "@/assets/hero-background.jpg";
import { Cookie } from "lucide-react";

const HeroSection = () => {
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [crumbs, setCrumbs] = useState<Array<{ id: number; delay: number; duration: number; left: string }>>([]);

  const slogans = [
    "Galletas que derriten corazones 🍪",
    "Rellenas de sabor, hechas con amor 💛",
    "El gimnasio puede esperar... las rellenitas no 😋"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate falling crumbs
    const newCrumbs = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      left: `${Math.random() * 100}%`
    }));
    setCrumbs(newCrumbs);
  }, []);

  const handleOrderNow = () => {
    setIsQuickOrderOpen(true);
  };

  const handleOpenCart = () => {
    setIsQuickOrderOpen(false);
    setIsCartOpen(true);
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      
      {/* Dual Overlay - Warmth + Depth */}
      <div className="absolute inset-0 hero-overlay-warm" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      
      {/* Falling Crumbs Animation */}
      {crumbs.map((crumb) => (
        <div
          key={crumb.id}
          className="crumb animate-fall"
          style={{
            left: crumb.left,
            animationDelay: `${crumb.delay}s`,
            animationDuration: `${crumb.duration}s`
          }}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Artisanal Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 mb-6 animate-float">
          <Cookie className="w-5 h-5 text-gold" />
          <span className="text-white text-sm font-quicksand font-semibold tracking-wide">
            100% Artesanal • Valledupar
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-quicksand font-bold text-white mb-6 leading-tight text-shadow-soft">
          El gimnasio puede esperar…<br />
          <span className="text-gold text-shadow-glow">las rellenitas no.</span>
        </h1>
        
        {/* Animated Slogan with Typewriter Effect */}
        <div className="h-16 mb-8 flex items-center justify-center">
          <p 
            key={currentSlogan}
            className="text-2xl sm:text-3xl md:text-4xl text-white/95 font-quicksand font-medium animate-fade-in text-shadow-soft"
          >
            {slogans[currentSlogan]}
          </p>
        </div>
        
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 font-lato max-w-3xl mx-auto leading-relaxed text-shadow-soft">
          Galletas artesanales con rellenos que enamoran. Hechas con amor en Valledupar.
        </p>
        
        {/* CTA Button with Glow Effect */}
        <Button 
          onClick={handleOrderNow}
          size="lg"
          className="btn-primary-glow font-quicksand font-bold px-10 py-6 text-xl rounded-2xl animate-bounce-subtle hover:animate-glow border-2 border-white/20"
        >
          🍪 ¡Pedir Ahora!
        </Button>

        {/* Secondary Info */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="font-lato text-sm">Entrega a domicilio</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <span className="font-lato text-sm">Perfectas para regalar</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">💝</span>
            <span className="font-lato text-sm">Hechas con amor</span>
          </div>
        </div>
      </div>

      {/* Quick Order Dialog */}
      <QuickOrderDialog 
        open={isQuickOrderOpen} 
        onOpenChange={setIsQuickOrderOpen}
        onOpenCart={handleOpenCart}
      />

      {/* Shopping Cart */}
      <ShoppingCart 
        open={isCartOpen} 
        onOpenChange={setIsCartOpen}
      />
    </section>
  );
};

export default HeroSection;

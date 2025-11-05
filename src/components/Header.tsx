import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, LogOut, LogIn, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import ShoppingCartPanel from "@/components/ShoppingCart";
import QuickOrderDialog from "@/components/QuickOrderDialog";
import logo from "@/assets/new-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getTotalItems } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: "Inicio", href: "#inicio" },
    { name: "Productos", href: "#productos" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Pedidos", href: "#pedidos" },
    { name: "Contacto", href: "#contacto" },
  ];

  const handleWhatsApp = () => {
    setIsQuickOrderOpen(true);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-card/80 backdrop-blur-md border-b border-border shadow-soft' 
          : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img src={logo} alt="Rellenitas" className="h-10 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-baseline space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6 text-primary" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {user ? (
                <div className="flex items-center gap-3 border-l border-border pl-4">
                  {isAdmin && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Salir
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              )}
            </div>

            {/* Mobile menu button and cart */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6 text-primary" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  title="Salir"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/auth')}
                  title="Iniciar sesión"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                {user && (
                  <div className="border-t border-border pt-2 mt-2">
                    {isAdmin && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          navigate('/admin');
                          setIsMenuOpen(false);
                        }}
                        className="w-full gap-2 mb-2"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Panel de Administración
                      </Button>
                    )}
                    <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.email}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* WhatsApp floating button */}
      <Button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 z-50 btn-whatsapp rounded-full shadow-lg px-4 py-3 h-auto"
        size="lg"
      >
        <span className="text-xl mr-2">📱</span>
        <span className="hidden sm:inline">¡Habla con nosotros!</span>
        <span className="sm:hidden">WhatsApp</span>
      </Button>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel open={isCartOpen} onOpenChange={setIsCartOpen} />
      
      {/* Quick Order Dialog */}
      <QuickOrderDialog 
        open={isQuickOrderOpen} 
        onOpenChange={setIsQuickOrderOpen}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </>
  );
};

export default Header;
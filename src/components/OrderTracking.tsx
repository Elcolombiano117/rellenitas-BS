import { useState, useEffect } from "react";
import { CheckCircle, Package, Truck, Heart, MapPin, Clock, Gift, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface OrderTrackingProps {
  orderId: string;
  customerName?: string;
  dedicatoria?: string;
}

const OrderTracking = ({ orderId, customerName = "amigo", dedicatoria }: OrderTrackingProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [showShareModal, setShowShareModal] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [showConfetti, setShowConfetti] = useState(false);

  // Map database status to stage number
  const statusToStage: { [key: string]: number } = {
    pending: 1,
    preparing: 2,
    ready: 3,
    in_delivery: 4,
    delivered: 5
  };

  const stages = [
    {
      id: 1,
      status: "pending",
      title: "PEDIDO RECIBIDO",
      subtitle: "¡TU PEDIDO ESTÁ EN COLA!",
      icon: Clock,
      description: "Tu pedido ha sido recibido y está esperando para ser preparado. En breve comenzaremos a trabajar en tu Rellenita.",
      color: "from-yellow-400 to-yellow-500",
      animation: "animate-pulse"
    },
    {
      id: 2,
      status: "preparing",
      title: "EN PREPARACIÓN",
      subtitle: "¡TU RELLENITA ESTÁ NACIENDO!",
      icon: ChefHat,
      description: "Tu Rellenita está naciendo. Cada capa se hace con amor, no con máquinas. El relleno se derrite perfectamente mientras esperamos el momento ideal.",
      color: "from-primary to-primary-glow",
      animation: "animate-pulse"
    },
    {
      id: 3,
      status: "ready",
      title: "LISTA PARA ENTREGA",
      subtitle: "¡EMPACADA CON CARIÑO!",
      icon: Package,
      description: `Empacada con cariño y lista para salir… ${dedicatoria ? `Con tu dedicatoria especial: "${dedicatoria}"` : 'Perfectamente preparada en nuestra caja especial.'}`,
      color: "from-chocolate to-chocolate-light",
      animation: "animate-bounce"
    },
    {
      id: 4,
      status: "in_delivery",
      title: "EN CAMINO",
      subtitle: "¡EL REPARTIDOR VA POR TI!",
      icon: Truck,
      description: "¡El repartidor va por ti! Juanito está en camino desde nuestra ubicación en Valledupar hasta tu dirección.",
      color: "from-morado to-morado-light",
      animation: "animate-pulse"
    },
    {
      id: 5,
      status: "delivered",
      title: "¡ENTREGADO!",
      subtitle: "¡TU MOMENTO DULCE HA LLEGADO!",
      icon: CheckCircle,
      description: "Tu momento dulce ha llegado… ¡Disfrútala! Cada bocado es una pequeña celebración.",
      color: "from-primary to-secondary",
      animation: "animate-bounce"
    }
  ];

  // Fetch order status from database
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("order_status")
          .eq("id", orderId)
          .single();

        if (error) throw error;
        
        if (data) {
          setOrderStatus(data.order_status);
          setCurrentStage(statusToStage[data.order_status] || 1);
          
          if (data.order_status === "delivered") {
            setShowConfetti(true);
          }
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
      }
    };

    fetchOrderStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const newStatus = payload.new.order_status;
          setOrderStatus(newStatus);
          setCurrentStage(statusToStage[newStatus] || 1);
          
          if (newStatus === "delivered") {
            setShowConfetti(true);
            // Play bell sound
            const audio = new Audio('data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdADAAAA');
            audio.play().catch(() => {}); // Ignore errors if audio fails
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Timer for estimated delivery time
  useEffect(() => {
    if (currentStage === 4) {
      const timer = setInterval(() => {
        setEstimatedTime(prev => Math.max(1, prev - 1));
      }, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [currentStage]);

  const currentStageData = stages[currentStage - 1];

  const handleShare = () => {
    const text = `Mi Rellenita llegó… y me hizo feliz. 🍫 #RellenitasValledupar #DulceDeCasa`;
    const url = `https://www.instagram.com/create/story/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppDedication = () => {
    window.open("https://wa.me/573142621490?text=¡Hola! Quiero agregar una dedicatoria especial a mi pedido " + orderId, "_blank");
  };

  const handleWhatsAppCard = () => {
    window.open("https://wa.me/573142621490?text=¡Hola! Quiero agregar una tarjeta personalizada a mi pedido " + orderId, "_blank");
  };

  const GalletaAnimation = () => (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-chocolate to-chocolate-light rounded-full animate-pulse"></div>
      <div className="absolute inset-2 bg-gradient-to-br from-morado to-morado-light rounded-full animate-bounce opacity-80"></div>
      <div className="absolute inset-4 bg-primary rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
        ❤️
      </div>
    </div>
  );

  const MapAnimation = () => (
    <div className="space-y-4">
      <div className="relative w-full h-48 bg-gradient-to-br from-beige to-white rounded-2xl p-4 overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.8855!2d-73.2480!3d10.4741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8ab9aa9e5f5ef3%3A0x1234567890abcdef!2sCarrera%206%20%2313C-14%2C%20Valledupar%2C%20Cesar!5e0!3m2!1ses!2sco!4v1640000000000!5m2!1ses!2sco"
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '12px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-primary animate-bounce" />
            <span className="text-xs font-semibold text-chocolate">Juanito en camino</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-4">
        <Clock className="w-5 h-5 text-morado" />
        <span className="font-semibold text-chocolate">Llegará en {estimatedTime} minutos</span>
      </div>
    </div>
  );

  const ConfettiAnimation = () => (
    showConfetti && (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-primary animate-bounce`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige via-white to-beige/50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-chocolate mb-2">
            El Camino de tu <span className="text-primary">Rellenita</span>
          </h1>
          <p className="text-chocolate/70 font-lato mb-4">
            Pedido #{orderId} • Para {customerName}
          </p>
          {/* Estado actual destacado */}
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-primary/20">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${currentStageData.color} animate-pulse`}></div>
            <span className="font-semibold text-chocolate">Estado: {currentStageData.title}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  index + 1 <= currentStage 
                    ? 'bg-primary text-white' 
                    : 'bg-chocolate/20 text-chocolate/50'
                }`}>
                  <stage.icon className="w-4 h-4" />
                </div>
                <div className="text-xs text-chocolate/60 font-lato mt-1 text-center max-w-16">
                  {stage.title}
                </div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-chocolate/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000 ease-out"
              style={{ width: `${(currentStage / stages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Stage */}
        <Card className="relative p-8 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <ConfettiAnimation />
          
          {currentStage === 1 && <GalletaAnimation />}
          
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentStageData.color} mx-auto mb-6 flex items-center justify-center ${currentStageData.animation}`}>
            <currentStageData.icon className="w-8 h-8 text-white" />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-poppins font-bold text-chocolate mb-2">
              {currentStageData.title}
            </h2>
            <h3 className="text-lg font-poppins font-semibold text-primary mb-4">
              {currentStageData.subtitle}
            </h3>
            <p className="text-chocolate/80 font-lato leading-relaxed mb-6">
              {currentStageData.description}
            </p>

            {/* Special interactions per stage */}
            {currentStage === 1 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-beige to-white p-6 rounded-2xl border border-chocolate/10">
                  <div className="text-4xl mb-3">⏳</div>
                  <p className="text-sm text-chocolate/70 font-lato">
                    Tu pedido está en cola. En breve comenzaremos a preparar tu Rellenita con amor.
                  </p>
                </div>
                <Button 
                  onClick={handleWhatsAppDedication}
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  ¿Quieres incluir una dedicatoria especial?
                </Button>
                <p className="text-xs text-chocolate/60 font-lato">
                  Escríbenos por WhatsApp: "¡Para mi amor, siempre!"
                </p>
              </div>
            )}

            {currentStage === 2 && (
              <div className="space-y-4">
                <GalletaAnimation />
                <div className="bg-gradient-to-r from-beige to-white p-6 rounded-2xl border border-chocolate/10">
                  <div className="text-4xl mb-3">👨‍🍳</div>
                  <p className="text-sm text-chocolate/70 font-lato">
                    Nuestro chef está preparando tu Rellenita. Cada capa se hace con dedicación.
                  </p>
                </div>
              </div>
            )}

            {currentStage === 3 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-beige to-white p-6 rounded-2xl border border-chocolate/10">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-sm text-chocolate/70 font-lato">
                    Tu Rellenita está perfectamente empacada en nuestra caja especial con cinta morada.
                  </p>
                </div>
                <Button 
                  onClick={handleWhatsAppCard}
                  variant="outline" 
                  className="border-morado text-morado hover:bg-morado hover:text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Agregar tarjeta personalizada
                </Button>
              </div>
            )}

            {currentStage === 4 && (
              <div className="mt-6">
                <MapAnimation />
              </div>
            )}

            {currentStage === 5 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-beige to-white p-6 rounded-2xl">
                  <div className="text-6xl animate-bounce mb-4">🍫</div>
                  <img 
                    src="/src/assets/rellenita-manjar.png" 
                    alt="Tu Rellenita lista" 
                    className="w-32 h-32 object-cover rounded-full mx-auto mb-4 shadow-lg"
                  />
                </div>
                <Button 
                  onClick={() => setShowShareModal(true)}
                  className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  ¡Comparte tu momento! 📸
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-md w-full bg-white">
              <div className="text-center">
                <h3 className="text-xl font-poppins font-bold text-chocolate mb-4">
                  ¡Comparte tu momento dulce!
                </h3>
                <p className="text-chocolate/70 font-lato mb-6">
                  Tu historia en Instagram con una plantilla lista
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={handleShare}
                    className="w-full bg-gradient-to-r from-[#E4405F] to-[#F77737] text-white font-semibold py-3 rounded-xl"
                  >
                    Abrir Instagram Stories
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowShareModal(false)}
                    className="w-full"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Audio Section */}
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <div className="text-center">
            <h3 className="text-lg font-poppins font-semibold text-chocolate mb-4">
              🎵 Escucha nuestro comercial
            </h3>
            <audio controls className="w-full">
              <source src="/src/assets/galletas-del-alma.mp3" type="audio/mpeg" />
              Tu navegador no soporta audio HTML5.
            </audio>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
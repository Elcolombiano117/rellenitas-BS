import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Search, Clock, ChefHat, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OrderSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [progressStage, setProgressStage] = useState<1 | 2 | 3>(1);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'preparing' | 'ready' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleWhatsAppOrder = () => {
    // Generate a unique order ID for tracking
    const orderId = `REL${Date.now().toString().slice(-6)}`;
    
    // For demo purposes, we'll open tracking after a short delay
    setTimeout(() => {
      window.open(`/seguimiento/${orderId}`, "_blank");
    }, 2000);
    
    window.open("https://wa.me/573142621490?text=¡Hola! Quiero pedir Rellenitas 😊", "_blank");

    // Mostrar barra de progreso local (simulada)
    setShowProgress(true);
    setProgressStage(1); // Pedido recibido
  };

  const handleCallOrder = () => {
    window.open("tel:+573142621490", "_self");
  };

  // Avance automático del progreso local (simulación)
  useEffect(() => {
    if (!showProgress) return;

    let timeoutId: number | undefined;
    if (progressStage === 1) {
      // Pasar de Pedido recibido -> En preparación
      timeoutId = window.setTimeout(() => setProgressStage(2), 5000);
    } else if (progressStage === 2) {
      // Pasar de En preparación -> Listo para entrega
      timeoutId = window.setTimeout(() => setProgressStage(3), 8000);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [showProgress, progressStage]);

  const handleTrackOrder = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Número requerido",
        description: "Por favor ingresa tu número de pedido",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar si el pedido existe
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_status")
        .eq("order_number", trackingNumber.trim())
        .single();

      if (error || !data) {
        toast({
          title: "Pedido no encontrado",
          description: "No se encontró un pedido con ese número. Verifica e intenta nuevamente.",
          variant: "destructive"
        });
        return;
      }

      // Mostrar barra de progreso con datos reales
      setTrackedOrderId(data.id);
      setShowProgress(true);
      setCurrentStatus(data.order_status as 'pending' | 'preparing' | 'ready');
      // Mapear estado a etapa
      const map: Record<string, 1 | 2 | 3> = { pending: 1, preparing: 2, ready: 3 };
      setProgressStage(map[data.order_status] ?? 1);
    } catch (error) {
      console.error("Error tracking order:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al buscar tu pedido. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  // Suscripción en tiempo real al estado del pedido rastreado
  useEffect(() => {
    if (!trackedOrderId) return;

    const channel = supabase
      .channel(`order-progress-${trackedOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${trackedOrderId}`
        },
        (payload) => {
          const status = (payload.new as any).order_status as 'pending' | 'preparing' | 'ready' | 'in_delivery' | 'delivered';
          setCurrentStatus(status as any);
          const map: Record<string, 1 | 2 | 3> = { pending: 1, preparing: 2, ready: 3 };
          if (status in map) setProgressStage(map[status]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackedOrderId]);

  return (
    <section id="pedidos" className="py-16 sm:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
            ¡Haz tu <span className="text-primary">pedido</span> ahora!
          </h2>
          <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
            Es muy fácil. Solo escríbenos por WhatsApp y te ayudaremos con todo
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* WhatsApp Button - Primary */}
          <div className="text-center mb-8">
            <Button 
              onClick={handleWhatsAppOrder}
              size="lg"
              className="btn-whatsapp text-white font-semibold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              📱 ¡Habla con nosotros por WhatsApp!
            </Button>
          </div>

          {/* Barra de progreso del pedido (local/simulada) */}
          {showProgress && (
            <div className="mb-10 bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border">
              <h3 className="text-xl font-poppins font-semibold text-foreground mb-4 text-center">
                Estado de tu pedido
              </h3>

              {/* Steps */}
              <div className="flex items-center justify-between mb-4">
                {[
                  { id: 1 as const, label: "Pedido recibido", Icon: Clock },
                  { id: 2 as const, label: "En preparación", Icon: ChefHat },
                  { id: 3 as const, label: "Listo para entrega", Icon: CheckCircle },
                ].map(({ id, label, Icon }) => (
                  <div key={id} className="flex flex-col items-center w-1/3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      progressStage >= id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center ${
                      progressStage >= id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Linear progress */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                  style={{ width: `${(progressStage / 3) * 100}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Este progreso es de referencia. Para seguimiento en tiempo real, usa tu número de pedido.
              </p>
            </div>
          )}
          
          {/* Alternative - Call Button */}
          <div className="text-center mb-8">
            <p className="text-muted-foreground font-lato mb-4">¿Prefieres llamar?</p>
            <Button 
              onClick={handleCallOrder}
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg rounded-xl w-full sm:w-auto"
            >
              <Phone className="w-5 h-5 mr-2" />
              Llamar ahora
            </Button>
          </div>
          
          {/* Process Steps */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 mt-12">
            <h3 className="text-2xl font-poppins font-bold text-foreground text-center mb-6">
              ¿Cómo funciona?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                  1
                </div>
                <h4 className="font-poppins font-semibold text-foreground mb-2">Escríbenos</h4>
                <p className="text-muted-foreground font-lato text-sm">
                  Dinos qué Rellenitas quieres y cuántas
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                  2
                </div>
                <h4 className="font-poppins font-semibold text-foreground mb-2">Confirmamos</h4>
                <p className="text-muted-foreground font-lato text-sm">
                  Te confirmamos el pedido y el tiempo de entrega
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                  3
                </div>
                <h4 className="font-poppins font-semibold text-foreground mb-2">¡Disfruta!</h4>
                <p className="text-muted-foreground font-lato text-sm">
                  Recibe tus Rellenitas frescas y deliciosas
                </p>
              </div>
            </div>
          </div>

          {/* Track Your Order Section */}
          <div className="bg-gradient-to-br from-secondary/20 to-primary/10 rounded-2xl p-8 mt-8">
            <h3 className="text-2xl font-poppins font-bold text-foreground text-center mb-4">
              🔍 ¿Ya hiciste tu pedido?
            </h3>
            <p className="text-muted-foreground font-lato text-center mb-6">
              Consulta el estado de tu pedido en tiempo real
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Ej: REL001"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                className="flex-1 text-lg py-6"
              />
              <Button 
                onClick={handleTrackOrder}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 rounded-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Rastrear
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-lato text-center mt-4">
              Ingresa el número de pedido que te enviamos por WhatsApp
            </p>

            {/* Si hay seguimiento en vivo, mostrar también la barra encima */}
            {showProgress && (
              <div className="mt-8">
                <div className="mb-3 text-center text-sm text-muted-foreground">
                  {trackedOrderId ? (
                    <span>Seguimiento en vivo activado para el pedido <strong>{trackingNumber}</strong></span>
                  ) : (
                    <span>Progreso simulado</span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  {[
                    { id: 1 as const, label: "Pedido recibido", Icon: Clock },
                    { id: 2 as const, label: "En preparación", Icon: ChefHat },
                    { id: 3 as const, label: "Listo para entrega", Icon: CheckCircle },
                  ].map(({ id, label, Icon }) => (
                    <div key={id} className="flex flex-col items-center w-1/3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        progressStage >= id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`mt-2 text-xs font-medium text-center ${
                        progressStage >= id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                    style={{ width: `${(progressStage / 3) * 100}%` }}
                  />
                </div>
                {trackedOrderId && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/seguimiento/${trackedOrderId}`, '_blank')}
                    >
                      Ver seguimiento completo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
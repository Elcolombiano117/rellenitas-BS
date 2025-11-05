import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  product_name: string;
  quantity: number;
  product_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  order_status: string;
  created_at: string;
  notes?: string;
  order_items: OrderItem[];
}

const statusConfig = {
  pending: { 
    label: "Pendiente", 
    color: "bg-yellow-500 text-white hover:bg-yellow-600", 
    icon: Clock, 
    next: "preparing",
    instruction: "Toca para marcar En Preparación"
  },
  preparing: { 
    label: "En Preparación", 
    color: "bg-blue-500 text-white hover:bg-blue-600", 
    icon: Package, 
    next: "ready",
    instruction: "Toca para marcar Listo"
  },
  ready: { 
    label: "Listo para Entrega/Recogida", 
    color: "bg-green-500 text-white hover:bg-green-600", 
    icon: CheckCircle, 
    next: "in_delivery",
    instruction: "Toca para marcar En Entrega"
  },
  in_delivery: {
    label: "En Entrega",
    color: "bg-purple-500 text-white hover:bg-purple-600",
    icon: Package,
    next: "delivered",
    instruction: "Toca para marcar Entregado"
  }
};

export const KitchenDisplay = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    // Real-time updates
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
          // Play notification sound for new orders
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .in('order_status', ['pending', 'preparing', 'ready', 'in_delivery'])
        .order("created_at", { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const playNotificationSound = () => {
    // Simple beep notification
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Actualizar el estado del pedido
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Obtener la sesión actual para registrar quién hizo el cambio
      const { data: { session } } = await supabase.auth.getSession();

      // Registrar el cambio en el historial
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: newStatus,
        changed_by: session?.user?.id || null,
        created_at: new Date().toISOString()
      });

      // Actualizar el estado local inmediatamente
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_status: newStatus }
            : order
        ).filter(order => 
          ['pending', 'preparing', 'ready', 'in_delivery'].includes(order.order_status)
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const formatTime = (date: string) => {
    const orderDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / 60000);
    
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }
    
    return orderDate.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <h1 className="text-4xl font-poppins font-bold text-foreground mb-2">
          Pantalla de Cocina
        </h1>
        <p className="text-lg text-muted-foreground">
          {orders.length} {orders.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-2xl font-semibold text-foreground">
              ¡Todo listo! No hay pedidos pendientes
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const config = statusConfig[order.order_status as keyof typeof statusConfig];
            if (!config) return null;
            
            const StatusIcon = config.icon;
            
            return (
              <Card 
                key={order.id} 
                className="p-6 border-2 hover:border-primary transition-all cursor-pointer active:scale-95"
                onClick={() => {
                  if (config.next) {
                    updateOrderStatus(order.id, config.next);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-4xl font-bold text-primary mb-2">
                      #{order.order_number}
                    </h2>
                    <p className="text-xl font-semibold text-foreground">
                      {order.customer_name}
                    </p>
                  </div>
                  <Badge className={`${config.color} px-4 py-2 text-base`}>
                    <StatusIcon className="w-5 h-5 mr-2" />
                    {config.label}
                  </Badge>
                </div>

                <div className="mb-4 space-y-2">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <span className="text-xl font-medium text-foreground">
                        {item.product_name}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <p className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      📝 Nota del cliente:
                    </p>
                    <p className="text-base text-yellow-700 dark:text-yellow-300">
                      {order.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-base text-muted-foreground font-medium">
                    {formatTime(order.created_at)}
                  </span>
                </div>

                {config.next && (
                  <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-dashed border-primary">
                    <p className="text-lg font-semibold text-primary">
                      👆 {config.instruction}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

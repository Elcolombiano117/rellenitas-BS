import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Truck, Package } from "lucide-react";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-500", icon: CheckCircle },
  preparing: { label: "Preparando", color: "bg-purple-500", icon: Package },
  ready: { label: "Listo", color: "bg-green-500", icon: CheckCircle },
  in_delivery: { label: "En camino", color: "bg-indigo-500", icon: Truck },
  delivered: { label: "Entregado", color: "bg-green-600", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-500", icon: XCircle },
};

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Real-time updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("order_status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Add to history
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: newStatus,
        notes: `Estado actualizado a ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
      });

      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado exitosamente",
      });

      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Cargando pedidos...</div>;
  }

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg mt-10">
      <h2 className="text-2xl font-poppins font-bold mb-6">Panel de Administración</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold">Gestión de Pedidos</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 py-1.5 px-2 rounded border border-slate-300">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="preparing">Preparando</SelectItem>
            <SelectItem value="ready">Listos</SelectItem>
            <SelectItem value="in_delivery">En camino</SelectItem>
            <SelectItem value="delivered">Entregados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No hay pedidos que mostrar
          </Card>
        ) : (
          <>
            {/* Vista móvil - Tarjetas */}
            <div className="block lg:hidden space-y-4">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.order_status as keyof typeof statusConfig].icon;
                return (
                  <div 
                    key={order.id} 
                    className="mb-4 p-3 border border-slate-300 rounded-md bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-mono text-sm font-bold">
                          {order.order_number}
                        </div>
                        <div className="font-semibold mt-1">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                      </div>
                      <Badge className={statusConfig[order.order_status as keyof typeof statusConfig].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[order.order_status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    
                    <div className="text-sm mb-3 space-y-1">
                      {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx}>
                          {item.product_name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">
                        {formatPrice(order.total_amount)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    
                    <Select
                      value={order.order_status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-full py-1.5 px-2 rounded border border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden lg:block bg-white rounded-lg border border-slate-300 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.order_status as keyof typeof statusConfig].icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold">{order.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.order_items?.map((item: any, idx: number) => (
                              <div key={idx}>
                                {item.product_name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[order.order_status as keyof typeof statusConfig].color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[order.order_status as keyof typeof statusConfig].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.order_status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-40 py-1.5 px-2 rounded border border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

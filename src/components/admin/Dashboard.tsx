import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users, Package } from "lucide-react";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    topProducts: [] as any[],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Today's orders
      const { data: todayOrdersData, count: todayOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", today.toISOString());

      // Pending orders
      const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("order_status", ["pending", "confirmed", "preparing"]);

      // Total revenue
      const { data: allOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid");

      const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Top products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal");

      const productStats = orderItems?.reduce((acc: any, item) => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
        }
        acc[item.product_name].quantity += item.quantity;
        acc[item.product_name].revenue += Number(item.subtotal);
        return acc;
      }, {});

      const topProducts = Object.values(productStats || {})
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        totalRevenue,
        todayRevenue,
        pendingOrders: pendingOrders || 0,
        topProducts,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-poppins font-bold">Dashboard QSR</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs opacity-90">Hoy: {stats.todayOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs opacity-90">Hoy: {formatPrice(stats.todayRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs opacity-90">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.todayRevenue / (stats.todayOrders || 1))}
            </div>
            <p className="text-xs opacity-90">Por pedido</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topProducts.map((product: any, index) => (
              <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.quantity} unidades</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{formatPrice(product.revenue)}</div>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No hay datos disponibles</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dashboard } from "@/components/admin/Dashboard";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { CouponsManagement } from "@/components/admin/CouponsManagement";
import { RolesManagement } from "@/components/admin/RolesManagement";
import { LayoutDashboard, ShoppingCart, Tag, Shield } from "lucide-react";

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-poppins font-bold text-foreground mb-8">
          Sistema QSR - Las Rellenitas
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Cupones</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <CouponsManagement />
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <RolesManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;

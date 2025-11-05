import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CouponsManagement = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase_amount: "",
    max_uses: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return;
    }

    setCoupons(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      is_active: true,
    };

    const { error } = editingCoupon
      ? await supabase.from("coupons").update(couponData).eq("id", editingCoupon.id)
      : await supabase.from("coupons").insert(couponData);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: editingCoupon ? "Cupón actualizado" : "Cupón creado",
      description: "El cupón ha sido guardado exitosamente",
    });

    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase_amount: "",
      max_uses: "",
    });
    setEditingCoupon(null);
    setIsDialogOpen(false);
    fetchCoupons();
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase_amount: coupon.min_purchase_amount?.toString() || "",
      max_uses: coupon.max_uses?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cupón eliminado",
      description: "El cupón ha sido eliminado exitosamente",
    });

    fetchCoupons();
  };

  const toggleActive = async (coupon: any) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchCoupons();
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-poppins font-bold">Gestión de Cupones</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCoupon(null);
              setFormData({
                code: "",
                discount_type: "percentage",
                discount_value: "",
                min_purchase_amount: "",
                max_uses: "",
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Cupón
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Editar Cupón" : "Crear Nuevo Cupón"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Código del cupón</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VERANO2024"
                  required
                />
              </div>

              <div>
                <Label htmlFor="discount_type">Tipo de descuento</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="fixed">Monto fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">
                  Valor del descuento {formData.discount_type === "percentage" ? "(%)" : "(COP)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === "percentage" ? "10" : "5000"}
                  required
                />
              </div>

              <div>
                <Label htmlFor="min_purchase">Compra mínima (opcional)</Label>
                <Input
                  id="min_purchase"
                  type="number"
                  value={formData.min_purchase_amount}
                  onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                  placeholder="10000"
                />
              </div>

              <div>
                <Label htmlFor="max_uses">Usos máximos (opcional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="100"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCoupon ? "Actualizar" : "Crear"} Cupón
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Compra Mínima</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                <TableCell>
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : formatPrice(coupon.discount_value)}
                </TableCell>
                <TableCell>
                  {coupon.min_purchase_amount ? formatPrice(coupon.min_purchase_amount) : "-"}
                </TableCell>
                <TableCell>
                  {coupon.max_uses
                    ? `${coupon.times_used || 0} / ${coupon.max_uses}`
                    : `${coupon.times_used || 0} / ∞`}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={coupon.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActive(coupon)}
                  >
                    {coupon.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

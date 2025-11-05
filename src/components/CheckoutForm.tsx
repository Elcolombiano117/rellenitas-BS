import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CartItem } from "@/hooks/useCart";
import { ArrowLeft, CheckCircle, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre completo es obligatorio").max(100),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(200),
  city: z.string().trim().min(1, "La ciudad es obligatoria").max(100),
  department: z.string().trim().min(1, "El departamento es obligatorio").max(100),
  phone: z.string().trim().min(7, "El número de teléfono debe tener al menos 7 dígitos").max(15),
  paymentMethod: z.enum(["efectivo", "transferencia", "online"], {
    required_error: "Debes seleccionar un método de pago",
  }),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  couponCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  items: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onConfirm: (data: any) => void;
}

const CheckoutForm = ({ items, totalPrice, onBack, onConfirm }: CheckoutFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      city: "Valledupar",
      department: "Cesar",
      email: "",
      couponCode: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleApplyCoupon = async () => {
    const code = getValues("couponCode");
    if (!code) return;

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      toast({
        title: "Cupón inválido",
        description: "El cupón ingresado no es válido o ha expirado.",
        variant: "destructive",
      });
      return;
    }

    if (coupon.min_purchase_amount && totalPrice < coupon.min_purchase_amount) {
      toast({
        title: "Monto mínimo no alcanzado",
        description: `El cupón requiere una compra mínima de ${formatPrice(coupon.min_purchase_amount)}`,
        variant: "destructive",
      });
      return;
    }

    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (totalPrice * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    setCouponDiscount(discount);
    setAppliedCoupon(code.toUpperCase());
    toast({
      title: "¡Cupón aplicado!",
      description: `Descuento de ${formatPrice(discount)} aplicado exitosamente.`,
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate order number
      const orderNumber = `REL-${Date.now().toString().slice(-8)}`;
      
      const finalTotal = totalPrice - couponDiscount;
      
       console.log("Creating order with data:", { orderNumber, finalTotal, items });
     
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: data.fullName,
          customer_email: data.email || null,
          customer_phone: data.phone,
          delivery_address: data.address,
          delivery_city: data.city,
          delivery_department: data.department,
          payment_method: data.paymentMethod,
          order_status: "pending",
          payment_status: data.paymentMethod === "online" ? "pending" : "pending",
          subtotal: totalPrice,
          discount_amount: couponDiscount,
          total_amount: finalTotal,
          coupon_code: appliedCoupon || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;
     
       console.log("Order created successfully:", order);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create initial status history
      await supabase.from("order_status_history").insert({
        order_id: order.id,
        status: "pending",
        notes: "Pedido creado",
      });

      toast({
        title: "¡Pedido creado exitosamente!",
        description: `Número de pedido: ${orderNumber}`,
      });

       console.log("Calling onConfirm with:", { ...data, orderNumber, orderId: order.id });
     
      // Pass order data to WhatsApp confirmation
      onConfirm({ ...data, orderNumber, orderId: order.id });
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error al procesar el pedido",
        description: "Por favor intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-poppins font-bold text-foreground">
          Confirmar pedido
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Resumen del pedido */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-poppins font-semibold text-foreground mb-3">
            Resumen del pedido
          </h3>
          <div className="space-y-2 mb-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
            </div>
            
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({appliedCoupon}):</span>
                <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-poppins font-bold text-foreground">Total:</span>
              <span className="text-xl font-poppins font-bold text-primary">
                {formatPrice(totalPrice - couponDiscount)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de datos */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-foreground">
              Nombre completo *
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              className="mt-1.5"
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground">
              Email (opcional)
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1.5"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address" className="text-foreground">
              Dirección de entrega *
            </Label>
            <Input
              id="address"
              {...register("address")}
              className="mt-1.5"
              placeholder="Ej: Calle 15 #10-20, Barrio Centro"
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-foreground">
                Ciudad *
              </Label>
              <Input
                id="city"
                {...register("city")}
                className="mt-1.5"
                placeholder="Ej: Valledupar"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="department" className="text-foreground">
                Departamento *
              </Label>
              <Input
                id="department"
                {...register("department")}
                className="mt-1.5"
                placeholder="Ej: Cesar"
              />
              {errors.department && (
                <p className="text-sm text-destructive mt-1">{errors.department.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-foreground">
              Número de teléfono *
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              className="mt-1.5"
              placeholder="Ej: 3001234567"
              type="tel"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="couponCode" className="text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Cupón de descuento (opcional)
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="couponCode"
                {...register("couponCode")}
                className="uppercase"
                placeholder="BIENVENIDA"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                variant="outline"
                className="whitespace-nowrap"
              >
                Aplicar
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-sm text-green-600 mt-1">✓ Cupón {appliedCoupon} aplicado</p>
            )}
          </div>

          <div>
            <Label className="text-foreground mb-3 block">
              Método de pago *
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setValue("paymentMethod", value as "efectivo" | "transferencia" | "online")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="cursor-pointer flex-1 text-foreground">
                  💵 Efectivo (contra entrega)
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia" className="cursor-pointer flex-1 text-foreground">
                  🏦 Transferencia (Bancolombia/Nequi)
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="cursor-pointer flex-1 text-foreground">
                  💳 Pago en línea
                </Label>
              </div>
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive mt-1">{errors.paymentMethod.message}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="sticky bottom-0 bg-background pt-4 space-y-3 pb-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-lg font-semibold rounded-xl"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {isSubmitting ? "Procesando..." : "Confirmar pedido"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full h-11"
            size="lg"
          >
            Volver al carrito
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;

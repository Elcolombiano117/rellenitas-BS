import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import rellenitaOreo from "@/assets/rellenita-oreo.png";
import rellenitaManjar from "@/assets/rellenita-manjar.png";
import rellenitaMM from "@/assets/rellenita-mm.png";
import rellenitaSorpresa from "@/assets/rellenita-sorpresa.png";

interface QuickOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCart: () => void;
}

const QuickOrderDialog = ({ open, onOpenChange, onOpenCart }: QuickOrderDialogProps) => {
  const { items, addItem, updateQuantity } = useCart();

  const products = [
    {
      id: "rellenita-oreo",
      name: "Rellenita Oreo",
      price: 3500,
      image: rellenitaOreo,
      description: "Galleta artesanal con relleno cremoso de Oreo"
    },
    {
      id: "rellenita-manjar",
      name: "Rellenita Manjar",
      price: 3800,
      image: rellenitaManjar,
      description: "Deliciosa galleta con manjar blanco derretido"
    },
    {
      id: "rellenita-mm",
      name: "Rellenita M&M's",
      price: 4200,
      image: rellenitaMM,
      description: "Explosión de colores y sabores con M&M's"
    },
    {
      id: "rellenita-sorpresa",
      name: "Rellenita Sorpresa",
      price: 4000,
      image: rellenitaSorpresa,
      description: "Sorpresa dulce con mermelada de frutos rojos"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductQuantity = (productId: string) => {
    const item = items.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (product: typeof products[0]) => {
    const quantity = getProductQuantity(product.id);
    if (quantity === 0) {
      addItem(product);
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = (productId: string) => {
    const quantity = getProductQuantity(productId);
    if (quantity > 0) {
      updateQuantity(productId, quantity - 1);
    }
  };

  const handleGoToCart = () => {
    onOpenChange(false);
    onOpenCart();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-poppins font-bold text-foreground">
            🍪 Nuestros sabores disponibles
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Selecciona tus rellenitas favoritas
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-poppins font-semibold text-xl mb-1 text-foreground">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {product.description}
                </p>
                <div className="text-2xl font-bold text-primary mb-3">
                  {formatPrice(product.price)}
                </div>

                {getProductQuantity(product.id) === 0 ? (
                  <Button
                    onClick={() => handleIncrement(product)}
                    className="w-full bg-primary text-white hover:bg-primary/90 rounded-full"
                  >
                    Añadir
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => handleDecrement(product.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <span className="text-xl font-bold text-foreground min-w-[2rem] text-center">
                      {getProductQuantity(product.id)}
                    </span>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => handleIncrement(product)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalItems > 0 && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-foreground">
                {totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </span>
            </div>
            <Button
              onClick={handleGoToCart}
              className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-lg font-semibold rounded-xl"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ver carrito y finalizar pedido
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickOrderDialog;

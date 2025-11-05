import { Heart, Gift, Coffee, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutSection = () => {
  const features = [
    {
      icon: Gift,
      title: "Regalo perfecto",
      description: "Ideales para sorprender a quien más quieres"
    },
    {
      icon: Users,
      title: "Para compartir",
      description: "Momentos dulces que unen a las familias"
    },
    {
      icon: Coffee,
      title: "Merienda especial",
      description: "El complemento perfecto para tu café"
    },
    {
      icon: Heart,
      title: "Hecho con amor",
      description: "Cada galleta lleva nuestro cariño"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-warm-beige">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-foreground mb-6">
            ¿Qué son las <span className="text-primary">Rellenitas</span>?
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lg sm:text-xl text-muted-foreground font-lato leading-relaxed">
              No son solo galletas. Son pequeños momentos de dulzura hechos realidad. 
              Cada Rellenita combina una base crujiente de galleta artesanal con un relleno 
              irresistible —desde Oreo hasta Manjar Blanco—, envuelto en chocolate premium 
              y decorado con cariño. Ideales para meriendas, regalos, celebraciones o 
              simplemente para ti, después de un largo día.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover text-center border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-lato">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
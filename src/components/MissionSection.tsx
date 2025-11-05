import { Target, Eye, Star, Lightbulb, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MissionSection = () => {
  const values = [
    {
      icon: Star,
      title: "Calidad",
      description: "Ingredientes premium en cada galleta"
    },
    {
      icon: Lightbulb,
      title: "Creatividad",
      description: "Sabores únicos e innovadores"
    },
    {
      icon: Target,
      title: "Cercanía",
      description: "Conexión auténtica con nuestra comunidad"
    },
    {
      icon: Eye,
      title: "Innovación",
      description: "Siempre explorando nuevos sabores"
    },
    {
      icon: MapPin,
      title: "Sabor local",
      description: "Orgullo vallenato en cada bocado"
    }
  ];

  return (
    <section id="nosotros" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
            Nuestra <span className="text-primary">esencia</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Misión */}
          <Card className="card-hover border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-poppins font-bold text-foreground">Misión</h3>
              </div>
              <p className="text-muted-foreground font-lato text-lg leading-relaxed">
                Posicionarnos como un emprendimiento local exitoso, donde nuestras galletas 
                sean sinónimo de sabor y calidad en toda la región.
              </p>
            </CardContent>
          </Card>

          {/* Visión */}
          <Card className="card-hover border-0 bg-gradient-to-br from-secondary/5 to-primary/5">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-secondary mr-3" />
                <h3 className="text-2xl font-poppins font-bold text-foreground">Visión</h3>
              </div>
              <p className="text-muted-foreground font-lato text-lg leading-relaxed">
                Endulzar a nuestra comunidad con galletas de chocolates y rellenos únicos, 
                ofreciendo calidad y sabor en cada bocado.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Valores */}
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-poppins font-bold text-foreground mb-4">
            Nuestros <span className="text-primary">valores</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="card-hover text-center border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-poppins font-semibold text-lg mb-2 text-foreground">
                  {value.title}
                </h4>
                <p className="text-muted-foreground font-lato text-sm">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
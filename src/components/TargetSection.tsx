import { GraduationCap, Heart, Users, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TargetSection = () => {
  const segments = [
    {
      icon: GraduationCap,
      title: "Para estudiantes",
      description: "que necesitan un break dulce entre clases y estudios."
    },
    {
      icon: Users,
      title: "Para familias",
      description: "que buscan un detalle auténtico para compartir momentos especiales."
    },
    {
      icon: Heart,
      title: "Para quienes creen",
      description: "que un pequeño lujo hace la diferencia en el día a día."
    },
    {
      icon: Coffee,
      title: "Para ti",
      description: "después de un día agotador, cuando mereces algo especial."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-warm-beige to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
            Hechas para <span className="text-primary">TI</span>
          </h2>
          <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
            Porque cada persona merece su momento dulce perfecto
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {segments.map((segment, index) => (
            <Card key={index} className="card-hover border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <segment.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-poppins font-semibold text-xl mb-2 text-foreground">
                    {segment.title}
                  </h3>
                  <p className="text-muted-foreground font-lato leading-relaxed">
                    {segment.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetSection;
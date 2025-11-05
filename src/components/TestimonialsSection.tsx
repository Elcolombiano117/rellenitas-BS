import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Daniela",
      role: "Estudiante U.V.",
      text: "¡Las Rellenitas me salvaron el cumpleaños de mi novia! Nunca pensé que unas galletas pudieran hacerme tan feliz.",
      rating: 5
    },
    {
      name: "Carlos",
      role: "Papá de familia",
      text: "Mis hijos no paran de pedirme que compremos más Rellenitas. ¡Son su merienda favorita!",
      rating: 5
    },
    {
      name: "María José",
      role: "Profesional",
      text: "Después de un día estresante en el trabajo, una Rellenita con café es mi momento de paz.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-warm-beige">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
            Lo que dicen nuestros <span className="text-primary">clientes</span>
          </h2>
          <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
            Testimonios reales de personas que han probado nuestras Rellenitas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover border-0 bg-card/90 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <blockquote className="text-muted-foreground font-lato text-lg leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Author */}
                <div className="border-t border-border pt-4">
                  <p className="font-poppins font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-muted-foreground font-lato text-sm">
                    {testimonial.role}
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

export default TestimonialsSection;
import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Ubicación",
      content: "Cra. 6 #13C-14, Valledupar, Cesar",
      action: () => window.open("https://maps.google.com/?q=Cra.+6+%2313C-14,+Valledupar,+Cesar", "_blank")
    },
    {
      icon: Phone,
      title: "Teléfono",
      content: "+57 300 123 4567",
      action: () => window.open("tel:+573001234567", "_self")
    },
    {
      icon: Mail,
      title: "Email",
      content: "hola@rellenitas.com.co",
      action: () => window.open("mailto:hola@rellenitas.com.co", "_self")
    },
    {
      icon: Instagram,
      title: "Instagram",
      content: "@rellenitas.valledupar",
      action: () => window.open("https://instagram.com/rellenitas.valledupar", "_blank")
    }
  ];

  return (
    <section id="contacto" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
            Encuéntranos en <span className="text-primary">Valledupar</span>
          </h2>
          <p className="text-lg text-muted-foreground font-lato max-w-2xl mx-auto">
            Estamos ubicados en el corazón de la ciudad, listos para endulzar tu día
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card 
                key={index} 
                className="card-hover border-0 bg-card/80 backdrop-blur-sm cursor-pointer"
                onClick={info.action}
              >
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-lg text-foreground mb-1">
                      {info.title}
                    </h3>
                    <p className="text-muted-foreground font-lato">
                      {info.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Map */}
          <div className="h-80 lg:h-full min-h-[400px]">
            <Card className="h-full border-0 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.123456789!2d-73.25!3d10.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI4JzEyLjAiTiA3M8KwMTUnMDAuMCJX!5e0!3m2!1ses!2sco!4v1620000000000!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Rellenitas en Valledupar"
              ></iframe>
            </Card>
          </div>
        </div>
        
        {/* Business Hours */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                Horarios de atención
              </h3>
              <div className="space-y-2 text-muted-foreground font-lato">
                <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                <p>Sábados: 9:00 AM - 5:00 PM</p>
                <p>Domingos: 10:00 AM - 4:00 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
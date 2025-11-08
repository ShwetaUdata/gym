import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Users, Target, Calendar } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Dumbbell className="w-12 h-12 text-primary" />,
      title: "Personal Training",
      description: "One-on-one sessions with certified trainers tailored to your goals"
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Group Classes",
      description: "High-energy group workouts including HIIT, Yoga, and Spin"
    },
    {
      icon: <Target className="w-12 h-12 text-primary" />,
      title: "Nutrition Plans",
      description: "Customized meal plans designed to complement your fitness routine"
    },
    {
      icon: <Calendar className="w-12 h-12 text-primary" />,
      title: "Flexible Membership",
      description: "Choose from various membership options that fit your schedule"
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground">
          Our Services
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="mb-4">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

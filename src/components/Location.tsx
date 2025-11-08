import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Location = () => {
  return (
    <section id="location" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground">
          Visit Us
        </h2>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="animate-slide-in">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Address</h3>
                  <p className="text-muted-foreground">
                     532/4/A, Akkalkot Road, After<br />
                    Iskon Temple, opposite Road of TATA <br />
                    motors, Solapur, Maharashtra 413006.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Phone</h3>
                  <p className="text-muted-foreground">9970793972</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground">usgymnasium@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Hours</h3>
                  <p className="text-muted-foreground">
                    Mon-Sat: Morning : 6:00 AM - 11:00 AM<br />
                    Mon-Sat: Evening : 5:00 PM - 10:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-in" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-0 h-full">
              <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-lg">
                <span className="text-muted-foreground"><iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15101.93426379102!2d75.95816859196893!3d17.662285939073247!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc5db221e1fab99%3A0xe5e60b898a66c2b2!2sUS%20GYMNASIUM!5e0!3m2!1sen!2sin!4v1712921978612!5m2!1sen!2sin" width="700" height="550" ></iframe></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Location;

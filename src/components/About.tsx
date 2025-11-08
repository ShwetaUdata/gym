import aboutImage from "@/assets/about-gym.jpg";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground animate-slide-in">
          About Us
        </h2>
        
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Main intro */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-in">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The diverse range of programs, from group exercises, corporate training to 
                personalized training, caters to varying fitness levels and goals. Members 
                get variety and the option of customization as each gym offers a diversity 
                of exercise options and specialized programs, allowing members to choose 
                activities that align with their interests and fitness objectives.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Personalized training programs ensure workouts are tailored to individual 
                needs, maximizing results. Participating in group exercises fosters a sense 
                of community among members, providing social support and encouragement, which 
                can be instrumental in maintaining consistency in their fitness journey.
              </p>
            </div>
            
            <Card className="overflow-hidden animate-slide-in hover:scale-105 transition-transform duration-500" style={{animationDelay: "100ms"}}>
              <img
                src={aboutImage}
                alt="Gym Training"
                className="w-full h-auto object-cover"
              />
            </Card>
          </div>

          {/* Corporate Membership */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="overflow-hidden animate-slide-in hover:scale-105 transition-transform duration-500 order-2 md:order-1">
              <img
                src={about1}
                alt="Corporate Membership"
                className="w-full h-auto object-cover"
              />
            </Card>
            
            <div className="space-y-4 animate-slide-in order-1 md:order-2" style={{animationDelay: "100ms"}}>
              <h3 className="text-2xl font-bold text-foreground">Corporate Membership</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Don't have time to go to the gym? We get the gym to you. Gymnasium offers 
                corporate membership programs tailored for companies looking to promote 
                employee wellness and fitness. These programs are designed to encourage a 
                healthier workforce by providing BMI screening, diet and nutrition counselling, 
                fitness activities and seminars for building a healthier lifestyle.
              </p>
            </div>
          </div>

          {/* Personal Training */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 animate-slide-in">
              <h3 className="text-2xl font-bold text-foreground">Personal Training</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Gymnasium is known for the competent personal trainers and extraordinary 
                personal training offered by them. The individuals seeking for serious 
                goal-oriented fitness, personalized guidance, motivation, and specialized 
                workout plans, Gymnasium personal training program is for them.
              </p>
            </div>
            
            <Card className="overflow-hidden animate-slide-in hover:scale-105 transition-transform duration-500" style={{animationDelay: "100ms"}}>
              <img
                src={about2}
                alt="Personal Training"
                className="w-full h-auto object-cover"
              />
            </Card>
          </div>

          {/* Group Program */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="overflow-hidden animate-slide-in hover:scale-105 transition-transform duration-500 order-2 md:order-1">
              <img
                src={aboutImage}
                alt="Group Program"
                className="w-full h-auto object-cover"
              />
            </Card>
            
            <div className="space-y-4 animate-slide-in order-1 md:order-2" style={{animationDelay: "100ms"}}>
              <h3 className="text-2xl font-bold text-foreground">Group Program</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Gymnasium provides a variety of group fitness programs such as dance fitness, 
                yoga, HIIT, and much more tailored to cater to diverse fitness preferences 
                and goals. These group programs offer a supportive environment and a sense 
                of community while engaging participants in fun and effective workouts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

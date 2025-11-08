import { Card, CardContent } from "@/components/ui/card";
import steamRoom from "@/assets/steam-room.jpg";

const Steam = () => {
  const benefits = [
    {
      title: "Improved Physical Health",
      description: "Cardiovascular Fitness: Regular exercise improves heart health and stamina, reduces the risk of heart disease, high blood pressure, and improves overall cardiovascular fitness. Strength and Endurance: Weight training and resistance exercises increase muscle strength."
    },
    {
      title: "Mental Health Benefits",
      description: "Stress Reduction: Physical activity increases in the concentrations of norepinephrine, a chemical that can moderate the brain's response to stress. Improved Mood: Exercise releases endorphins, which create feelings of happiness and euphoria."
    },
    {
      title: "Enhanced Cognitive Function",
      description: "Boosts Brain Health: Exercise improves brain function and protects memory and thinking skills. By increasing heart rate, the exercise helps promote the flow of blood and oxygen to the brain. Reduction in Cognitive Decline: Regular physical activity can help keep your thinking, learning, and judgment skills sharp as you age."
    },
    {
      title: "Social Benefits",
      description: "Community and Support: Gyms often offer a community environment where you can meet like-minded individuals who can motivate and support you. Increased Self-Confidence: By meeting fitness goals and improving your physique, exercise can help boost self-esteem and improve self-image."
    }
  ];

  return (
    <section id="steam" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground animate-slide-in">
          Luxury Steam & Health Benefits
        </h2>
        
        <div className="max-w-6xl mx-auto space-y-12">
          <Card className="overflow-hidden animate-slide-in">
            <img
              src={steamRoom}
              alt="Luxury Steam Room"
              className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
            />
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="animate-slide-in hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
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

export default Steam;

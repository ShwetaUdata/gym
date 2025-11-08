import { Card, CardContent } from "@/components/ui/card";
import proteinBar from "@/assets/protein-bar.jpg";
import { Dumbbell } from "lucide-react";

const Protein = () => {
  const products = [
    { name: "Whey Protein", price: "$49.99", description: "Premium whey protein for muscle building and recovery" },
    { name: "Casein Protein", price: "$44.99", description: "Slow-release protein perfect for overnight recovery" },
    { name: "Thorne Protein", price: "$54.99", description: "Plant-based protein with essential amino acids" },
    { name: "Pre-Workout", price: "$34.99", description: "Energy boost formula for intense training sessions" },
    { name: "BCAAs", price: "$29.99", description: "Branch chain amino acids for muscle recovery" },
    { name: "Creatine", price: "$24.99", description: "Pure creatine monohydrate for strength gains" }
  ];

  return (
    <section id="protein" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground animate-slide-in">
          Protein Powder & Supplements
        </h2>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Featured Image */}
          <Card className="overflow-hidden animate-slide-in">
            <img
              src={proteinBar}
              alt="Protein Bar"
              className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
            />
          </Card>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Dumbbell className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-foreground text-center">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 text-center">
                    {product.description}
                  </p>
                  <p className="text-primary font-bold text-2xl text-center">
                    {product.price}
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

export default Protein;

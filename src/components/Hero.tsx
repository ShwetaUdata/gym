import { useEffect, useState } from "react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroImages = [heroBg, hero1, hero2, hero3];
  
  const slides = [
    {
      title: "BELIEVE IN YOURSELF",
      subtitle: "AND YOU WILL BE UNSTOPPABLE",
      main: "YOUR TRUSTED FITNESS TRAINER",
      tagline: "I offer you Professional Fitness Club"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center text-white overflow-hidden transition-all duration-1000"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImages[currentSlide]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto px-4 text-center z-10 animate-fade-in">
        <p className="text-lg md:text-xl mb-4 tracking-wider text-accent animate-slide-in">
          {slides[0].subtitle}
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-in" style={{animationDelay: "200ms"}}>
          {slides[0].main}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-in" style={{animationDelay: "400ms"}}>
          {slides[0].tagline}
        </p>
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? "bg-primary w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;

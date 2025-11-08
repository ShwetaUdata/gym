import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LOGO1 from "@/assets/LOGO1.png";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-secondary/95 backdrop-blur-sm border-b-4 border-accent z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <img src={LOGO1} alt="Gymnasium Logo" className="w-16 h-16 rounded-full" />
            <span className="text-2xl md:text-3xl font-bold text-foreground italic">
              US Gymnasium
            </span>
          </div>

          {/* Navigation Links - Responsive */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-wrap">
            <button
              onClick={() => scrollToSection("home")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection("steam")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              Steam
            </button>
            <button
              onClick={() => scrollToSection("protein")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              Protein
            </button>
            <button
              onClick={() => scrollToSection("location")}
              className="text-foreground text-sm lg:text-base font-semibold hover:text-primary transition-colors"
            >
              Location
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              size="sm"
              onClick={() => scrollToSection("enquire")}
              className="text-xs md:text-sm"
            >
              Enquire
            </Button>
            {/* <Button size="sm" onClick={() => scrollToSection("enquire")} className="text-xs md:text-sm">
              Join Now
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

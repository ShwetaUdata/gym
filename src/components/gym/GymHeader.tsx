import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dumbbell, Menu, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { usePWA } from "@/hooks/usePWA";

interface GymHeaderProps {
  showNav?: boolean;
}

const navItems = [
  { to: "/", label: "Home" },
  { to: "/register", label: "Register" },
  { to: "/scan", label: "Scan" },
];

export function GymHeader({ showNav = true }: GymHeaderProps) {
  const { canInstall, isStandalone } = usePWA();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-gym-gold group-hover:glow transition-all duration-300">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-xl font-bold gradient-text">US Gymnasium</p>
            <p className="text-xs text-muted-foreground">Transform Your Life</p>
          </div>
        </Link>

        {showNav && (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-4" aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {canInstall && !isStandalone && (
                <Link
                  to="/install"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </Link>
              )}
            </nav>

            {/* Mobile nav */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile primary">
                    {navItems.map((item) => (
                      <Button key={item.to} variant="ghost" className="justify-start" asChild>
                        <Link to={item.to}>{item.label}</Link>
                      </Button>
                    ))}
                    {canInstall && !isStandalone && (
                      <Button variant="default" className="justify-start" asChild>
                        <Link to="/install">
                          <Download className="w-4 h-4 mr-2" />
                          Install App
                        </Link>
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

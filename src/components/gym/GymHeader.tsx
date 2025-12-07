import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GymHeaderProps {
  showNav?: boolean;
}

export function GymHeader({ showNav = true }: GymHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-gym-gold group-hover:glow transition-all duration-300">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">PowerFit Gym</h1>
            <p className="text-xs text-muted-foreground">Transform Your Life</p>
          </div>
        </Link>
        
        {showNav && (
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Register
            </Link>
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { GymHeader } from '@/components/gym/GymHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Users, Shield, Zap, Heart, UserCheck, ArrowRight, Scan } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <GymHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-bounce-subtle">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Transform Your Life Today</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">PowerFit</span>
            <br />
            <span className="text-foreground">Gym Management</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Complete gym management solution with member registration, payment tracking, 
            and administrative tools. Start your fitness journey with us!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                <UserCheck className="w-5 h-5" />
                New Member Registration
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/scan">
              <Button variant="glass" size="xl" className="gap-2 w-full sm:w-auto">
                <Scan className="w-5 h-5" />
                Check Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Complete Gym <span className="gradient-text">Management</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Everything you need to manage your gym efficiently
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Dumbbell,
                title: 'Gym Training',
                description: 'Access to all gym equipment and facilities',
              },
              {
                icon: Heart,
                title: 'Cardio Zone',
                description: 'Dedicated cardio area with latest machines',
              },
              {
                icon: Zap,
                title: 'CrossFit',
                description: 'High-intensity functional training programs',
              },
              {
                icon: UserCheck,
                title: 'Personal Training',
                description: 'One-on-one sessions with certified trainers',
              },
            ].map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="glass" 
                className="group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-gym-gold/20 flex items-center justify-center group-hover:glow-sm transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card variant="gradient" className="p-8 md:p-12 text-center border-primary/20 glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get <span className="gradient-text">Started?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join PowerFit today and take the first step towards a healthier, 
              stronger you. Special offers available based on registration day!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="hero" size="lg" className="gap-2">
                  Register Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="lg" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 PowerFit Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

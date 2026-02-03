import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GymHeader } from "@/components/gym/GymHeader";
import { usePWA } from "@/hooks/usePWA";
import { Download, Smartphone, Tablet, CheckCircle2, Share, PlusSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Install() {
  const { canInstall, isInstalled, isIOS, isStandalone, promptInstall, hasNativePrompt } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    if (hasNativePrompt) {
      const success = await promptInstall();
      if (success) {
        toast({
          title: "App Installed! 🎉",
          description: "US Gymnasium has been added to your home screen.",
        });
      }
    }
  };

  if (isStandalone || isInstalled) {
    return (
      <div className="min-h-screen bg-background">
        <GymHeader />
        <main className="container mx-auto px-4 py-8">
          <Card variant="glass" className="max-w-lg mx-auto text-center animate-slide-up">
            <CardHeader>
              <div className="mx-auto p-4 rounded-full bg-gradient-to-br from-success to-accent glow mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl gradient-text">Already Installed!</CardTitle>
              <CardDescription>
                You're using US Gymnasium as an installed app. Enjoy the full experience!
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GymHeader />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Install US Gymnasium
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Install our app on your device for quick access, offline support, and a native app experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Android / Chrome Install */}
          <Card variant="glass" className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Android / Chrome</CardTitle>
                  <CardDescription>Install from browser</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasNativePrompt ? (
                <Button variant="hero" className="w-full" onClick={handleInstall}>
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Steps to install:</p>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Tap the browser menu (⋮) in the top right</li>
                    <li>Select "Add to Home Screen" or "Install App"</li>
                    <li>Tap "Install" to confirm</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* iOS Install */}
          <Card variant="glass" className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Tablet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">iPhone / iPad</CardTitle>
                  <CardDescription>Install via Safari</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Steps to install:</p>
                <ol className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">1</span>
                    <span>Tap the <Share className="inline w-4 h-4" /> Share button at the bottom</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">2</span>
                    <span>Scroll down and tap <PlusSquare className="inline w-4 h-4" /> "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">3</span>
                    <span>Tap "Add" in the top right corner</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card variant="glass" className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="text-xl">Why Install?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-medium">Faster Access</p>
                <p className="text-sm text-muted-foreground">Launch directly from home screen</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl mb-2">📱</div>
                <p className="font-medium">Native Feel</p>
                <p className="text-sm text-muted-foreground">Full screen, no browser UI</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl mb-2">🔄</div>
                <p className="font-medium">Auto Updates</p>
                <p className="text-sm text-muted-foreground">Always get the latest version</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

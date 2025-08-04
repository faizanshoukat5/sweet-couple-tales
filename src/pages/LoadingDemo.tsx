import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RomanticLoader } from '@/components/ui/romantic-loader';
import { PageTransition, LoadingSkeleton } from '@/components/ui/page-transition';
import { 
  FloatingHearts, 
  LoveConfetti, 
  GlowingBorder, 
  StaggeredFade, 
  PulsingHeart 
} from '@/components/ui/romantic-transitions';

const LoadingDemo = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  const handleDemo = (demo: string) => {
    setActiveDemo(demo);
    setTimeout(() => setActiveDemo(null), 3000);
  };

  return (
    <PageTransition className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4 animate-romantic-scale">
            Romantic Loading Animations
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-slide-up">
            Beautiful loading states that bring love to your user experience
          </p>
        </div>

        <FloatingHearts count={8} />
        <LoveConfetti isActive={showConfetti} />

        {/* Loading Spinners */}
        <GlowingBorder>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PulsingHeart size="sm" />
                Loading Spinners
              </CardTitle>
              <CardDescription>
                Different romantic spinner variants for various use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
                <div className="text-center space-y-2">
                  <LoadingSpinner variant="heart" size="lg" />
                  <p className="text-sm text-muted-foreground">Heart Beat</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner variant="flower" size="lg" />
                  <p className="text-sm text-muted-foreground">Flower Bloom</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner variant="sparkles" size="lg" />
                  <p className="text-sm text-muted-foreground">Sparkles Glow</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner variant="dots" size="lg" />
                  <p className="text-sm text-muted-foreground">Love Bounce</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner variant="pulse" size="lg" />
                  <p className="text-sm text-muted-foreground">Love Pulse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </GlowingBorder>

        {/* Romantic Loaders */}
        <Card>
          <CardHeader>
            <CardTitle>Romantic Loaders</CardTitle>
            <CardDescription>
              Complete loading components with messages and animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <RomanticLoader 
                  variant="hearts" 
                  message="Loading with love..." 
                  size="md" 
                />
              </div>
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <RomanticLoader 
                  variant="spinner" 
                  message="Creating magic..." 
                  size="md" 
                />
              </div>
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <RomanticLoader 
                  variant="shimmer" 
                  message="Almost ready..." 
                  size="md" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeletons */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Skeletons</CardTitle>
            <CardDescription>
              Shimmer effects for content placeholders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium mb-4">Card Skeleton</h4>
                <LoadingSkeleton variant="card" />
              </div>
              <div>
                <h4 className="font-medium mb-4">Text Skeleton</h4>
                <LoadingSkeleton variant="text" />
              </div>
              <div>
                <h4 className="font-medium mb-4">Image Skeleton</h4>
                <LoadingSkeleton variant="image" />
              </div>
              <div>
                <h4 className="font-medium mb-4">Button Skeleton</h4>
                <LoadingSkeleton variant="button" count={3} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demos */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demos</CardTitle>
            <CardDescription>
              Click to see the romantic animations in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-8">
              <Button 
                onClick={triggerConfetti}
                variant="romantic"
                className="animate-heart-float"
              >
                💖 Trigger Love Confetti
              </Button>
              <Button 
                onClick={() => handleDemo('staggered')}
                variant="secondary"
              >
                Staggered Animation
              </Button>
              <Button 
                onClick={() => handleDemo('glow')}
                variant="outline"
              >
                Glowing Border
              </Button>
            </div>

            {activeDemo === 'staggered' && (
              <StaggeredFade delay={150}>
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium">First Item</h4>
                    <p className="text-sm text-muted-foreground">Appears first</p>
                  </CardContent>
                </Card>
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Second Item</h4>
                    <p className="text-sm text-muted-foreground">Appears second</p>
                  </CardContent>
                </Card>
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Third Item</h4>
                    <p className="text-sm text-muted-foreground">Appears third</p>
                  </CardContent>
                </Card>
              </StaggeredFade>
            )}

            {activeDemo === 'glow' && (
              <GlowingBorder isActive={true}>
                <Card>
                  <CardContent className="p-6 text-center">
                    <PulsingHeart size="lg" />
                    <h4 className="font-medium mt-4">Glowing with Love</h4>
                    <p className="text-sm text-muted-foreground">
                      This card has a romantic glow effect
                    </p>
                  </CardContent>
                </Card>
              </GlowingBorder>
            )}
          </CardContent>
        </Card>

        {/* Sizes Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
            <CardDescription>
              All animations come in small, medium, and large sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <h4 className="font-medium">Small</h4>
                <div className="space-y-4">
                  <LoadingSpinner variant="heart" size="sm" />
                  <RomanticLoader variant="hearts" size="sm" message="Small loader" />
                  <PulsingHeart size="sm" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Medium</h4>
                <div className="space-y-4">
                  <LoadingSpinner variant="heart" size="md" />
                  <RomanticLoader variant="hearts" size="md" message="Medium loader" />
                  <PulsingHeart size="md" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Large</h4>
                <div className="space-y-4">
                  <LoadingSpinner variant="heart" size="lg" />
                  <RomanticLoader variant="hearts" size="lg" message="Large loader" />
                  <PulsingHeart size="lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default LoadingDemo;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Code, Copy, Play, Pause, RotateCcw, Heart, Sparkles, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoadingDemo = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  const handleDemo = (demo: string) => {
    setActiveDemo(demo);
    setTimeout(() => setActiveDemo(null), 3000);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      toast({
        title: "Copied!",
        description: `${label} code copied to clipboard`,
      });
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const codeExamples = {
    heartSpinner: `<LoadingSpinner variant="heart" size="md" />`,
    romanticLoader: `<RomanticLoader 
  variant="hearts" 
  message="Loading with love..." 
  size="md" 
/>`,
    pageTransition: `<PageTransition variant="romantic">
  <YourComponent />
</PageTransition>`,
    floatingHearts: `<FloatingHearts count={8} />`,
    glowingBorder: `<GlowingBorder isActive={true}>
  <Card>Your content</Card>
</GlowingBorder>`,
    staggeredFade: `<StaggeredFade delay={150}>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</StaggeredFade>`
  };

  const usageScenarios = [
    {
      title: "Form Submission",
      description: "Show a romantic loader while processing form data",
      component: <RomanticLoader variant="spinner" message="Saving your love story..." size="sm" />
    },
    {
      title: "Image Upload",
      description: "Heart animation while uploading photos",
      component: <LoadingSpinner variant="heart" size="md" />
    },
    {
      title: "Page Loading",
      description: "Floating hearts for page transitions",
      component: <div className="relative h-16 w-full"><FloatingHearts count={3} /></div>
    },
    {
      title: "Content Loading",
      description: "Shimmer skeleton for content placeholders",
      component: <LoadingSkeleton variant="text" />
    }
  ];

  return (
    <PageTransition className="min-h-screen bg-background">
      {/* Background Effects */}
      <FloatingHearts count={12} />
      <LoveConfetti isActive={showConfetti} />

      <div className="container max-w-7xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PulsingHeart size="lg" />
            <h1 className="text-5xl font-serif font-bold bg-gradient-romantic bg-clip-text text-transparent animate-romantic-scale">
              Romantic Loading Animations
            </h1>
            <PulsingHeart size="lg" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-slide-up">
            A complete collection of beautiful, romantic loading states and transitions designed to bring love and elegance to your user experience.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              9 Animation Types
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              5 Loading Variants
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Fully Customizable
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button 
              onClick={triggerConfetti}
              variant="romantic"
              size="lg"
              className="animate-heart-float"
            >
              💖 Celebrate with Confetti
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pause' : 'Play'} Animations
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="showcase" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
            <TabsTrigger value="usage">Usage Examples</TabsTrigger>
            <TabsTrigger value="code">Code Samples</TabsTrigger>
            <TabsTrigger value="scenarios">Use Cases</TabsTrigger>
          </TabsList>

          {/* Showcase Tab */}
          <TabsContent value="showcase" className="space-y-8">
            {/* Loading Spinners Gallery */}
            <GlowingBorder>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <PulsingHeart size="sm" />
                    Loading Spinners Collection
                    <Badge>5 Variants</Badge>
                  </CardTitle>
                  <CardDescription>
                    Elegant animated spinners perfect for indicating loading states with romantic flair
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {[
                      { variant: 'heart', name: 'Heart Beat', desc: 'Pulsing heart animation' },
                      { variant: 'flower', name: 'Flower Bloom', desc: 'Blooming flower effect' },
                      { variant: 'sparkles', name: 'Sparkles Glow', desc: 'Glowing sparkles' },
                      { variant: 'dots', name: 'Love Bounce', desc: 'Bouncing dots sequence' },
                      { variant: 'pulse', name: 'Love Pulse', desc: 'Expanding pulse effect' }
                    ].map((item) => (
                      <div key={item.variant} className="text-center space-y-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="h-16 flex items-center justify-center">
                          <LoadingSpinner variant={item.variant as any} size="lg" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </GlowingBorder>

            {/* Romantic Loaders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  Complete Loading Components
                  <Badge variant="outline">With Messages</Badge>
                </CardTitle>
                <CardDescription>
                  Full-featured loading components with customizable messages and styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {[
                    { variant: 'hearts', message: 'Loading with love...', desc: 'Multiple floating hearts' },
                    { variant: 'spinner', message: 'Creating magic...', desc: 'Spinner with heart center' },
                    { variant: 'shimmer', message: 'Almost ready...', desc: 'Shimmer loading bar' }
                  ].map((item) => (
                    <div key={item.variant} className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg bg-gradient-to-br from-background to-muted/10 hover:border-primary/40 transition-colors">
                      <RomanticLoader 
                        variant={item.variant as any} 
                        message={item.message} 
                        size="md" 
                      />
                      <div className="mt-6">
                        <h4 className="font-semibold capitalize">{item.variant} Loader</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Effects */}
            <Card>
              <CardHeader>
                <CardTitle>Special Romantic Effects</CardTitle>
                <CardDescription>
                  Interactive animations and visual effects for enhanced user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Interactive Demos</h4>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleDemo('staggered')}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Staggered Animation
                      </Button>
                      <Button 
                        onClick={() => handleDemo('glow')}
                        variant="outline"
                        className="w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Glowing Border Effect
                      </Button>
                      <Button 
                        onClick={triggerConfetti}
                        variant="romantic"
                        className="w-full"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Love Confetti Burst
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Size Variations</h4>
                    <div className="flex items-center justify-around p-4 border rounded-lg bg-muted/10">
                      <div className="text-center space-y-2">
                        <PulsingHeart size="sm" />
                        <span className="text-xs text-muted-foreground">Small</span>
                      </div>
                      <div className="text-center space-y-2">
                        <PulsingHeart size="md" />
                        <span className="text-xs text-muted-foreground">Medium</span>
                      </div>
                      <div className="text-center space-y-2">
                        <PulsingHeart size="lg" />
                        <span className="text-xs text-muted-foreground">Large</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Content */}
                {activeDemo === 'staggered' && (
                  <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
                    <h5 className="font-medium mb-4">Staggered Animation Demo</h5>
                    <StaggeredFade delay={200}>
                      <Card className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary" />
                            <span>First item appears</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>Second item follows</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            <span>Third item completes</span>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggeredFade>
                  </div>
                )}

                {activeDemo === 'glow' && (
                  <div className="mt-6">
                    <GlowingBorder isActive={true}>
                      <Card>
                        <CardContent className="p-8 text-center">
                          <PulsingHeart size="lg" />
                          <h5 className="font-medium mt-4 text-lg">Glowing with Romance</h5>
                          <p className="text-muted-foreground mt-2">
                            This card pulses with a romantic glow effect, perfect for highlighting special content
                          </p>
                        </CardContent>
                      </Card>
                    </GlowingBorder>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loading Skeletons */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Skeletons</CardTitle>
                <CardDescription>
                  Shimmer placeholder effects for smooth content loading experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { variant: 'card', title: 'Card Skeleton', desc: 'For content cards' },
                    { variant: 'text', title: 'Text Skeleton', desc: 'For text content' },
                    { variant: 'image', title: 'Image Skeleton', desc: 'For image placeholders' },
                    { variant: 'button', title: 'Button Skeleton', desc: 'For action buttons' }
                  ].map((item) => (
                    <div key={item.variant} className="space-y-4">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <div className="p-4 border rounded-lg bg-muted/5">
                        <LoadingSkeleton variant={item.variant as any} count={item.variant === 'button' ? 2 : 1} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
                <CardDescription>
                  Import and use these components in your React application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Basic Import</h4>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                      {`import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RomanticLoader } from '@/components/ui/romantic-loader';
import { PageTransition } from '@/components/ui/page-transition';`}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quick Usage</h4>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                      {`// Simple spinner
<LoadingSpinner variant="heart" />

// Full loader with message
<RomanticLoader 
  variant="hearts" 
  message="Loading..." 
/>`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {usageScenarios.map((scenario, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 border-2 border-dashed border-muted rounded-lg bg-muted/5 flex items-center justify-center min-h-[100px]">
                      {scenario.component}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(codeExamples).map(([key, code]) => (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code, key)}
                        className="shrink-0"
                      >
                        {copySuccess === key ? (
                          <span className="text-green-600">Copied!</span>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-World Use Cases</CardTitle>
                <CardDescription>
                  Common scenarios where romantic loading animations enhance user experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Wedding Websites",
                      description: "Perfect for couple portfolios, wedding galleries, and RSVP forms",
                      component: <LoadingSpinner variant="heart" size="lg" />,
                      tags: ["Wedding", "Portfolio", "Gallery"]
                    },
                    {
                      title: "Dating Apps",
                      description: "Romantic loading for profile matching and chat features",
                      component: <RomanticLoader variant="hearts" message="Finding your match..." size="sm" />,
                      tags: ["Dating", "Social", "Matching"]
                    },
                    {
                      title: "Gift Shops",
                      description: "Lovely animations for e-commerce and gift recommendations",
                      component: <LoadingSpinner variant="sparkles" size="lg" />,
                      tags: ["E-commerce", "Gifts", "Shopping"]
                    },
                    {
                      title: "Photo Albums",
                      description: "Beautiful loading for memory books and photo uploads",
                      component: <LoadingSkeleton variant="image" />,
                      tags: ["Photos", "Memories", "Upload"]
                    },
                    {
                      title: "Love Letters",
                      description: "Romantic transitions for message composition and sending",
                      component: <PulsingHeart size="lg" />,
                      tags: ["Messages", "Communication", "Letters"]
                    },
                    {
                      title: "Anniversary Apps",
                      description: "Special effects for milestone celebrations and reminders",
                      component: <LoadingSpinner variant="flower" size="lg" />,
                      tags: ["Anniversary", "Celebration", "Milestones"]
                    }
                  ].map((scenario, index) => (
                    <Card key={index} className="hover:shadow-romantic transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{scenario.title}</CardTitle>
                        <CardDescription>{scenario.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                          {scenario.component}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {scenario.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-12 border-t border-border">
          <h3 className="text-2xl font-serif font-bold mb-4">Ready to Add Romance to Your App?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            These romantic loading animations are ready to use in your project. Simply import the components and start creating beautiful, engaging user experiences.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="romantic" size="lg" onClick={triggerConfetti}>
              <Heart className="w-5 h-5 mr-2" />
              Start Building with Love
            </Button>
            <Button variant="outline" size="lg">
              <Code className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoadingDemo;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Camera, 
  Target, 
  Smile, 
  BookHeart, 
  Sparkles,
  User,
  Play,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const DemoShowcase = () => {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const demoMemories = [
    {
      id: 1,
      title: "Our Magical First Date ✨",
      content: "Alex surprised me with a picnic in Central Park. We talked for hours under the cherry blossoms...",
      date: "Feb 14, 2024",
      tags: ["first date", "picnic", "romantic"],
      author: "Emma"
    },
    {
      id: 2,
      title: "The Perfect Proposal 💍",
      content: "I spent weeks planning this moment. I took Emma back to the exact spot in Central Park where we had our first date...",
      date: "Aug 20, 2024",
      tags: ["proposal", "engagement", "milestone"],
      author: "Alex"
    },
    {
      id: 3,
      title: "Romantic Getaway to Santorini 🌅",
      content: "Our first vacation together was absolutely magical! Watching the sunset from our private terrace...",
      date: "Jun 10, 2024",
      tags: ["vacation", "Santorini", "Greece"],
      author: "Emma"
    }
  ];

  const demoMessages = [
    { id: 1, sender: "Emma", content: "Hey babe! Just finished my meeting. How's your day going? 😊", time: "2:30 PM" },
    { id: 2, sender: "Alex", content: "Pretty good! Just wrapped up that big presentation. The team loved our proposal! 🎉", time: "2:35 PM" },
    { id: 3, sender: "Emma", content: "That's amazing! I'm so proud of you! 💪 Want to celebrate with dinner at that new Italian place?", time: "2:36 PM" },
    { id: 4, sender: "Alex", content: "Perfect! I'll make a reservation for 7 PM. Can't wait to see you! ❤️", time: "2:38 PM" }
  ];

  const demoLoveNotes = [
    {
      id: 1,
      content: "Good morning, beautiful! I hope your day is as amazing as you are. Can't wait to see you tonight for dinner! ❤️",
      author: "Alex",
      date: "Today 7:15 AM"
    },
    {
      id: 2,
      content: "Thank you for always making me laugh, even on my worst days. You're my sunshine and my best friend. I love you more than words can say! 💕",
      author: "Emma",
      date: "Yesterday 8:30 PM"
    }
  ];

  const demoGoals = [
    { id: 1, title: "Visit Japan Together 🇯🇵", completed: false, progress: 65 },
    { id: 2, title: "Learn to Cook Together 👨‍🍳", completed: false, progress: 40 },
    { id: 3, title: "Run a 5K Together 🏃‍♀️", completed: true, progress: 100 }
  ];

  const demoFeatures = [
    {
      id: "memories",
      title: "Shared Memories",
      icon: Heart,
      description: "Capture and share your most precious moments together",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      id: "chat",
      title: "Private Chat",
      icon: MessageCircle,
      description: "Stay connected with real-time messaging, voice notes, and photos",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      id: "albums",
      title: "Photo Albums",
      icon: Camera,
      description: "Organize your photos into beautiful albums and collections",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      id: "goals",
      title: "Relationship Goals",
      icon: Target,
      description: "Set and achieve goals together as a couple",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      id: "notes",
      title: "Love Notes",
      icon: BookHeart,
      description: "Send sweet messages and surprise your partner",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      id: "mood",
      title: "Mood Tracking",
      icon: Smile,
      description: "Track your emotional well-being and share with your partner",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    }
  ];

  const renderFeatureDemo = (featureId: string) => {
    switch (featureId) {
      case "memories":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Recent Memories</h3>
            {demoMemories.map((memory) => (
              <Card key={memory.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{memory.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      {memory.author}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{memory.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {memory.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{memory.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case "chat":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Live Chat</h3>
            <div className="bg-background border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
              {demoMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "Emma" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.sender === "Emma"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "notes":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Love Notes</h3>
            {demoLoveNotes.map((note) => (
              <Card key={note.id} className="bg-gradient-to-br from-pink-50 to-purple-50">
                <CardContent className="pt-4">
                  <p className="text-muted-foreground mb-3 italic">"{note.content}"</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-primary">From {note.author}</span>
                    <span className="text-muted-foreground">{note.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case "goals":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Relationship Goals</h3>
            {demoGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{goal.title}</h4>
                    {goal.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        goal.completed ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {goal.progress}% complete
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Feature Preview</h3>
            <p className="text-muted-foreground">
              This feature helps couples stay connected and build stronger relationships together.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          CoupleConnect Demo
          <Sparkles className="inline-block w-8 h-8 ml-2 text-primary" />
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Experience how couples Emma & Alex use CoupleConnect to strengthen their relationship
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              E
            </div>
            <span className="font-medium">Emma Johnson</span>
          </div>
          <Heart className="w-5 h-5 text-red-500" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <span className="font-medium">Alex Martinez</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Feature Overview</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDemo(feature.id)}
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Try Demo
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="demo" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Demo Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {demoFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <Button
                          key={feature.id}
                          variant={currentDemo === feature.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentDemo(feature.id)}
                          className="w-full justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {feature.title}
                          {currentDemo === feature.id && (
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  {currentDemo ? (
                    renderFeatureDemo(currentDemo)
                  ) : (
                    <div className="text-center py-12">
                      <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Select a Feature to Demo</h3>
                      <p className="text-muted-foreground">
                        Choose a feature from the sidebar to see how Emma and Alex use CoupleConnect
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-none">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Love Story?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of couples who use CoupleConnect to build stronger, happier relationships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Heart className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoShowcase;
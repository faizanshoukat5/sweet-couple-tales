import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Camera, Heart, MapPin, Users, Sparkles, X } from 'lucide-react';

interface DemoMemory {
  title: string;
  content: string;
  date: string;
  tags: string[];
  photos: string[];
  location?: string;
}

const InteractiveMemoryDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoMemory, setDemoMemory] = useState<DemoMemory>({
    title: '',
    content: '',
    date: '2024-02-14',
    tags: [],
    photos: [],
    location: ''
  });

  const steps = [
    {
      title: "Add a Title",
      description: "Give your memory a beautiful name",
      field: "title",
      placeholder: "Our romantic dinner at the beach",
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      title: "Share Your Story", 
      description: "Write about what made this moment special",
      field: "content",
      placeholder: "The sunset was perfect, and we laughed until our cheeks hurt. This was the moment I knew...",
      icon: <Heart className="w-5 h-5" />
    },
    {
      title: "Add Photos",
      description: "Upload photos to preserve the visual memories",
      field: "photos",
      icon: <Camera className="w-5 h-5" />
    },
    {
      title: "Tag & Organize",
      description: "Add tags to easily find this memory later",
      field: "tags",
      placeholder: "romantic, dinner, beach, anniversary",
      icon: <Users className="w-5 h-5" />
    }
  ];

  const samplePhotos = [
    "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&h=200&fit=crop"
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setDemoMemory(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagInput = (value: string) => {
    if (value.includes(',')) {
      const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      handleInputChange('tags', [...demoMemory.tags, ...newTags]);
      return '';
    }
    return value;
  };

  const addSamplePhoto = (photoUrl: string) => {
    if (!demoMemory.photos.includes(photoUrl)) {
      handleInputChange('photos', [...demoMemory.photos, photoUrl]);
    }
  };

  const removePhoto = (photoUrl: string) => {
    handleInputChange('photos', demoMemory.photos.filter(p => p !== photoUrl));
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', demoMemory.tags.filter(tag => tag !== tagToRemove));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setDemoMemory({
      title: '',
      content: '',
      date: '2024-02-14',
      tags: [],
      photos: [],
      location: ''
    });
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setDemoMemory({
      title: '',
      content: '',
      date: '2024-02-14',
      tags: [],
      photos: [],
      location: ''
    });
  };

  if (!isPlaying) {
    return (
      <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">
              See How Easy It Is
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Try our interactive demo to experience how simple and beautiful creating memories can be
            </p>
            <Button
              onClick={startDemo}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Interactive Demo
            </Button>
          </div>

          {/* Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-rose-600" />
                </div>
                <CardTitle className="text-lg">Write Your Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Add titles, descriptions, and all the details that make your memories special.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Add Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Upload and organize photos to create a visual timeline of your journey together.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Tag & Find</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tag your memories and use powerful search to find any moment instantly.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">
              Interactive Memory Demo
            </h2>
            <p className="text-lg text-gray-600">
              Step {currentStep + 1} of {steps.length}: {currentStepData.title}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-md mx-auto">
              <div 
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Demo Input Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  {currentStepData.icon}
                  {currentStepData.title}
                </CardTitle>
                <p className="text-rose-100">{currentStepData.description}</p>
              </CardHeader>
              <CardContent className="p-6">
                {currentStep === 0 && (
                  <Input
                    placeholder={currentStepData.placeholder}
                    value={demoMemory.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-lg"
                  />
                )}

                {currentStep === 1 && (
                  <Textarea
                    placeholder={currentStepData.placeholder}
                    value={demoMemory.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={4}
                    className="text-base"
                  />
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Click on sample photos to add them:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {samplePhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Sample ${index + 1}`}
                            className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => addSamplePhoto(photo)}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded">
                            <span className="text-white text-sm">Add</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {demoMemory.photos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Added photos:</p>
                        <div className="flex flex-wrap gap-2">
                          {demoMemory.photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`Added ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <button
                                onClick={() => removePhoto(photo)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <Input
                      placeholder="Type tags separated by commas"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value;
                          const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                          if (newTags.length > 0) {
                            handleInputChange('tags', [...demoMemory.tags, ...newTags]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      {demoMemory.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-xs hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Quick tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {['romantic', 'dinner', 'beach', 'anniversary', 'sunset', 'special'].map((tag) => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!demoMemory.tags.includes(tag)) {
                                handleInputChange('tags', [...demoMemory.tags, tag]);
                              }
                            }}
                            disabled={demoMemory.tags.includes(tag)}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetDemo}
                    className="text-gray-600"
                  >
                    Exit Demo
                  </Button>

                  <Button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                    className="bg-gradient-to-r from-rose-500 to-pink-500"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Memory Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Valentine's Day 2024
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {demoMemory.title || "Your memory title will appear here..."}
                  </h3>

                  {/* Content */}
                  <p className="text-gray-700 leading-relaxed">
                    {demoMemory.content || "Your story will be displayed here as you type..."}
                  </p>

                  {/* Photos */}
                  {demoMemory.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {demoMemory.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Memory photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {demoMemory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {demoMemory.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Call to Action */}
                  {currentStep === steps.length - 1 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg text-center">
                      <p className="text-sm text-gray-700 mb-3">
                        🎉 Great! This is how your memory would look. Ready to create your own?
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Start Creating Memories
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMemoryDemo;

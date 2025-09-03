import { useEffect } from 'react';

const StructuredData = () => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Sweet Couple Tales",
      "description": "A beautiful romantic memories journal app for couples to preserve their special moments together",
      "url": "https://sweet-couple-tales.lovable.app",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "5000"
      },
      "creator": {
        "@type": "Organization",
        "name": "Sweet Couple Tales"
      },
      "featureList": [
        "Create Beautiful Memories",
        "Timeline View", 
        "Mark Favorites",
        "Search & Filter",
        "Private & Secure",
        "Mobile Optimized",
        "Couple Chat",
        "Custom Quizzes",
        "Mood Tracker",
        "Love Notes"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    
    // Remove existing structured data script if it exists
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      // Clean up on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default StructuredData;
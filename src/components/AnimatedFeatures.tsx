import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { FaRegImages, FaRegCalendarAlt, FaRegListAlt, FaRegHeart, FaRegComments, FaRegSmile, FaRegStickyNote, FaRegQuestionCircle } from "react-icons/fa";
import './AnimatedFeatures.css';

// Animated illustration components for each feature
function MemoryIllustration() {
  return (
    <div className="feature-illustration memory-illustration">
      <div className="floating-hearts">
        <div className="heart heart-1">💕</div>
        <div className="heart heart-2">💖</div>
        <div className="heart heart-3">💝</div>
      </div>
      <div className="memory-card">
        <div className="card-shine"></div>
        <div className="photo-placeholder"></div>
        <div className="text-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
        </div>
      </div>
    </div>
  );
}

function TimelineIllustration() {
  return (
    <div className="feature-illustration timeline-illustration">
      <div className="timeline-line"></div>
      <div className="timeline-dots">
        <div className="dot dot-1 active">
          <div className="pulse"></div>
        </div>
        <div className="dot dot-2">
          <div className="pulse"></div>
        </div>
        <div className="dot dot-3">
          <div className="pulse"></div>
        </div>
      </div>
      <div className="timeline-cards">
        <div className="timeline-card card-1">📸</div>
        <div className="timeline-card card-2">💌</div>
        <div className="timeline-card card-3">🎉</div>
      </div>
    </div>
  );
}

function FavoritesIllustration() {
  return (
    <div className="feature-illustration favorites-illustration">
      <div className="favorite-star">
        ⭐
        <div className="star-sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">✨</div>
          <div className="sparkle sparkle-3">✨</div>
          <div className="sparkle sparkle-4">✨</div>
        </div>
      </div>
    </div>
  );
}

function SearchIllustration() {
  return (
    <div className="feature-illustration search-illustration">
      <div className="search-container">
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <div className="search-text">
            <div className="typing-text">our first date...</div>
            <div className="cursor"></div>
          </div>
        </div>
        <div className="search-results">
          <div className="result-item">💖 First Date</div>
          <div className="result-item">🌹 Anniversary</div>
          <div className="result-item">💍 Proposal</div>
        </div>
      </div>
    </div>
  );
}

function SecurityIllustration() {
  return (
    <div className="feature-illustration security-illustration">
      <div className="lock-container">
        <div className="lock">🔒</div>
        <div className="security-waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </div>
    </div>
  );
}

function MobileIllustration() {
  return (
    <div className="feature-illustration mobile-illustration">
      <div className="phone">
        <div className="phone-screen">
          <div className="screen-content">
            <div className="notification">💕 New Memory</div>
            <div className="app-preview">
              <div className="preview-photo"></div>
              <div className="preview-text">
                <div className="preview-line"></div>
                <div className="preview-line short"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatIllustration() {
  const [messages, setMessages] = useState([0]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        if (prev.length >= 3) {
          return [0];
        }
        return [...prev, prev.length];
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feature-illustration chat-illustration">
      <div className="chat-container">
        {messages.map((_, index) => (
          <div key={index} className={`message ${index % 2 === 0 ? 'sent' : 'received'}`}>
            {index === 0 && '💕 Love you!'}
            {index === 1 && '💖 Love you too!'}
            {index === 2 && '😘 Can\'t wait to see you'}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizIllustration() {
  return (
    <div className="feature-illustration quiz-illustration">
      <div className="quiz-card">
        <div className="question">What's your favorite...?</div>
        <div className="options">
          <div className="option selected">A) Sunset walks 🌅</div>
          <div className="option">B) Movie nights 🎬</div>
          <div className="option">C) Cooking together 👨‍🍳</div>
        </div>
        <div className="quiz-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
}

function MoodIllustration() {
  const [currentMood, setCurrentMood] = useState(0);
  const moods = ['😊', '🥰', '💕', '🌟', '💖'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMood(prev => (prev + 1) % moods.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feature-illustration mood-illustration">
      <div className="mood-selector">
        <div className="mood-display">
          <div className="mood-emoji">{moods[currentMood]}</div>
        </div>
        <div className="mood-options">
          {moods.map((mood, index) => (
            <div key={index} className={`mood-option ${index === currentMood ? 'active' : ''}`}>
              {mood}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesIllustration() {
  return (
    <div className="feature-illustration notes-illustration">
      <div className="note-stack">
        <div className="note note-1">
          <div className="note-header">💌</div>
          <div className="note-content">
            <div className="note-line"></div>
            <div className="note-line short"></div>
          </div>
        </div>
        <div className="note note-2">
          <div className="note-header">💕</div>
          <div className="note-content">
            <div className="note-line"></div>
            <div className="note-line short"></div>
          </div>
        </div>
        <div className="note note-3">
          <div className="note-header">💖</div>
          <div className="note-content">
            <div className="note-line"></div>
            <div className="note-line short"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal icon button component
function QuickAccessIconButton({ to, label, icon, onClick }: { to: string, label: string, icon: React.ReactNode, onClick: (e: React.MouseEvent) => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex flex-col items-center group">
      <button
        className="flex items-center justify-center w-14 h-14 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors border border-pink-100 focus:outline-none hover:scale-110 transition-transform duration-200"
        tabIndex={-1}
        type="button"
        aria-label={label}
      >
        {icon}
      </button>
      <span className="mt-2 text-xs text-muted-foreground group-hover:text-pink-500 transition-colors font-medium">{label}</span>
    </Link>
  );
}

const quickAccessButtons = [
  { to: "/dashboard#albums", label: "Albums", icon: <FaRegImages size={24} /> },
  { to: "/dashboard#calendar", label: "Calendar", icon: <FaRegCalendarAlt size={24} /> },
  { to: "/dashboard#goals", label: "Goals", icon: <FaRegListAlt size={24} /> },
  { to: "/dashboard#dates", label: "Dates", icon: <FaRegHeart size={24} /> },
  { to: "/dashboard#chat", label: "Chat", icon: <FaRegComments size={24} /> },
  { to: "/dashboard#quiz", label: "Quizzes", icon: <FaRegQuestionCircle size={24} /> },
  { to: "/dashboard#mood", label: "Mood", icon: <FaRegSmile size={24} /> },
  { to: "/dashboard#notes", label: "Notes", icon: <FaRegStickyNote size={24} /> },
];

const features = [
  {
    title: "Create Beautiful Memories",
    description: "Write your love story with rich text, photos, and special dates that matter to you both.",
    illustration: <MemoryIllustration />,
  },
  {
    title: "Timeline View",
    description: "Browse through your relationship journey with a beautiful chronological timeline.",
    illustration: <TimelineIllustration />,
  },
  {
    title: "Mark Favorites",
    description: "Highlight your most cherished moments and easily find them whenever you want.",
    illustration: <FavoritesIllustration />,
  },
  {
    title: "Search & Filter",
    description: "Find specific memories by date, keywords, or emotions. Never lose a precious moment.",
    illustration: <SearchIllustration />,
  },
  {
    title: "Private & Secure",
    description: "Your love story is yours alone. All memories are private and encrypted for your peace of mind.",
    illustration: <SecurityIllustration />,
  },
  {
    title: "Mobile Optimized",
    description: "Capture memories on the go with our beautiful mobile experience, perfect for any device.",
    illustration: <MobileIllustration />,
  },
  {
    title: "Couple Chat",
    description: "Real-time, private chat with your partner. Share messages, photos, and voice notes.",
    illustration: <ChatIllustration />,
  },
  {
    title: "Custom Quizzes",
    description: "Create and take fun quizzes to learn more about each other.",
    illustration: <QuizIllustration />,
  },
  {
    title: "Mood Tracker",
    description: "Track and share your moods daily to stay emotionally connected.",
    illustration: <MoodIllustration />,
  },
  {
    title: "Love Notes",
    description: "Send and receive sweet notes to brighten your partner's day.",
    illustration: <NotesIllustration />,
  },
];

function Features({ isAuthenticated }: { isAuthenticated: boolean }) {
  const navigate = useNavigate();
  const handleFeatureClick = useCallback(
    (e: React.MouseEvent, link: string) => {
      if (!isAuthenticated) {
        e.preventDefault();
        navigate("/auth");
      }
    },
    [isAuthenticated, navigate]
  );

  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need for Your
            <span className="text-primary block">Love Story</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            CoupleConnect provides all the tools you need to document,
            organize,
            <br className="hidden sm:block" /> and treasure your relationship's
            most beautiful moments.
          </p>
        </div>
        
        {/* Minimal Icon Quick Access Section */}
        <div className="mb-12 flex flex-wrap justify-center gap-6 animate-fade-in">
          {quickAccessButtons.map(({ to, label, icon }) => (
            <QuickAccessIconButton
              key={to}
              to={to}
              label={label}
              icon={icon}
              onClick={e => handleFeatureClick(e, to)}
            />
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-2 bg-card border-border/50 animate-fade-in h-full overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="h-24 mb-4 flex items-center justify-center">
                  {feature.illustration}
                </div>
                <CardTitle className="font-serif text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

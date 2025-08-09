import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { FaRegImages, FaRegCalendarAlt, FaRegListAlt, FaRegHeart, FaRegComments, FaRegSmile, FaRegStickyNote, FaRegQuestionCircle } from "react-icons/fa";

// Minimal icon button component
function QuickAccessIconButton({ to, label, icon, onClick }: { to: string, label: string, icon: React.ReactNode, onClick: (e: React.MouseEvent) => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex flex-col items-center group">
      <button
        className="flex items-center justify-center w-14 h-14 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors border border-pink-100 focus:outline-none"
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
    description:
      "Write your love story with rich text, photos, and special dates that matter to you both.",
    icon: "✨",
  },
  {
    title: "Timeline View",
    description:
      "Browse through your relationship journey with a beautiful chronological timeline.",
    icon: "📅",
  },
  {
    title: "Mark Favorites",
    description:
      "Highlight your most cherished moments and easily find them whenever you want.",
    icon: "💖",
  },
  {
    title: "Search & Filter",
    description:
      "Find specific memories by date, keywords, or emotions. Never lose a precious moment.",
    icon: "🔍",
  },
  {
    title: "Private & Secure",
    description:
      "Your love story is yours alone. All memories are private and encrypted for your peace of mind.",
    icon: "🔒",
  },
  {
    title: "Mobile Optimized",
    description:
      "Capture memories on the go with our beautiful mobile experience, perfect for any device.",
    icon: "📱",
  },
  // New features
  {
    title: "Couple Chat",
    description: "Real-time, private chat with your partner. Share messages, photos, and voice notes.",
    icon: "💬",
  },
  {
    title: "Custom Quizzes",
    description: "Create and take fun quizzes to learn more about each other.",
    icon: "📝",
  },
  {
    title: "Mood Tracker",
    description: "Track and share your moods daily to stay emotionally connected.",
    icon: "😊",
  },
  {
    title: "Love Notes",
    description: "Send and receive sweet notes to brighten your partner's day.",
    icon: "💌",
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
            Sweet Couple Tales provides all the tools you need to document,
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
              className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-2 bg-card border-border/50 animate-fade-in h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-4 group-hover:animate-heart-float">
                  {feature.icon}
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
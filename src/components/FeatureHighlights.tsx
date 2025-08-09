import { Heart, Images, MessageCircle, Calendar, Star, Shield } from 'lucide-react';
import heartFlowers from '@/assets/heart-flowers.png';

const features = [
  { icon: Heart, title: 'Beautiful Memories', desc: 'Capture moments with photos, tags, and favorites.' },
  { icon: Images, title: 'Private Albums', desc: 'Organize your story into secure, shared albums.' },
  { icon: MessageCircle, title: 'Secure Chat', desc: 'Whisper, share, and send attachments privately.' },
  { icon: Calendar, title: 'Shared Calendar', desc: 'Remember anniversaries and plan sweet days.' },
  { icon: Star, title: 'Date Ideas', desc: 'Handpicked ideas with ratings and favorites.' },
  { icon: Shield, title: 'Privacy First', desc: 'Signed URLs and RLS protect your memories.' },
];

export default function FeatureHighlights() {
  return (
    <section aria-labelledby="highlights-heading" className="relative overflow-hidden py-14 md:py-16 bg-gradient-to-br from-rose-50 via-background to-pink-50">
      {/* Decorative hearts */}
      <img src={heartFlowers} alt="romantic hearts decoration" className="pointer-events-none absolute -top-10 -left-10 w-40 opacity-30 select-none" aria-hidden="true" />
      <img src={heartFlowers} alt="romantic hearts decoration" className="pointer-events-none absolute -bottom-12 -right-8 w-48 rotate-180 opacity-25 select-none" aria-hidden="true" />

      <div className="container mx-auto px-4 animate-fade-in">
        <header className="mb-8 text-center">
          <h2 id="highlights-heading" className="font-serif text-3xl md:text-4xl font-extrabold text-primary flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-rose-400 pulse" aria-hidden="true" />
            Built for two, with love
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">Minimal, romantic, and private — everything a couple needs.</p>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="group rounded-2xl bg-card/90 border border-primary/10 shadow-sm hover:shadow-lg transition-shadow hover-scale">
              <div className="flex items-start gap-3 p-5">
                <span className="inline-flex p-2.5 rounded-lg bg-muted text-primary">
                  <Icon className="w-5 h-5 text-rose-500" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-medium text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}


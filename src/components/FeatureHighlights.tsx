import { Heart, Images, MessageCircle, Calendar, Star, Shield } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Beautiful Memories',
    desc: 'Save moments with photos, tags, and favorites.'
  },
  {
    icon: Images,
    title: 'Private Albums',
    desc: 'Organize photos into albums with secure access.'
  },
  {
    icon: MessageCircle,
    title: 'Secure Chat',
    desc: 'Share notes and attachments safely together.'
  },
  {
    icon: Calendar,
    title: 'Shared Calendar',
    desc: 'Track important dates and celebrate on time.'
  },
  {
    icon: Star,
    title: 'Date Ideas',
    desc: 'Curated ideas with ratings and favorites.'
  },
  {
    icon: Shield,
    title: 'Your Data, Protected',
    desc: 'Signed URLs and RLS keep your content private.'
  }
];

export default function FeatureHighlights() {
  return (
    <section aria-labelledby="highlights-heading" className="py-12 animate-fade-in">
      <div className="container mx-auto px-4">
        <header className="mb-6">
          <h2 id="highlights-heading" className="text-2xl font-semibold text-foreground">
            Everything you need to cherish your story
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Minimal features, maximum love.</p>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="group border rounded-xl bg-card hover-scale">
              <div className="flex items-start gap-3 p-4">
                <span className="inline-flex p-2 rounded-lg bg-muted text-primary">
                  <Icon className="w-5 h-5" aria-hidden="true" />
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

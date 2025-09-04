import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QA { id: string; question: string; answer: string; tags?: string[] }
interface Section { id: string; title: string; items: QA[] }

const sections: Section[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { id: "what-is", question: "What is CoupleConnect?", answer: "A private, all‑in‑one space for couples to capture memories, chat in real‑time, share love notes, track moods, plan goals, and celebrate their journey together." },
      { id: "signup", question: "How do we begin?", answer: "Both partners create accounts. One initiates a partner link in Settings → Select Partner. After acceptance you unlock shared features (chat, notes, goals, calendar)." },
      { id: "mobile", question: "Does it work on mobile?", answer: "Yes. The UI is fully responsive. Add it to your home screen via your browser's 'Add to Home Screen' for an app‑like feel." },
      { id: "profile-setup", question: "What should we do first?", answer: "Complete profile setup: add display names, relationship start date, connect partner, then create your first memory or album." },
    ]
  },
  {
    id: "memories-albums",
    title: "Memories & Albums",
    items: [
      { id: "create-memory", question: "How do I create a memory?", answer: "From the Dashboard, open the memory creator, add a title, story text, date, photos, and optional tags. Save to add it to the timeline." },
      { id: "albums", question: "What's the difference between albums and memories?", answer: "Memories are narrative entries (text + photos + date). Albums group photos AND optionally link existing memories for curated collections." },
      { id: "reorder-albums", question: "Can I reorder albums?", answer: "Yes. Drag & drop (if enabled) or use ordering controls. The order persists via an 'order' field in the database." },
      { id: "export-album", question: "Can I export an album as PDF?", answer: "Yes. Use the export option in the Album view to generate a styled PDF with memory titles, dates, and images." },
      { id: "favorites", question: "How do favorites work?", answer: "Mark cherished memories as favorites for faster filtering and emotional highlights." },
      { id: "search-filter", question: "How do I find something fast?", answer: "Use search & filters (tags, date, text) in the Dashboard timeline or inside albums." },
    ]
  },
  {
    id: "chat-communication",
    title: "Chat & Voice Messages",
    items: [
      { id: "chat-realtime", question: "Is chat real‑time?", answer: "Yes. Messages appear instantly for both partners using Supabase real‑time channels with presence + typing indicators." },
      { id: "status-icons", question: "What do the check marks mean?", answer: "Single check = delivered. Double check = read. They update automatically when your partner views the conversation." },
      { id: "voice", question: "How do voice messages work?", answer: "Press the microphone, record, optionally preview, then send. Waveform + duration + delivery/read statuses are shown." },
      { id: "failed-messages", question: "What if a message fails?", answer: "It will show a retry state. Resend after connection stabilizes. Optimistic UI prevents losing your text." },
      { id: "typing", question: "Can I see if my partner is typing?", answer: "Yes—typing indicators broadcast live while the partner is composing." },
    ]
  },
  {
    id: "emotional-connection",
    title: "Love Notes, Mood & Goals",
    items: [
      { id: "love-notes", question: "What are Love Notes?", answer: "Short romantic affirmations that rotate for your partner. Add multiple notes; a fallback set appears if you haven't written any." },
      { id: "mood-tracker", question: "Why track moods?", answer: "Daily mood context fosters empathy, helps identify patterns, and prompts supportive conversations." },
      { id: "goals", question: "How do shared goals work?", answer: "Add joint goals / bucket list ideas, set statuses, and celebrate completions together." },
      { id: "date-ideas", question: "Where do date ideas come from?", answer: "You can add your own or browse curated ideas by category for inspiration." },
    ]
  },
  {
    id: "quizzes-insights",
    title: "Quizzes & Learning",
    items: [
      { id: "custom-quizzes", question: "What are custom quizzes?", answer: "Create playful, meaningful questions with multiple choice options. Your partner submits answers; you compare and learn." },
      { id: "love-language", question: "Are Love Language results stored?", answer: "Yes. Each partner's result set is saved so you can revisit growth and differences." },
      { id: "sharing-results", question: "Do we see each other's quiz results?", answer: "Yes—once attempts are submitted, partners can view and reflect together." },
    ]
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    items: [
      { id: "private", question: "Who can see our data?", answer: "Only authenticated partners linked via the couples table. RLS ensures isolation." },
      { id: "encryption", question: "Is data encrypted?", answer: "Data is encrypted at rest (Supabase Postgres + Storage) and in transit (HTTPS)." },
      { id: "auth", question: "How is authentication handled?", answer: "Secure email/password via Supabase Auth tokens—refreshed automatically until revoked." },
      { id: "delete", question: "Can we delete everything?", answer: "Yes. Account deletion (or manual request) purges personal tables (memories, notes, messages, etc.)." },
      { id: "backups", question: "Should we export data?", answer: "Yes—periodically export memories or albums (JSON/PDF) for personal archiving." },
    ]
  },
  {
    id: "notifications",
    title: "Notifications & Reminders",
    items: [
      { id: "enable-notifications", question: "How do we enable notifications?", answer: "From the nav bar, allow browser notifications when prompted. If dismissed, adjust browser site settings manually." },
      { id: "types", question: "What notifications are sent?", answer: "New messages, love notes, and potentially future reminders like anniversaries or goal milestones." },
      { id: "troubleshoot-notify", question: "Why am I not seeing notifications?", answer: "Ensure permission is 'granted', tab isn't blocked, and OS focus mode isn't hiding them." },
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    items: [
      { id: "chat-issues", question: "Chat not updating?", answer: "Verify both partners are linked, refresh, check console logs for realtime subscription status, and confirm SQL setup executed." },
      { id: "upload-fail", question: "Photo upload failed?", answer: "Check network speed, file size, and bucket permissions. Retry smaller batches if bulk uploading." },
      { id: "sync-lag", question: "Why do things feel slow?", answer: "Temporary network latency or cold db start. Subsequent requests are usually faster—consider checking browser dev tools." },
      { id: "auth-expired", question: "Session expired?", answer: "Re-login. A 400 refresh token error means the token was invalidated or reused after logout." },
    ]
  },
  {
    id: "roadmap",
    title: "Roadmap & Misc",
    items: [
      { id: "future", question: "What's planned next?", answer: "Potential additions: message reactions, image/file attachments, memory AI summaries, recurring reminders, richer analytics." },
      { id: "contribute", question: "Can we suggest features?", answer: "Yes—open an issue or discussion on the repository. Feedback shapes priorities." },
    ]
  }
];

const highlight = (text: string, term: string) => {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "ig");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
  );
};

const FAQPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);

  const flatIndex = useMemo(() => {
    const map: Record<string, QA & { section: string }> = {};
    sections.forEach(sec => sec.items.forEach(item => { map[item.id] = { ...item, section: sec.id }; }));
    return map;
  }, []);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections
      .map(sec => ({
        ...sec,
        items: sec.items.filter(i =>
          i.question.toLowerCase().includes(q) ||
          i.answer.toLowerCase().includes(q) ||
          (i.tags || []).some(t => t.toLowerCase().includes(q))
        )
      }))
      .filter(sec => sec.items.length > 0);
  }, [query]);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-20 h-fit space-y-4">
            <div>
              <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">FAQ</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">Everything you need to understand, optimize, and troubleshoot your shared space.</p>
            </div>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="text-sm"
            />
            <nav className="space-y-1" aria-label="FAQ Sections">
              {sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeSection === sec.id ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {sec.title}
                </button>
              ))}
            </nav>
            {query && (
              <p className="text-xs text-muted-foreground pt-2">Showing {filteredSections.reduce((a, s) => a + s.items.length, 0)} matches</p>
            )}
            <div className="pt-4 border-t border-border text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-14">
            {filteredSections.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm text-muted-foreground mb-4">Try a different keyword or clear the search.</p>
                <Button variant="outline" size="sm" onClick={() => setQuery("")}>Clear Search</Button>
              </div>
            )}
            {filteredSections.map(section => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-2xl font-semibold mb-6 font-serif flex items-center gap-2">
                  <span className="h-6 w-1 rounded-full bg-primary" /> {section.title}
                </h2>
                <div className="space-y-4">
                  {section.items.map(item => (
                    <Card key={item.id} id={item.id} className="group border-border/60 hover:border-primary/60 transition-colors">
                      <CardHeader className="pb-2">
                        <button
                          onClick={() => {
                            const el = document.getElementById(item.id + '-answer');
                            if (el) el.classList.toggle('hidden');
                          }}
                          className="text-left w-full flex items-start justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                          aria-expanded="false"
                          aria-controls={item.id + '-answer'}
                        >
                          <span className="font-medium text-base text-foreground leading-snug">
                            {highlight(item.question, query)}
                          </span>
                          <span className="text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity select-none">Toggle</span>
                        </button>
                      </CardHeader>
                      <CardContent id={item.id + '-answer'} className="text-sm text-muted-foreground leading-relaxed pt-0 hidden">
                        {highlight(item.answer, query)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
            {!query && (
              <div className="pt-8 text-sm text-muted-foreground border-t border-border/60">
                Still stuck? Open an issue on GitHub with steps to reproduce your concern, or send feedback through the in‑app support channel if available.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

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
];

const Features = () => {
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
				{/* Quick Access Section */}
				<div className="mb-12 flex flex-wrap justify-center gap-4 animate-fade-in">
					<Link to="/dashboard#albums">
						<button className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
							Albums
						</button>
					</Link>
					<Link to="/dashboard#calendar">
						<button className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
							Shared Calendar
						</button>
					</Link>
					<Link to="/dashboard#goals">
						<button className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
							Goals/Bucket List
						</button>
					</Link>
					<Link to="/dashboard#dates">
						<button className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
							Important Dates
						</button>
					</Link>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-2 bg-card border-border/50 animate-fade-in"
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
};

export default Features;
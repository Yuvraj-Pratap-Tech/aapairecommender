import { createFileRoute } from "@tanstack/react-router";
import { Headphones, Sparkles, Wand2 } from "lucide-react";
import { PodcastChat } from "@/components/PodcastChat";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PodPilot — AI Podcast Recommender" },
      {
        name: "description",
        content:
          "Discover your next favorite podcast. Tell PodPilot your mood or interests and get instant AI-powered recommendations.",
      },
      { property: "og:title", content: "PodPilot — AI Podcast Recommender" },
      {
        property: "og:description",
        content: "AI-powered podcast recommendations tailored to your mood and interests.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <Toaster richColors theme="dark" position="top-center" />

      <header className="max-w-3xl mx-auto text-center space-y-5 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI-powered podcast discovery
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Find your next <span className="text-gradient-hero">favorite listen</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Skip the endless scrolling. Describe your vibe and PodPilot curates the perfect podcasts — instantly.
        </p>

        <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Headphones className="size-4 text-accent" /> Hand-picked shows</span>
          <span className="inline-flex items-center gap-2"><Wand2 className="size-4 text-primary" /> Personalized to you</span>
          <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-accent" /> Instant results</span>
        </div>
      </header>

      <PodcastChat />

      <footer className="max-w-3xl mx-auto text-center mt-10 text-xs text-muted-foreground">
        Built with Lovable AI · Recommendations are AI-generated and may not always be accurate.
      </footer>
    </main>
  );
}

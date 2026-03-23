import HeroSection from "@/components/HeroSection";
import ReposSection from "@/components/ReposSection";
import { Github } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        <HeroSection />
        <ReposSection />

        <footer className="py-10 text-center border-t border-border">
          <p className="text-muted-foreground text-sm font-mono flex items-center justify-center gap-2">
            <Github className="w-4 h-4" />
            Built with data from GitHub API
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

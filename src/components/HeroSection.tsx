import { useGitHubUser } from "@/hooks/useGitHubData";
import { MapPin, ExternalLink, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection = () => {
  const { data: user, isLoading } = useGitHubUser();

  if (isLoading) {
    return (
      <section className="py-20 px-6">
        <div className="container max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <Skeleton className="w-36 h-36 rounded-full" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="py-20 px-6 animate-fade-in">
      <div className="container max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-accent opacity-60 blur-md" />
          <img
            src={user.avatar_url}
            alt={user.name || user.login}
            className="relative w-36 h-36 rounded-full border-2 border-primary/50 object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <p className="font-mono text-primary text-sm tracking-wider">
            {">"} hello_world
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-gradient">
            {user.name || user.login}
          </h1>
          {user.bio && (
            <p className="text-secondary-foreground text-lg max-w-lg">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            {user.location && (
              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" /> {user.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <BookOpen className="w-4 h-4" /> {user.public_repos} repos
            </span>
          </div>

          <div className="pt-3">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-semibold transition-all hover:shadow-[var(--glow-primary)] hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

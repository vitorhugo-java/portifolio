import { useGitHubRepos } from "@/hooks/useGitHubData";
import RepoCard from "@/components/RepoCard";
import { Skeleton } from "@/components/ui/skeleton";

const ReposSection = () => {
  const { data: repos, isLoading, error } = useGitHubRepos();

  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-primary text-sm">{">"}</span>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            New Repositories
          </h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive font-mono text-sm text-center py-10">
            Failed to load repositories. Please try again later.
          </p>
        )}

        {repos && (
          <div className="grid md:grid-cols-2 gap-5">
            {repos.map((repo, i) => (
              <RepoCard key={repo.id} repo={repo} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReposSection;

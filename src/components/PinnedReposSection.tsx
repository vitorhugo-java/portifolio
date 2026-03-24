import { useQuery } from "@tanstack/react-query";
import { GitHubRepo } from "@/hooks/useGitHubData";
import RepoCard from "@/components/RepoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin } from "lucide-react";
import pinnedUrls from "@/data/pinnedRepos.json";

const parseRepoUrl = (url: string) => {
  const parts = url.replace(/\/$/, "").split("/");
  return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
};

const fetchPinnedRepos = async (): Promise<GitHubRepo[]> => {
  const repos = await Promise.all(
    pinnedUrls.map(async (url) => {
      const { owner, repo } = parseRepoUrl(url);
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!res.ok) throw new Error(`Failed to fetch ${repo}`);
      return res.json();
    })
  );
  return repos;
};

const PinnedReposSection = () => {
  const { data: repos, isLoading, error } = useQuery({
    queryKey: ["pinnedRepos"],
    queryFn: fetchPinnedRepos,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <Pin className="w-4 h-4 text-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Pinned Repositories
          </h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive font-mono text-sm text-center py-10">
            Failed to load pinned repositories.
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

export default PinnedReposSection;

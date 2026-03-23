import { GitHubRepo, LANGUAGE_COLORS } from "@/hooks/useGitHubData";
import { Star, GitFork, ExternalLink } from "lucide-react";

interface RepoCardProps {
  repo: GitHubRepo;
  index: number;
}

const RepoCard = ({ repo, index }: RepoCardProps) => {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || "#8b8b8b" : null;

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-border bg-card p-6 card-hover opacity-0 animate-fade-in group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-mono text-base font-semibold text-primary truncate pr-2">
          {repo.name}
        </h3>
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
      </div>

      {repo.description && (
        <p className="text-secondary-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Topics / Stacks */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 text-xs font-mono rounded-md bg-secondary text-accent border border-border"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-muted-foreground text-xs font-mono">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: langColor || undefined }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" /> {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" /> {repo.forks_count}
        </span>
      </div>
    </a>
  );
};

export default RepoCard;

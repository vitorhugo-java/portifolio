import { useGitHubEvents, GitHubEvent } from "@/hooks/useGitHubData";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCommit, GitPullRequest, Star, GitFork, AlertCircle, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const eventIcon = (type: string) => {
  switch (type) {
    case "PushEvent": return <GitCommit className="w-4 h-4" />;
    case "PullRequestEvent": return <GitPullRequest className="w-4 h-4" />;
    case "WatchEvent": return <Star className="w-4 h-4" />;
    case "ForkEvent": return <GitFork className="w-4 h-4" />;
    case "IssuesEvent": return <AlertCircle className="w-4 h-4" />;
    case "CreateEvent": return <Plus className="w-4 h-4" />;
    default: return <GitCommit className="w-4 h-4" />;
  }
};

const eventDescription = (event: GitHubEvent): string => {
  const repoName = event.repo.name.split("/")[1];
  switch (event.type) {
    case "PushEvent": {
      const msg = event.payload.commits?.[0]?.message || "pushed code";
      return `Pushed to ${repoName}: "${msg.split("\n")[0]}"`;
    }
    case "PullRequestEvent":
      return `${event.payload.action} PR in ${repoName}: "${event.payload.pull_request?.title}"`;
    case "WatchEvent":
      return `Starred ${repoName}`;
    case "ForkEvent":
      return `Forked ${repoName}`;
    case "IssuesEvent":
      return `${event.payload.action} issue in ${repoName}: "${event.payload.issue?.title}"`;
    case "CreateEvent":
      return `Created ${event.payload.ref_type}${event.payload.ref ? ` "${event.payload.ref}"` : ""} in ${repoName}`;
    default:
      return `${event.type.replace("Event", "")} on ${repoName}`;
  }
};

const ActivitySection = () => {
  const { data: events, isLoading, error } = useGitHubEvents();

  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-primary text-sm">{">"}</span>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Recent Activity
          </h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive font-mono text-sm text-center py-10">
            Failed to load activity.
          </p>
        )}

        {events && events.length > 0 && (
          <div className="space-y-2">
            {events.map((event, i) => (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="mt-0.5 text-primary">{eventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-mono truncate">
                    {eventDescription(event)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivitySection;

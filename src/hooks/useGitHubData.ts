import { useQuery } from "@tanstack/react-query";

const GITHUB_USERNAME = "vitorhugo-java";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
  blog: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  homepage: string | null;
}

const checkGitHubResponse = (res: Response, label: string) => {
  if (!res.ok) {
    if (res.status === 403) {
      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining === "0") {
        const reset = res.headers.get("X-RateLimit-Reset");
        const resetTime = reset
          ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString()
          : "soon";
        throw new Error(
          `GitHub API rate limit exceeded. Limit resets at ${resetTime}. Please try again later.`
        );
      }
      throw new Error(`GitHub API returned 403 Forbidden for ${label}. This may be due to authentication requirements or access restrictions.`);
    }
    throw new Error(`Failed to fetch ${label} (${res.status})`);
  }
};

const fetchUser = async (): Promise<GitHubUser> => {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  checkGitHubResponse(res, "user");
  return res.json();
};

const fetchRepos = async (): Promise<GitHubRepo[]> => {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&direction=desc&per_page=6&type=owner`
  );
  checkGitHubResponse(res, "repos");
  return res.json();
};

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    commits?: { message: string }[];
    pull_request?: { title: string };
    issue?: { title: string };
  };
}

const fetchEvents = async (): Promise<GitHubEvent[]> => {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=10`
  );
  checkGitHubResponse(res, "events");
  return res.json();
};

export const useGitHubUser = () =>
  useQuery({ queryKey: ["github-user"], queryFn: fetchUser, staleTime: 1000 * 60 * 10 });

export const useGitHubRepos = () =>
  useQuery({ queryKey: ["github-repos"], queryFn: fetchRepos, staleTime: 1000 * 60 * 10 });

export const useGitHubEvents = () =>
  useQuery({ queryKey: ["github-events"], queryFn: fetchEvents, staleTime: 1000 * 60 * 5 });

// Language color mapping
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
};

import { useQuery } from "@tanstack/react-query";
import rawCache from "@/data/github-cache.json";

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

export interface DayData {
  date: string;
  count: number;
  level: number;
}

interface GitHubCache {
  user: GitHubUser;
  repos: GitHubRepo[];
  pinnedRepos: GitHubRepo[];
  events: GitHubEvent[];
  contributions: DayData[];
  generatedAt: string;
}

// All data is served from the pre-fetched cache committed to the repository.
// The cache is refreshed daily by the update-github-data GitHub Actions workflow.
const githubCache = rawCache as GitHubCache;

export const useGitHubUser = () =>
  useQuery({
    queryKey: ["github-user"],
    queryFn: () => Promise.resolve(githubCache.user),
    initialData: githubCache.user,
    staleTime: Infinity,
  });

export const useGitHubRepos = () =>
  useQuery({
    queryKey: ["github-repos"],
    queryFn: () => Promise.resolve(githubCache.repos),
    initialData: githubCache.repos,
    staleTime: Infinity,
  });

export const useGitHubEvents = () =>
  useQuery({
    queryKey: ["github-events"],
    queryFn: () => Promise.resolve(githubCache.events),
    initialData: githubCache.events,
    staleTime: Infinity,
  });

export const usePinnedRepos = () =>
  useQuery({
    queryKey: ["github-pinned-repos"],
    queryFn: () => Promise.resolve(githubCache.pinnedRepos),
    initialData: githubCache.pinnedRepos,
    staleTime: Infinity,
  });

export const useContributions = () =>
  useQuery({
    queryKey: ["github-contributions"],
    queryFn: () => Promise.resolve(githubCache.contributions),
    initialData: githubCache.contributions,
    staleTime: Infinity,
  });

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

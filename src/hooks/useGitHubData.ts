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

const fetchUser = async (): Promise<GitHubUser> => {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

const fetchRepos = async (): Promise<GitHubRepo[]> => {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`
  );
  if (!res.ok) throw new Error("Failed to fetch repos");
  const repos: GitHubRepo[] = await res.json();
  // Sort by stars (proxy for pinned) and return top 6
  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);
};

export const useGitHubUser = () =>
  useQuery({ queryKey: ["github-user"], queryFn: fetchUser, staleTime: 1000 * 60 * 10 });

export const useGitHubRepos = () =>
  useQuery({ queryKey: ["github-repos"], queryFn: fetchRepos, staleTime: 1000 * 60 * 10 });

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

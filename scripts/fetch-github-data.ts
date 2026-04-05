// Fetches all GitHub data needed by the website and writes to src/data/github-cache.json
// Run with: bun scripts/fetch-github-data.ts

const GITHUB_USERNAME = "vitorhugo-java";
const RECENT_REPOS_COUNT = 6;
const OTHER_REPOS_COUNT = 10;
const EVENT_PAGES = 3;
const EVENTS_PER_PAGE = 100;
const ACTIVITY_EVENTS = 10;

interface GitHubUser {
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

interface GitHubRepo {
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
  pushed_at: string | null;
  homepage: string | null;
}

interface GitHubEvent {
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

interface DayData {
  date: string;
  count: number;
  level: number;
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Use token if available to avoid rate limits
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json();
}

async function fetchUser(): Promise<GitHubUser> {
  return fetchGitHub(`/users/${GITHUB_USERNAME}`);
}

async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const all: GitHubRepo[] = [];
  let page = 1;
  while (true) {
    const data = await fetchGitHub<GitHubRepo[]>(
      `/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&type=owner`
    );
    if (data.length === 0) break;
    all.push(...data);
    page++;
  }
  return all;
}

async function fetchPinnedRepos(pinnedUrls: string[]): Promise<GitHubRepo[]> {
  const results: GitHubRepo[] = [];
  for (const url of pinnedUrls) {
    const parts = url.replace(/\/$/, "").split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    try {
      const data = await fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`);
      results.push(data);
    } catch (e) {
      console.warn(`  Skipping pinned repo ${owner}/${repo}: ${e}`);
    }
  }
  return results;
}

async function fetchEvents(): Promise<GitHubEvent[]> {
  return fetchGitHub<GitHubEvent[]>(
    `/users/${GITHUB_USERNAME}/events/public?per_page=${ACTIVITY_EVENTS}`
  );
}

async function fetchContributions(): Promise<DayData[]> {
  const allEvents: { created_at: string }[] = [];
  for (let page = 1; page <= EVENT_PAGES; page++) {
    try {
      const data = await fetchGitHub<{ created_at: string }[]>(
        `/users/${GITHUB_USERNAME}/events/public?per_page=${EVENTS_PER_PAGE}&page=${page}`
      );
      if (data.length === 0) break;
      allEvents.push(...data);
    } catch {
      break;
    }
  }

  const countMap: Record<string, number> = {};
  allEvents.forEach((event) => {
    const date = event.created_at.split("T")[0];
    countMap[date] = (countMap[date] || 0) + 1;
  });

  const today = new Date();
  const days: DayData[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = countMap[dateStr] || 0;
    days.push({
      date: dateStr,
      count,
      level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4,
    });
  }
  return days;
}

async function main() {
  console.log("Fetching GitHub data for cache...");

  const path = await import("path");
  const fs = await import("fs");
  const rootDir = path.resolve(import.meta.dirname, "..");

  const pinnedUrlsPath = path.join(rootDir, "src/data/pinnedRepos.json");
  const pinnedUrls: string[] = JSON.parse(fs.readFileSync(pinnedUrlsPath, "utf-8"));

  const [user, allRepos, pinnedRepos, events, contributions] = await Promise.all([
    fetchUser(),
    fetchAllRepos(),
    fetchPinnedRepos(pinnedUrls),
    fetchEvents(),
    fetchContributions(),
  ]);

  // Sort all repos by pushed_at descending (most recently active first)
  const sortedRepos = [...allRepos].sort((a, b) => {
    const ta = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
    const tb = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
    return tb - ta;
  });

  const pinnedFullNames = new Set(pinnedRepos.map((r) => r.full_name));

  // Recent repos: top RECENT_REPOS_COUNT excluding pinned
  const recentRepos = sortedRepos
    .filter((r) => !pinnedFullNames.has(r.full_name))
    .slice(0, RECENT_REPOS_COUNT);

  const recentFullNames = new Set(recentRepos.map((r) => r.full_name));

  // Other repos: up to OTHER_REPOS_COUNT, excluding pinned and recent
  const otherRepos = sortedRepos
    .filter((r) => !pinnedFullNames.has(r.full_name) && !recentFullNames.has(r.full_name))
    .slice(0, OTHER_REPOS_COUNT);

  const cache = {
    user,
    repos: [...recentRepos, ...otherRepos],
    pinnedRepos,
    events,
    contributions,
    generatedAt: new Date().toISOString(),
  };

  const cachePath = path.join(rootDir, "src/data/github-cache.json");
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

  console.log(`✓ Wrote github-cache.json`);
  console.log(`  User: ${user.name ?? user.login}`);
  console.log(`  Repos: ${recentRepos.length} recent + ${otherRepos.length} other`);
  console.log(`  Pinned repos: ${pinnedRepos.length}`);
  console.log(`  Events: ${events.length}`);
  console.log(`  Contributions: ${contributions.length} days (${countAllEvents(contributions)} total events)`);
}

function countAllEvents(contributions: DayData[]): number {
  return contributions.reduce((sum, d) => sum + d.count, 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

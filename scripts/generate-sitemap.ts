// This script fetches all repos for the user and generates sitemap.xml and robots.txt
// based on the "homepage" field of each repository.
// Run with: bun scripts/generate-sitemap.ts

import { readFileSync } from "fs";
import { resolve } from "path";

const GITHUB_USERNAME = "vitorhugo-java";
const SITE_URL = "https://vitorhugo-java.github.io"; // Update with your actual site URL

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchAllRepos(): Promise<any[]> {
  const repos: any[] = [];
  let page = 1;
  const headers = buildHeaders();
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}`,
      { headers }
    );
    if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
    const data = await res.json();
    if (data.length === 0) break;
    repos.push(...data);
    page++;
  }
  return repos;
}

async function fetchPinnedRepos(): Promise<any[]> {
  const pinnedReposPath = resolve(import.meta.dirname, "../src/data/pinnedRepos.json");
  const pinnedUrls: string[] = JSON.parse(readFileSync(pinnedReposPath, "utf-8"));
  const headers = buildHeaders();
  const results: any[] = [];
  for (const url of pinnedUrls) {
    const parts = url.replace(/\/$/, "").split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!res.ok) {
        console.warn(`  Skipping pinned repo ${owner}/${repo}: ${res.status}`);
        continue;
      }
      results.push(await res.json());
    } catch (e) {
      console.warn(`  Skipping pinned repo ${owner}/${repo}: ${e}`);
    }
  }
  return results;
}

async function main() {
  const [userRepos, pinnedRepos] = await Promise.all([fetchAllRepos(), fetchPinnedRepos()]);

  // Merge repos, deduplicating by full_name (first occurrence wins; user repos are added first)
  const repoMap = new Map<string, any>();
  for (const r of [...userRepos, ...pinnedRepos]) {
    if (!repoMap.has(r.full_name)) {
      repoMap.set(r.full_name, r);
    }
  }
  const repos = Array.from(repoMap.values());
  const today = new Date().toISOString().split("T")[0];

  // Collect homepage URLs with their last pushed date
  const homepageEntries: { url: string; lastmod: string }[] = repos
    .filter((r: any) => r.homepage && r.homepage.trim() !== "")
    .map((r: any) => ({
      url: r.homepage.trim(),
      lastmod: r.pushed_at ? r.pushed_at.split("T")[0] : today,
    }));

  // Add site root as the first entry
  const allEntries = [
    { url: SITE_URL, lastmod: today },
    ...homepageEntries,
  ];

  // Generate sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    ({ url, lastmod }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join("\n")}
</urlset>`;

  // Generate robots.txt
  const robots = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

  // Write files
  const fs = await import("fs");
  const path = await import("path");
  const publicDir = path.resolve(import.meta.dirname, "../public");
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

  console.log(`Generated sitemap.xml with ${allEntries.length} URLs`);
  console.log(`Generated robots.txt with sitemap reference`);
  console.log("Homepage URLs found:", homepageEntries.map((e) => e.url));
}

main().catch(console.error);

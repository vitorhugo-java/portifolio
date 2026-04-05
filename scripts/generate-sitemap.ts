// This script fetches all repos for the user and generates sitemap.xml and robots.txt
// based on the "homepage" field of each repository.
// Run with: npx tsx scripts/generate-sitemap.ts

const GITHUB_USERNAME = "vitorhugo-java";
const SITE_URL = "https://vitorhugo-java.github.io"; // Update with your actual site URL

async function fetchAllRepos(): Promise<any[]> {
  const repos: any[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}`
    );
    if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
    const data = await res.json();
    if (data.length === 0) break;
    repos.push(...data);
    page++;
  }
  return repos;
}

async function main() {
  const repos = await fetchAllRepos();

  // Collect homepage URLs
  const homepages: string[] = repos
    .filter((r: any) => r.homepage && r.homepage.trim() !== "")
    .map((r: any) => r.homepage.trim());

  // Add site root
  const allUrls = [SITE_URL, ...homepages];

  // Generate sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
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

  console.log(`Generated sitemap.xml with ${allUrls.length} URLs`);
  console.log(`Generated robots.txt with sitemap reference`);
  console.log("Homepage URLs found:", homepages);
}

main().catch(console.error);

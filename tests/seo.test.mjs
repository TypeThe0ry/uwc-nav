import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");

test("homepage exposes a focused SEO head and one primary heading", async () => {
  const html = await read("index.html");
  assert.match(html, /<title>UWC Nav \| UWCSEA Student Start Page<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"\/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/uwc\.tools\/"\/>/);
  assert.match(html, /<link rel="icon" href="favicon\.svg" type="image\/svg\+xml"\/>/);
  assert.match(html, /<link rel="manifest" href="manifest\.json"\/>/);
  assert.match(html, /<link rel="alternate" type="text\/plain" title="LLM-friendly site summary" href="\/llms\.txt"\/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<nav class="categories" aria-label="UWC Nav shortcut categories">/);
  assert.match(html, /<section class="about" aria-labelledby="about-title">/);
});

test("JSON-LD is valid and connects the site, organization, page, and links", async () => {
  const html = await read("index.html");
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, "JSON-LD block is missing");
  const graph = JSON.parse(match[1]);
  assert.equal(graph["@context"], "https://schema.org");
  const byType = Object.fromEntries(graph["@graph"].map((entry) => [entry["@type"], entry]));
  assert.equal(byType.WebSite.publisher["@id"], "https://uwc.tools/#organization");
  assert.equal(byType.WebPage.isPartOf["@id"], "https://uwc.tools/#website");
  assert.equal(byType.WebPage.mainEntity["@id"], "https://uwc.tools/#popular-links");
  assert.equal(byType.WebPage.primaryImageOfPage["@id"], "https://uwc.tools/#primary-image");
  assert.equal(byType.ItemList.numberOfItems, 12);
  assert.equal(byType.Organization.sameAs[0], "https://github.com/TypeThe0ry/uwc-nav");
  assert.equal(byType.ImageObject.width, 1200);
  assert.equal(byType.ImageObject.height, 630);
});

test("crawler and GEO discovery files remain coherent", async () => {
  const [robots, sitemap, llms] = await Promise.all([
    read("robots.txt"),
    read("sitemap.xml"),
    read("llms.txt"),
  ]);
  for (const bot of ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
    assert.match(robots, new RegExp(`User-agent: ${bot}[\\s\\S]*?Allow: \\/`));
  }
  assert.match(robots, /Sitemap: https:\/\/uwc\.tools\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/uwc\.tools\/<\/loc>/);
  assert.match(sitemap, /<lastmod>2026-09-01<\/lastmod>/);
  assert.match(llms, /Canonical URL: https:\/\/uwc\.tools\//);
  assert.match(llms, /Source repository: https:\/\/github\.com\/TypeThe0ry\/uwc-nav/);
  assert.match(llms, /Featured service: OWU Website Unblocker/);
  const manifest = JSON.parse(await read("manifest.json"));
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.icons[0].src, "/favicon.svg");
});

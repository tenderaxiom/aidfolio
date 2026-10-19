# Search and AI visibility

How Aidfolio is set up so that search engines and AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot) can find it, and the few dashboard steps that only the owner can do.

## What the site already does

- One page per tool and guide, each with its own title, description, canonical address and plain-English answers that work without JavaScript.
- Structured data (schema.org JSON-LD): Organization, WebSite, WebApplication for each tool, Article for each guide, FAQPage, ItemList for the toolbox, BreadcrumbList.
- `sitemap.xml` listing every page; `robots.txt` welcoming all crawlers, with a Content-Signal line saying search, AI answers and AI training are all allowed.
- `llms.txt`: a plain summary of the tools, guides and resources written for AI assistants.
- The toolbox is in the HTML itself, so crawlers that do not run JavaScript still see all resources.
- The Live site check workflow runs after every deploy and each Monday. It confirms every page loads and that crawler user agents are not blocked.

Pages are generated at build time from the tools' own data, so they never drift from what the tools do.

## Owner steps (about 20 minutes, once)

1. **Google Search Console** (search.google.com/search-console): Add property > Domain > `aidfolio.org`. Choose Cloudflare when asked to verify; it adds the DNS record for you. Then Sitemaps > submit `https://aidfolio.org/sitemap.xml`. Use URL inspection > Request indexing for the home page and the three tool pages.
2. **Bing Webmaster Tools** (bing.com/webmasters): sign in and choose Import from Google Search Console. Bing's index also feeds Microsoft Copilot and other AI search tools.
3. **Cloudflare, aidfolio.org**:
   - Caching > Configuration > turn on **Crawler Hints** (tells Bing and others through IndexNow when pages change).
   - Security > Settings > **AI bot traffic** (or AI Crawl Control): set Search, Agent and Training to **Do not block**. Since 15 September 2026 new domains block Agent and Training bots on pages with ads by default; Aidfolio has no ads, but setting it explicitly avoids surprises.
   - AI Crawl Control > Crawlers: check that no crawler is set to Block.
4. Optional: a Redirect Rule sending `www.aidfolio.org` to `aidfolio.org` (the canonical tag already tells search engines which one to use).

## What moves rankings most from here

Links from trusted sector sites. Ask networks and partners that already serve local organisations to link to the specific tool or guide page, not just the home page. See `OUTREACH.md`.

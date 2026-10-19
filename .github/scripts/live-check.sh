#!/usr/bin/env bash
# Checks the live site the way search engines and AI assistants see it. Posts results as GitHub annotations.
# Fails only if a page in the sitemap does not load for an ordinary browser.
set -u
SITE=https://aidfolio.org
BROWSER='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
code() { curl -s -o /dev/null -w '%{http_code}' -A "$1" --max-time 30 "$2"; }
bad=0
urls=$(curl -s -A "$BROWSER" --max-time 30 "$SITE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g')
[ -z "$urls" ] && { echo "::error title=Live check::sitemap.xml could not be read"; exit 1; }
n=0
for u in $urls; do n=$((n+1)); c=$(code "$BROWSER" "$u"); if [ "$c" != 200 ]; then echo "::error title=Page not loading::$u -> $c"; bad=1; fi; done
echo "::notice title=Pages::$n pages in the sitemap checked with a normal browser"
for f in robots.txt llms.txt sitemap.xml; do c=$(code "$BROWSER" "$SITE/$f"); [ "$c" = 200 ] || echo "::warning title=File missing::$f -> $c"; done
c=$(code "$BROWSER" "$SITE/no-such-page"); [ "$c" = 404 ] || echo "::warning title=Not-found handling::unknown page returned $c, expected 404"
declare -A BOTS=(
  [Googlebot]='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  [Bingbot]='Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
  [Applebot]='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)'
  [GPTBot]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)'
  [OAI-SearchBot]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot'
  [ChatGPT-User]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot'
  [ClaudeBot]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)'
  [Claude-SearchBot]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)'
  [Claude-User]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)'
  [PerplexityBot]='Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)'
  [CCBot]='CCBot/2.0 (https://commoncrawl.org/faq/)'
)
ok=(); blocked=()
for name in "${!BOTS[@]}"; do
  a=$(code "${BOTS[$name]}" "$SITE/"); b=$(code "${BOTS[$name]}" "$SITE/readiness-check/")
  if [ "$a" = 200 ] && [ "$b" = 200 ]; then ok+=("$name"); else blocked+=("$name ($a/$b)"); fi
done
echo "::notice title=Crawlers allowed::${ok[*]:-none}"
if [ ${#blocked[@]} -gt 0 ]; then
  echo "::warning title=Crawlers blocked or challenged::${blocked[*]}. Check Cloudflare: AI Crawl Control, and Security > Settings > AI bot traffic. Note: this test only imitates the crawler's name, so Googlebot and Bingbot results can be false alarms if Cloudflare spots the imitation; real crawlers are verified separately."
fi
for h in https://www.aidfolio.org/ https://aidfolio.com/ https://www.aidfolio.com/; do
  r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' -A "$BROWSER" --max-time 20 "$h" || echo "no answer")
  echo "::notice title=Domain $h::$r"
done
# Email: richard@aidfolio.org depends on Cloudflare Email Routing records (asked of the authoritative nameserver, so no cache).
ns=$(dig +short NS aidfolio.org | head -1)
if [ -n "$ns" ]; then
  mx=$(dig +short MX aidfolio.org @"$ns" | sort | tr '\n' ' ')
  spf=$(dig +short TXT aidfolio.org @"$ns" | grep -i 'v=spf1' | tr '\n' ' ')
  if echo "$mx" | grep -qi 'mx.cloudflare.net'; then echo "::notice title=Email routing::MX $mx| SPF ${spf:-none}"; else echo "::warning title=Email routing::No Cloudflare MX records for aidfolio.org (found: ${mx:-none}). Mail to richard@aidfolio.org will bounce."; fi
fi
exit $bad

// Checks every external link in the site and docs. Reports problems as GitHub warnings; never fails the build,
// because some official sites block automated checks.
import { readFileSync, readdirSync } from 'node:fs';
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(x => x.isDirectory() ? walk(d + '/' + x.name) : [d + '/' + x.name]);
const files = [...walk('public').filter(f => /\.(html|txt)$/.test(f)), 'README.md', ...readdirSync('docs').filter(f => f.endsWith('.md')).map(f => 'docs/' + f)];
const found = new Map();
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/https:\/\/[^\s"'<>)\]`]+/g)) {
    let u = m[0].replace(/[.,;:]+$/, '');
    if (/^https:\/\/(aidfolio\.org|www\.aidfolio\.org|wa\.me|t\.me\/share|bsky\.app\/intent|twitter\.com\/intent|x\.com\/intent|www\.facebook\.com\/sharer|www\.linkedin\.com\/sharing)/.test(u) || u.includes('${') || u.includes('"+')) continue;
    if (!found.has(u)) found.set(u, f);
  }
}
// Sites that refuse automated checks with a 404, verified by hand in a browser on 20 October 2026.
const BOT_BLOCKED = new Set(['https://kobotoolbox.org/kobo', 'https://scsanctions.un.org/search']);
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Aidfolio-link-check';
async function check(u) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(u, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: AbortSignal.timeout(30000) });
      r.body?.cancel();
      if (r.ok || [401, 403, 406, 429].includes(r.status)) return { ok: true, status: r.status };
      if (r.status >= 500 && attempt < 2) { await new Promise(s => setTimeout(s, 3000)); continue; }
      if (BOT_BLOCKED.has(u)) return { ok: true, status: 403 };
      return { ok: false, status: r.status };
    } catch (e) { if (attempt === 2) return { ok: false, status: e.name === 'TimeoutError' ? 'timeout' : String(e.cause?.code || e.message) }; }
  }
}
const urls = [...found.keys()]; let bad = 0, blocked = 0;
const results = [];
for (let i = 0; i < urls.length; i += 8) results.push(...await Promise.all(urls.slice(i, i + 8).map(async u => [u, await check(u)])));
results.sort((a, b) => (a[1].ok - b[1].ok));
for (const [u, r] of results) {
  if (!r.ok) { bad++; console.log(`::warning title=Link problem::${found.get(u)}: ${u} -> ${r.status}`); }
  else if (r.status !== 200 && !(r.status >= 200 && r.status < 300)) blocked++;
}
console.log(`::notice title=Link check summary::${urls.length} links checked, ${bad} problems, ${blocked} blocked automated checks (counted as fine)`);

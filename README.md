# Aidfolio

Free, private tools for local humanitarian organisations, for the three problems they raise most:

1. **Readiness check** (`#check`): get ready for a partner assessment. A readiness profile, prioritised gaps,
   draft practice statements built only from the user's own answers, and an evidence index.
2. **Fair cost** (`#cost`): the organisation's true overhead rate, how much its grants leave unfunded,
   and a negotiation brief citing published policies.
3. **Risk-sharing plan** (`#risk`): structured preparation for a risk-sharing dialogue with a donor or
   intermediary, using the eight categories and seven stages of the Risk Sharing Framework (2023).

The readiness pack includes a dated action plan (for organisations facing their first assessment), a summary
organised by the capacity areas of the Charter for Change Due Diligence Passporting Tool, and a spreadsheet export for
assessors (see `docs/C4C-MAPPING.md`). Fair cost lets an organisation email anonymous percentages, if it chooses, to
build open evidence on local running costs (see `docs/DATA-PROTOCOL.md`). A Toolbox of hand-picked free
resources links the right one to every gap the readiness check finds (see `docs/TOOLBOX.md`).

Everything runs in the browser. Nothing is uploaded.

## How it is published

- **Code:** github.com/tenderaxiom/aidfolio. Every change merged into `main` is published automatically by
  `.github/workflows/deploy.yml`, which runs Cloudflare's Wrangler with two repository secrets
  (`CLOUDFLARE_API_TOKEN`, made from the "Edit Cloudflare Workers" template, and `CLOUDFLARE_ACCOUNT_ID`).
- **Hosting:** a Cloudflare Worker named `aidfolio` serving the `public` folder (`wrangler.jsonc`), attached to
  `aidfolio.org` and `www.aidfolio.org` as Custom Domains.
- **aidfolio.com:** redirect it to `https://aidfolio.org` with a Cloudflare Redirect Rule (see the launch guide, step 5).
- **Email:** Cloudflare Email Routing forwards `richard@aidfolio.org` to the owner's inbox.
- **Analytics:** Cloudflare Web Analytics (cookie-free); `_headers` already allows it.
- **Support payments:** Stripe Payment Links, one-off (customer chooses the amount) and monthly (US$10 per unit).
- **Ledger:** `docs/LEDGER.md`, linked from the Support section.

To change the site, edit files on github.com (pencil icon, then **Commit changes**) or merge a pull request;
it goes live in about a minute.

## What is in this folder

- `public/` is the website itself: `index.html` (the whole app), `_headers` (security settings), `sw.js` (offline
  use), icons, `og.png` (the picture shown when the link is shared) and `robots.txt`.
- `wrangler.jsonc` tells Cloudflare to publish the `public` folder. You do not need to edit it.
- `docs/` holds the launch checklist, outreach templates, the money ledger and translation notes. It is not published.
- `.github/` runs free accessibility and broken-link checks each time you commit.

## How it is built

- One HTML file with inline CSS and JavaScript. No framework and no build step, so anyone can maintain it.
- Content lives in plain objects in the script: `AREAS` (readiness), `COST_CATS` (shared-cost categories), `RISK_CATS` and `MEASURES` (risk-sharing). To add a language, copy them.
- Fair cost formulas: rate r = shared costs / direct costs; a grant rate on a total basis converts as a/(1-a); gap = max(0, r x direct - allowed x direct); shortfall = max(0, shared - received - unrestricted).
- Readiness rule: a document counts as ready only if it is held and within its validity window (`valid`, in months).
  Expired documents show as "Needs update", never as missing. The tool gives counts, never a score.
- Data stays in `localStorage` on the user's device, plus an optional progress file the user saves themselves.
- `sw.js` lets the tool open without a connection after the first visit.
- `_headers` sets a strict Content Security Policy: no third-party scripts except Cloudflare's cookie-free analytics beacon.

## Licences

Code: MIT (see `LICENSE`). Questions, statements and templates: CC BY 4.0 (see `CONTENT-LICENSE.md`).

Aidfolio is an independent self-assessment tool. It does not certify or verify organisations, and it is not legal advice.

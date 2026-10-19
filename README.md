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

## Publish it on Cloudflare (about 30 minutes, nothing to install)

The full illustrated guide is in the Aidfolio Launch Guide. The short version:

1. **GitHub.** At github.com, select **+** then **New repository**. Name it `aidfolio`, choose **Public**, tick
   **Add a README file**, then **Create repository**. Select **Add file**, then **Upload files**, and drag in
   everything inside this folder (including the `public` folder and `wrangler.jsonc`). Select **Commit changes**.
2. **Cloudflare.** In the Cloudflare dashboard (the same account as your other sites), go to **Workers & Pages**,
   select **Create application**, then **Import a repository**. Connect GitHub, choose `aidfolio`, keep the
   suggested settings (deploy command `npx wrangler deploy`, no build command) and select **Deploy**.
   The site goes live at `aidfolio.<your-subdomain>.workers.dev`.
3. **Domain.** `aidfolio.org` and `aidfolio.com` are already registered in the Cloudflare account. In the Worker go to
   **Settings**, **Domains & Routes**, **Add**, **Custom Domain**, and add `aidfolio.org`, then `www.aidfolio.org`.
   Redirect `aidfolio.com` to the .org (see the launch guide, step 5).
4. **Analytics.** Go to **Web Analytics**, select **Manage Site** next to `aidfolio.org`, and choose automatic
   setup. It is cookie-free, and `_headers` already allows it.
5. **Email.** Go to **Compute**, **Email Service**, **Email Routing**. Select **Onboard Domain** and choose
   `aidfolio.org`. Under **Destination Addresses**, add and verify your own inbox. Under **Routing Rules**, select
   **Create routing rule**: pattern `hello`, action **Send to an email**, destination your inbox.
6. **Donations.** Create GitHub Sponsors and Ko-fi pages. In `public/index.html`, search for `data-setup`, replace each
   `href="#support"` with your link, and delete the `placeholder` class and the `data-setup="..."` attribute.
7. **About and ledger.** Search `public/index.html` for `[Your name` and replace the placeholder. Then find
   `data-setup="ledger"`, replace its `href="#support"` with the link to `docs/LEDGER.md` on GitHub, and remove the
   `placeholder` class and the `data-setup` attribute.
8. **Another domain?** Search for `aidfolio.org` in `public/index.html` and replace it everywhere, including
   `var SITE`.

Every later change: open the file on github.com, select the pencil icon, edit, then **Commit changes**.
Cloudflare republishes automatically in about a minute.

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

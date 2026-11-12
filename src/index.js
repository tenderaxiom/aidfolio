// Aidfolio Worker.
// - Web requests: www.aidfolio.org is redirected to aidfolio.org (one origin, so answers saved
//   in the browser are always found again); everything else is served from /public.
// - Email: mail sent to richard@aidfolio.org is forwarded to the inboxes listed in the
//   FORWARD_TO secret (comma-separated), so no personal address is published in this repository.
//   Set it once with:  npx wrangler secret put FORWARD_TO

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.aidfolio.org") {
      url.hostname = "aidfolio.org";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },

  async email(message, env) {
    const inboxes = String(env.FORWARD_TO || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!inboxes.length) {
      console.log("FORWARD_TO is not set: mail cannot be forwarded. Run: npx wrangler secret put FORWARD_TO");
      message.setReject("Temporarily unable to deliver, please try again later");
      return;
    }
    const results = await Promise.allSettled(inboxes.map((to) => message.forward(to)));
    results.forEach((r, i) => {
      if (r.status === "rejected") console.log("forward failed for inbox", i + 1, String(r.reason));
    });
    if (!results.some((r) => r.status === "fulfilled")) {
      message.setReject("Temporarily unable to deliver, please try again later");
    }
  },
};

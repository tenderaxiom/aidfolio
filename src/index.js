// Aidfolio Worker.
// - Web requests: served from the static files in /public (unchanged behaviour).
// - Email: mail sent to richard@aidfolio.org is forwarded to both inboxes below.
//   If one inbox fails (for example, not yet verified in Cloudflare), the other still gets it.

const INBOXES = ["tenderaxiom@gmail.com", "rgprouse@gmail.com"];

export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },

  async email(message) {
    const results = await Promise.allSettled(INBOXES.map((to) => message.forward(to)));
    results.forEach((r, i) => {
      if (r.status === "rejected") console.log("forward failed:", INBOXES[i], String(r.reason));
    });
    if (!results.some((r) => r.status === "fulfilled")) {
      message.setReject("Temporarily unable to deliver, please try again later");
    }
  },
};

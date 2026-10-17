// Git-owned copy of the actually published Alliance ChatGPT website.
// Cloudflare serves all public assets from live-site/.
// Do not import the unrelated root worker.js; it belongs to a different rebuild.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};

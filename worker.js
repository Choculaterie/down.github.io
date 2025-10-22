addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const timeout = 4000; // 4 seconds
  const url = new URL(request.url);

  // 1. Route CSS & JS requests directly to litematic.org
  if (url.pathname.endsWith(".css") || url.pathname.endsWith(".js") || url.pathname.endsWith(".png")) {
    const assetURL = new URL(request.url);
    assetURL.hostname = "litematic.org";
    return fetch(assetURL.toString());
  }

  // 2. Try fetching from choculaterie.com (main origin)
  try {
    const originResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Origin timeout")), timeout)
      ),
    ]);

    if (originResponse.status >= 500) throw new Error("Origin 5xx");

    return originResponse;

  } catch (err) {
    // 3. Failover: serve the ROOT of litematic.org
    try {
      const failoverURL = new URL("https://litematic.org/");
      // Always fetch root (not /users/...)
      const failoverResponse = await fetch(failoverURL.toString(), {
        redirect: "follow",
      });

      // Return content but keep the user's URL
      return new Response(await failoverResponse.text(), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });

    } catch {
      // 4. Last fallback: simple offline page
      return new Response(
        `<html><body><h1>Site temporarily down</h1><p>Please try again later.</p></body></html>`,
        { status: 503, headers: { "Content-Type": "text/html" } }
      );
    }
  }
}

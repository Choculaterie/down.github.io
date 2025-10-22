addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const timeout = 4000; // 4 seconds

  try {
    // Try fetching the origin with timeout
    const originResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Origin timeout")), timeout)
      ),
    ]);

    // Failover if origin returns 5xx
    if (originResponse.status >= 500) throw new Error("Origin 5xx");

    // Origin is healthy — return its response
    return originResponse;

  } catch (err) {
    // Origin failed — serve failover page at root
    try {
      const failoverURL = new URL(request.url);
      failoverURL.hostname = "litematic.org";
      failoverURL.pathname = "/";             // always fetch root

      return await fetch(failoverURL.toString(), {
        cf: { resolveOverride: "choculaterie.com" },
        redirect: "follow",
      });

    } catch (failoverErr) {
      // Failover unreachable — return a simple offline page
      return new Response(
        `<html><body><h1>Site is temporarily down</h1><p>Please try again later.</p></body></html>`,
        { status: 503, headers: { "Content-Type": "text/html" } }
      );
    }
  }
}

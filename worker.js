addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Try the origin
    const fetchPromise = fetch(request);
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 4000));
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // If we got a response, check its status
    if (response) {
        if (response.status >= 500) {
            const failoverURL = new URL(request.url);
            failoverURL.hostname = "down.choculaterie.com";
            return fetch(failoverURL.toString(), {
                ...request,
                cf: { resolveOverride: "choculaterie.com" },
            });
        }

        // Origin is healthy — serve it
        return response;
    }

    // Timeout or no response — failover
    const failoverURL = new URL(request.url);
    failoverURL.hostname = "down.choculaterie.com";
    return fetch(failoverURL.toString(), {
        ...request,
        cf: { resolveOverride: "choculaterie.com" },
    });
}

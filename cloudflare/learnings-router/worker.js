/**
 * Cloudflare Worker Edge Router for learnings.simplicion.com/t*
 * Proxies /t and /t/* seamlessly to the Teacher Portal Cloudflare Pages deployment
 * (built with basePath="/t") while learnings.simplicion.com/* serves the Student Portal directly.
 */
const TEACHER_ORIGIN = 'https://learnings-teacher-portal.pages.dev';

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, TEACHER_ORIGIN);

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('Host', new URL(TEACHER_ORIGIN).host);
    proxyHeaders.set('X-Forwarded-Host', incomingUrl.host);
    proxyHeaders.set('X-Forwarded-Proto', 'https');

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual',
    });

    const response = await fetch(proxyRequest);

    // Rewrite Location redirects back to learnings.simplicion.com if needed
    const resHeaders = new Headers(response.headers);
    const location = resHeaders.get('Location');
    if (location && location.startsWith(TEACHER_ORIGIN)) {
      resHeaders.set('Location', location.replace(TEACHER_ORIGIN, incomingUrl.origin));
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  },
};

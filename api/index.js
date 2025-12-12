import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

const INSTANCES = [
  'https://njump.me',
  'https://nostr.at',
  'https://nostr.eu',
  'https://nostr.ae',
  'https://nostr.com'
];

const redis = Redis.fromEnv();

// Helper to get header value (works with both Headers object and plain object)
function getHeader(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === 'function') {
    return headers.get(name) || headers.get(name.toLowerCase());
  }
  return headers[name] || headers[name.toLowerCase()] || null;
}

async function getTargetUrl(path, query) {
  let instance = null;

  try {
    instance = await redis.get(path);
  } catch (error) {
    console.error('Redis GET failed, falling back to random instance:', error);
  }

  if (!instance) {
    instance = INSTANCES[Math.floor(Math.random() * INSTANCES.length)];
    try {
      // Cache for 24 hours, but don't block on failure
      await redis.set(path, instance, { ex: 86400 });
    } catch (error) {
      console.error('Redis SET failed:', error);
    }
  }

  return path ? `${instance}/${path}${query}` : `${instance}${query}`;
}

export default async function handler(request) {
  const requestPath = request.url || '/';
  
  // Parse URL - construct full URL if needed
  let path = '';
  let query = '';
  
  try {
    const url = requestPath.startsWith('http')
      ? new URL(requestPath)
      : new URL(requestPath, `${getHeader(request.headers, 'x-forwarded-proto') || 'https'}://${getHeader(request.headers, 'host') || getHeader(request.headers, 'x-forwarded-host') || 'localhost'}`);
    path = url.pathname.substring(1);
    query = url.search;
  } catch {
    // Fallback: parse manually
    const [pathPart, queryPart] = requestPath.split('?');
    path = pathPart.substring(1);
    query = queryPart ? `?${queryPart}` : '';
  }
  
  const targetUrl = await getTargetUrl(path, query);
  return Response.redirect(targetUrl, 302);
}

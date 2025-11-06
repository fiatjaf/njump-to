const INSTANCES = [
  'https://njump.me',
  'https://nostr.at',
  'https://nostr.eu',
  'https://nostr.ae',
  'https://nostr.com'
];

export default async function handler(request) {
  // Construct full URL from request
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const fullUrl = request.url.startsWith('http') 
    ? request.url 
    : `${protocol}://${host}${request.url}`;
  
  const url = new URL(fullUrl);
  const path = url.pathname.substring(1); // Remove leading slash
  const query = url.search;
  
  // Randomly select instance
  const instance = INSTANCES[Math.floor(Math.random() * INSTANCES.length)];
  
  // Build target URL
  const targetUrl = path 
    ? `${instance}/${path}${query}`
    : `${instance}${query}`;
  
  return Response.redirect(targetUrl, 302);
}


import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the handler
const handlerModule = await import('./api/index.js');
const handler = handlerModule.default;

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  try {
    // Convert Node.js request to Web API Request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || `localhost:${PORT}`;
    const url = `${protocol}://${host}${req.url}`;
    
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? req 
        : undefined,
    });

    // Call the handler
    const response = await handler(request);

    // Convert Web API Response to Node.js response
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Handle redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        res.setHeader('Location', location);
      }
    }

    const body = await response.text();
    res.end(body);
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Dev server running on http://localhost:${PORT}`);
  console.log(`   No Vercel authentication required!`);
});


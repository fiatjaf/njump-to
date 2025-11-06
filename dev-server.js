import http from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the HTML file once at startup
const htmlContent = readFileSync(join(__dirname, 'index.html'), 'utf-8');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Serve the HTML file for all routes (client-side redirect handles routing)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
});

server.listen(PORT, () => {
  console.log(`🚀 Dev server running on http://localhost:${PORT}`);
  console.log(`   No Vercel authentication required!`);
});


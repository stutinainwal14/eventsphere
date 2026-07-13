const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Serve static files from the auth folder (if needed)
app.use(express.static(path.join(__dirname, '..', 'auth')));

app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, path) => {
    // Set the MIME type for CSS files
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // Set the MIME type for JavaScript files
    else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    // Set the MIME type for HTML files
    else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
    // Set the MIME type for images
    else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Proxy API requests to the backend
app.use(
  createProxyMiddleware({
    target: 'http://localhost:8080', // The backend server
    changeOrigin: true, // Necessary for cross-origin requests
    // Keep '/api' in the forwarded request
    onProxyReq: (proxyReq, req, res) => {
      // Log the request being proxied
      console.log('Proxy request to backend:', req.originalUrl);
    },
    onError(err, req, res) {
      // If an error occurs during proxying
      console.error('Proxy error:', err.message);
      res.status(500).send('Proxy Error: ' + err.message);
    },
  })
);

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});

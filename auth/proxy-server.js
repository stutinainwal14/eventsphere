const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Serve static files from the auth folder (if needed)
app.use(express.static(path.join(__dirname, '..', 'auth')));

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

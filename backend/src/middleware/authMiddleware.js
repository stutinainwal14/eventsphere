// Import JWT for verifying tokens
const jwt = require('jsonwebtoken');

// Import the configured database pool
const db = require('../config/db');

// Authentication middleware to protect routes
const authMiddleware = async (req, res, next) => {
   // Retrieve the Authorization header
  const authHeader = req.headers.authorization;

  // Extract the token from the Authorization header if present and valid format
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
  ? authHeader.split(' ')[1]
  : null;

  // Extract the token from the cookie if available
  const tokenFromCookie = req.cookies && req.cookies.token;

  // Use token from either header or cookie
  const token = tokenFromHeader || tokenFromCookie;

  // If no token is provided, deny access
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const [rows] = await db.query('SELECT token FROM BlacklistedTokens WHERE token = ?', [token]);
    if (rows.length > 0) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    // Verify and decode the JWT using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle invalid or expired token
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Export the middleware to use in protected routes
module.exports = authMiddleware;

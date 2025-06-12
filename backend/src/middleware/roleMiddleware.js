// Export a middleware function that checks for allowed user roles
module.exports = function requireRole(...allowedRoles) {
    return (req, res, next) => {
      // Destructure the user's role from the decoded JWT payload (attached by authMiddleware)
      const { role } = req.user;

      // Check if the user's role is included in the list of allowed roles
      if (!allowedRoles.includes(role)) {
        // If not, respond with a 403 Forbidden error
        return res.status(403).json({ message: 'Access denied' });
      }
      // If the role is allowed, proceed to the next middleware or route handler
      next();
    };
  };

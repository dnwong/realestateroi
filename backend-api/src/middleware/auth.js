'use strict';

/**
 * Authentication middleware — fail-closed session guard (SECURITY-08).
 * Returns 401 for unauthenticated requests to protected routes.
 */
module.exports = function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

/**
 * Permission middleware for route access control
 * 
 * This utility provides role-based and resource-based access control for routes.
 */
const { formatError } = require('./responseFormatter');

/**
 * Check if user has required roles
 * @param {string|string[]} requiredRoles - Role(s) required to access the route
 * @returns {Function} Express middleware function
 */
const requireRoles = (requiredRoles) => {
  return (req, res, next) => {
    // Check if user exists and is authenticated
    if (!req.user) {
      return res.status(401).json(formatError('Authentication required', 401));
    }
    
    // Convert to array if single role
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Get user roles (from JWT, session, or DB lookup)
    const userRoles = req.user.roles || [];
    
    // Check if user has any of the required roles
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json(
        formatError('You do not have permission to perform this action', 403, 'INSUFFICIENT_PERMISSIONS')
      );
    }
    
    next();
  };
};

/**
 * Resource ownership check middleware
 * @param {Function} resourceFetcher - Async function to fetch resource by ID
 * @param {string} paramIdName - Name of the ID parameter in the request
 * @param {boolean} allowAdmin - Whether admins can bypass ownership check
 * @returns {Function} Express middleware function
 */
const requireOwnership = (resourceFetcher, paramIdName = 'id', allowAdmin = true) => {
  return async (req, res, next) => {
    // Check if user exists and is authenticated
    if (!req.user) {
      return res.status(401).json(formatError('Authentication required', 401));
    }
    
    // Admin bypass if allowed
    if (allowAdmin && req.user.roles && req.user.roles.includes('admin')) {
      return next();
    }
    
    try {
      // Get the resource ID from request
      const resourceId = req.params[paramIdName];
      if (!resourceId) {
        return res.status(400).json(formatError(`Missing resource ID parameter: ${paramIdName}`, 400));
      }
      
      // Fetch the resource
      const resource = await resourceFetcher(resourceId);
      
      // Check if resource exists
      if (!resource) {
        return res.status(404).json(formatError('Resource not found', 404));
      }
      
      // Check ownership - different resources may have different owner fields
      const ownerId = resource.userId || resource.ownerId || resource.createdBy;
      
      if (ownerId !== req.user.id) {
        return res.status(403).json(
          formatError('You do not have permission to access this resource', 403, 'NOT_RESOURCE_OWNER')
        );
      }
      
      // Add resource to request for later use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Error in ownership check:', error);
      return res.status(500).json(formatError('Error checking resource ownership', 500));
    }
  };
};

module.exports = {
  requireRoles,
  requireOwnership
};

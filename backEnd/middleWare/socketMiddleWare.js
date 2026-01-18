// backEnd/middleWare/socketMiddleware.js

/**
 * Middleware to make Socket.IO instance available in request handlers
 * Usage: Access via req.io in any controller
 */
export const socketMiddleware = (req, res, next) => {
  req.io = req.app.get('io');
  next();
};

export default socketMiddleware;
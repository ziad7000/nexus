const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ProblemError } = require('./problemDetails');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new ProblemError({
          status: 401,
          title: 'Unauthorized',
          detail: 'Missing or malformed Authorization header. Expected Bearer token.',
          code: 'AUTH_TOKEN_MISSING'
        })
      );
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const foundUser = await User.findById(payload._id).select('-password');
    if (!foundUser) {
      return next(
        new ProblemError({
          status: 401,
          title: 'Unauthorized',
          detail: 'User belonging to this token no longer exists.',
          code: 'USER_NOT_FOUND'
        })
      );
    }

    req.user = foundUser;
    return next();
  } catch (error) {
    return next(error);
  }
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded._id);
  } catch (err) {
    // Continue anonymously if token is invalid
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ProblemError({
          status: 403,
          title: 'Forbidden',
          detail: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`,
          code: 'ACCESS_FORBIDDEN'
        })
      );
    }
    next();
  };
};

module.exports = { protect, authorize, optionalProtect };

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(403, "User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied for role: ${req.user.role}`));
    }

    next();
  };
};

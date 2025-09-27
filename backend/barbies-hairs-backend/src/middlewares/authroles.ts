import { Request, Response, NextFunction } from 'express';
const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: No role asigned',
      });
    }
    const hasPermission = req.user.roles.some((role) => roles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permission',
      });
    }
    next();
  };
};
export default authorizeRoles;

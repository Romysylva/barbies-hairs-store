// import { Request, Response, NextFunction } from 'express';

// const adminOnly = (req: Request, res: Response, next: NextFunction) => {
//   if (
//     req.user &&
//     Array.isArray(req.user.roles) &&
//     req.user.roles.includes('admin')
//   ) {
//     return next();
//   }

//   res.status(403).json({ message: 'Not authorized as admin' });
// };

// export default adminOnly;

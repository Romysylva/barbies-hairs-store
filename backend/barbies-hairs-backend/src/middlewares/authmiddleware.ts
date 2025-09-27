import jwt from 'jsonwebtoken';
import { User } from '../models/userModle.js';
import { Request, Response, NextFunction } from 'express';

interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: string;
}

// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const secret = process.env.JWT_SECRET as string;
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies && req.cookies.token) {
//     token = req.cookies.token;
//   }

//   // console.log('Incoming token:', token);
//   if (!token) {
//     return res.status(400).json({ message: 'No token, authorization denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, secret) as JwtPayloadWithUserId;
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     // Attach user to request object (extend req type if needed)
//     (req as any).user = user;

//     next();
//   } catch (error) {
//     if (error instanceof Error)
//       console.error('Token Verification Error:', error.message);
//     return res.status(401).json({ message: 'Token is not valid' });
//   }
// };

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = process.env.JWT_SECRET as string;
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayloadWithUserId;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Token Verification Error:', (error as Error).message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRoles = req.user.roles || [];
    const hasPermission = roles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

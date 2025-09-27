// import jwt from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';
// import { User } from '../models/userModle.js';

// interface JwtPayloadWithUserId extends jwt.JwtPayload {
//   userId: string;
// }
// const authenticateUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const secret = process.env.JWT_SECRET as string;
//   try {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided',
//       });
//     }
//     const decoded = jwt.verify(token, secret) as JwtPayloadWithUserId;
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'invalid token',
//       });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     if (error instanceof Error) console.error('Authentication error:', error);
//     res.status(401).json({
//       success: false,
//       message: 'Unauthorized',
//     });
//   }
// };
// export default authenticateUser;

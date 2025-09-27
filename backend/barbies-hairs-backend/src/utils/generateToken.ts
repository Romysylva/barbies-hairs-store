// import { error } from 'console';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/userModle.js';
import { Request, Response } from 'express';

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    // expiresIn: "7d"
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '60m',
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
  });
};

// export const createSendToken = (
//   user: IUser,
//   statusCode: number,
//   req: Request,
//   res: Response,
// ) => {
//   const token = generateToken(user._id);
//   const refreshToken = generateRefreshToken(user._id);

//   res.cookie('refreshToken', refreshToken, {
//     expires: new Date(
//       Date.now() +
//         parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || '90') *
//           24 *
//           60 *
//           60 *
//           1000,
//     ),
//     httpOnly: true,
//     secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
//     sameSite: 'lax',
//   });

//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// };

export const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response,
) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
    maxAge:
      parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || '90') *
      24 *
      60 *
      60 *
      1000,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token, // <-- frontend stores this in memory/localStorage
    user,
  });
};

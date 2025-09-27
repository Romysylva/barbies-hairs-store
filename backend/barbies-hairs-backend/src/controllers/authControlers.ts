import jwt from 'jsonwebtoken';
import { logActivity } from '../middlewares/activityLoger.js';
import sendMail from '../services/emailService.js';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModle.js';
import { createSendToken, generateToken } from '../utils/generateToken.js';
import deepNormalize from '../utils/helperFn.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { hostname } from 'os';

interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: string;
}

// export const refreshAccessToken = catchAsync(
//   async (req: Request, res: Response) => {
//     const refreshToken = req.cookies?.refreshToken;

//     if (!refreshToken) {
//       return res
//         .status(401)
//         .json({ message: 'No refresh token, please login' });
//     }

//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.JWT_REFRESH_SECRET as string,
//     ) as JwtPayloadWithUserId;

//     const user = await User.findById(decoded.userId).select('-password');
//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     // issue new access token
//     const newAccessToken = generateToken(user._id);

//     return res.json({
//       status: 'success',
//       token: newAccessToken,
//     });
//   },
// );

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: 'No refresh token, please login' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayloadWithUserId;

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateToken(user._id);

    return res.json({
      success: true,
      token: newAccessToken,
      user,
    });
  } catch (err) {
    if (err instanceof Error) console.error('Refresh error:', err.message);
    return res
      .status(401)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

const notifyUser = async (userEmail: string) => {
  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.error('user not found');
      return;
    }
    const subject = "Welcome to Barbie's Hairs e-Shop!";
    const text = 'Hello.., thank you for registering in our platform';
    const html = `<p>Hello ${user.name}, thank you for registering on our <strong>platform</strong>, shop more and pay less...</p>`;
    await sendMail(userEmail, subject, text, html);
    console.log(`Notification email sent to ${userEmail} successfully.`);
    // console.log(`Notification email sent to ${userEmail} successfully.`);
  } catch (err) {
    console.error('faild to send notification email:', err);
  }
};

export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    location,
    phone,
    preferences,
    roles,
    isAdmin,
  } = req.body;

  if (!name || !email || !password || !passwordConfirm || !location) {
    return res
      .status(400)
      .json({ message: 'All required fields must be filled' });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: 'User with this email already exists' });
  }

  const photo = req.file?.filename ?? 'default.jpg';

  // console.log(req.body);

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    location,
    phone,
    preferences,
    roles,
    isAdmin,
    photo,
  });

  await Promise.all([
    notifyUser(newUser.email),
    logActivity(newUser._id, 'USER_REGISTERED', {
      message: 'New user registered',
    }),
  ]);
  createSendToken(newUser, 201, req, res);
});

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      console.log('req.boddy is not define');
    }
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user) {
      await logActivity(user._id, 'USER_LOGGED_IN', {
        message: 'A user Logged In.',
      });
    }

    createSendToken(user, 200, req, res);
  },
);

export const logoutUser = (req: Request, res: Response) => {
  res
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000),
    })
    .status(200)
    .json({
      success: true,
      message: 'Logged out successfully',
    });
};

export const restricTo = (...role: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'unauthorized' });
    }
    if (!role.includes(req.user.roles)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

// export const getMe = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'User not found' });
//     }
//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     if (error instanceof Error)
//       res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const forgetPassword = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // 1) Get user based on POSTed email

//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return next(
//         new AppError('There is no user with the provided email', 404)
//       );
//     }
//     // 2) Generate the random reset token
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false });

//     try {
//       const resetURL = `${req.protocol}://${req.get(
//         'host'
//       )}/api/barbies/v1/restPassword/${resetToken}`;
//       await new Email(user, resetURL).sendPasswordReset();
//     } catch (err) {
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save({ validateBeforeSave: false });
//       return next(
//         new AppError(
//           'there was an error sending the email. try again later!',
//           500
//         )
//       );
//     }
//   }
// );

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  req.params.id = req.user._id.toString();
  next();
};

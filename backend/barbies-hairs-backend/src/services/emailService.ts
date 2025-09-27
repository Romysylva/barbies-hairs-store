// import nodemailer from 'nodemailer';
// import SMTPTransport from 'nodemailer/lib/smtp-transport';

// import dotenv from 'dotenv';
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: process.env.EMAIL_SECURE === 'true',
//   requireTLS: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// } as SMTPTransport.Options);

// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Transporter error:', error);
//   } else {
//     console.log(
//       'Transporter ready! Server is ready to take your messages.',
//       success
//     );
//   }
// });

// const sendMail = async (
//   to: string,
//   subject: string,
//   text: string,
//   html: string
// ) => {
//   const mailOptions = {
//     from: `"${process.env.MAIL_FROM_NAME || "Barbie's Hairs"}" <${
//       process.env.EMAIL_USER
//     }>`,
//     to,
//     subject,
//     text,
//     html,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully:', info.response);
//     return info;
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error('Error sending email:', err.message);
//     } else {
//       console.error('Unknown error sending email:', err);
//       throw new Error('Failed to send email');
//     }
//     throw err;
//   }
// };

// export default sendMail;

import nodemailer, { TransportOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
} as TransportOptions);

transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter error:', error);
  } else {
    console.log(
      'Transporter ready! Server is ready to take your messages.',
      success
    );
  }
});

const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "Barbie's Hairs"}" <${
      process.env.EMAIL_USER
    }>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error sending email:', err.message);
    } else {
      console.error('Unknown error sending email:', err);
      throw new Error('Failed to send email');
    }
    throw err;
  }
};

export default sendMail;

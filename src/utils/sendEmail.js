import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `PublicCare <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
};
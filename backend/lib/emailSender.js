import mailjet from 'node-mailjet';
import dotenv from 'dotenv';

dotenv.config();

const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export const sendOTPEmail = async (email, otp) => {
  try {
    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: "krish.seriously@gmail.com",
              Name: "VedShare"
            },
            To: [
              {
                Email: email
              }
            ],
            Subject: "Your OTP for VedShare",
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">VedShare Verification</h2>
                <p>Your one-time password (OTP) is:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #1e40af;">${otp}</div>
                <p>This OTP is valid for 10 minutes.</p>
                <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
              </div>
            `
          }
        ]
      });
    
    return await request;
  } catch (err) {
    console.error('Email sending error:', err);
    throw new Error('Failed to send OTP email');
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          From: { Email: "krish.seriously@gmail.com", Name: "VedShare" },
          To: [{ Email: email }],
          Subject: "Password Reset Request",
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Password Reset</h2>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" 
                 style="background: #2563eb; color: white; padding: 10px 15px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                Reset Password
              </a>
              <p><small>This link expires in 1 hour. If you didn't request this, please ignore this email.</small></p>
            </div>
          `
        }]
      });
    
    return await request;
  } catch (err) {
    console.error('Password reset email error:', err);
    throw new Error('Failed to send password reset email');
  }
};
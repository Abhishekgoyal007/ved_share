import mailjet from 'node-mailjet';
import dotenv from 'dotenv';

dotenv.config();

const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const FROM_EMAIL = "krish.seriously@gmail.com";
const FROM_NAME = "VedShare";

export const sendOTPEmail = async (email, otp) => {
  try {
    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: FROM_EMAIL,
              Name: FROM_NAME
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
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
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

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  try {
    const { orderId, items, total, buyerName } = orderDetails;

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
      </tr>
    `).join('');

    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: email }],
          Subject: `Order Confirmed - ${orderId}`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
              <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">📚 VedShare</h1>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937;">Order Confirmed! 🎉</h2>
                <p>Hi ${buyerName || 'there'},</p>
                <p>Thank you for your purchase! Your order has been confirmed.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Order ID:</strong> ${orderId}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 10px; text-align: left;">Item</th>
                      <th style="padding: 10px; text-align: center;">Qty</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr style="background: #06b6d4; color: white;">
                      <td style="padding: 10px;" colspan="2"><strong>Total</strong></td>
                      <td style="padding: 10px; text-align: right;"><strong>₹${total}</strong></td>
                    </tr>
                  </tfoot>
                </table>
                
                <p>You can access your purchased items from your <a href="${process.env.CLIENT_URL}/dashboard" style="color: #06b6d4;">Dashboard</a>.</p>
                
                <p style="color: #6b7280; font-size: 14px;">Happy Learning! 📖</p>
              </div>
            </div>
          `
        }]
      });

    return await request;
  } catch (err) {
    console.error('Order confirmation email error:', err);
    // Don't throw - order emails are not critical
  }
};

// Send swap offer notification email
export const sendSwapOfferNotificationEmail = async (email, offerDetails) => {
  try {
    const { productName, offererName, offeredProductName, productUrl } = offerDetails;

    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: email }],
          Subject: `New Swap Offer for "${productName}"`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🔄 VedShare Swap</h1>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937;">New Swap Offer! 📚</h2>
                <p>You have received a new swap offer for your product.</p>
                
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 0 0 10px 0;"><strong>Your Product:</strong> ${productName}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Offered by:</strong> ${offererName}</p>
                  <p style="margin: 0;"><strong>Offering:</strong> ${offeredProductName}</p>
                </div>
                
                <a href="${productUrl || process.env.CLIENT_URL + '/dashboard'}" 
                   style="background: #10b981; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px 0;">
                  View Offer
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  Log in to your dashboard to accept or decline this offer.
                </p>
              </div>
            </div>
          `
        }]
      });

    return await request;
  } catch (err) {
    console.error('Swap offer notification email error:', err);
    // Don't throw - notification emails are not critical
  }
};

// Send swap offer accepted notification
export const sendSwapOfferAcceptedEmail = async (email, offerDetails) => {
  try {
    const { productName, ownerName, acceptedProductName } = offerDetails;

    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: email }],
          Subject: `Swap Offer Accepted! 🎉`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">✅ Swap Accepted!</h1>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937;">Great News! 🎉</h2>
                <p>Your swap offer has been accepted!</p>
                
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 0 0 10px 0;"><strong>You offered:</strong> ${acceptedProductName}</p>
                  <p style="margin: 0 0 10px 0;"><strong>You'll receive:</strong> ${productName}</p>
                  <p style="margin: 0;"><strong>From:</strong> ${ownerName}</p>
                </div>
                
                <p>Check your dashboard to coordinate the exchange with the other user.</p>
                
                <a href="${process.env.CLIENT_URL}/dashboard" 
                   style="background: #06b6d4; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px 0;">
                  Go to Dashboard
                </a>
              </div>
            </div>
          `
        }]
      });

    return await request;
  } catch (err) {
    console.error('Swap accepted email error:', err);
  }
};

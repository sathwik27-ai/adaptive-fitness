const nodemailer = require('nodemailer');

let transporter = null;

// Only create transporter if Gmail credentials are configured
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD &&
    process.env.GMAIL_USER !== 'your-gmail@gmail.com') {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

const sendWelcomeEmail = async (to, name) => {
    if (!transporter) {
        console.log(`[Email stub] Welcome email would be sent to: ${to}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `"Adaptive Fitness Companion" <${process.env.GMAIL_USER}>`,
            to,
            subject: 'Welcome to Adaptive Fitness Companion! 🌿',
            html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F4EFE6; border-radius: 16px;">
          <h1 style="color: #2F5D3A; font-size: 28px;">Welcome, ${name}! 🎉</h1>
          <p style="color: #1E1E1E; font-size: 16px;">Your personalized fitness journey starts now. Complete your onboarding to get your first workout and meal plan crafted just for you.</p>
          <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #1B1410; color: #fff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 16px; margin-top: 16px;">Get Started →</a>
          <p style="color: #9E9587; font-size: 12px; margin-top: 32px;">Adaptive Fitness Companion · Personalized wellness, earthy vibes</p>
        </div>
      `,
        });
        console.log(`Welcome email sent to ${to}`);
    } catch (err) {
        console.error('Email send error:', err.message);
    }
};

module.exports = { sendWelcomeEmail };

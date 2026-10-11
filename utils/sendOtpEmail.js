const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

async function sendOtpEmail(email, otp) {
  console.log("Attempting OTP delivery");

  const info = await transporter.sendMail({
    from: process.env.BREVO_FROM_EMAIL,
    to: email,
    subject: "Your registration OTP",
    text: `Your verification OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
  });
  // console.log("Accepted recipients:", info.accepted);
  // console.log("Rejected recipients:", info.rejected);
  // console.log("Response:", info.response);

  // console.log("SMTP accepted message:", info.messageId);
  // console.log("SMTP response:", info.response);

  return info;
}

module.exports = sendOtpEmail;

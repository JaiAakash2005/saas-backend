// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.BREVO_SMTP_USER,
//     pass: process.env.BREVO_SMTP_KEY,
//   },
// });

// async function sendOtpEmail(email, otp) {
//   console.log("Attempting OTP delivery");

//   const info = await transporter.sendMail({
//     from: process.env.BREVO_FROM_EMAIL,
//     to: email,
//     subject: "Your registration OTP",
//     text: `Your verification OTP is ${otp}. It expires in 5 minutes.`,
//     html: `
//       <h2>Email Verification</h2>
//       <p>Your verification code is:</p>
//       <h1>${otp}</h1>
//       <p>This code expires in 5 minutes.</p>
//     `,
//   });
//   // console.log("Accepted recipients:", info.accepted);
//   // console.log("Rejected recipients:", info.rejected);
//   // console.log("Response:", info.response);

//   // console.log("SMTP accepted message:", info.messageId);
//   // console.log("SMTP response:", info.response);

//   return info;
// }

// module.exports = sendOtpEmail;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

async function sendOtpEmail(email, otp) {
  if (
    !process.env.BREVO_SMTP_USER ||
    !process.env.BREVO_SMTP_KEY ||
    !process.env.BREVO_FROM_EMAIL
  ) {
    throw new Error("Brevo SMTP environment variables are missing");
  }

  console.log("Attempting OTP email submission");

  try {
    const info = await transporter.sendMail({
      from: process.env.BREVO_FROM_EMAIL,
      to: email,
      subject: "Your TemplateHub verification code",
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
      html: `
        <h2>TemplateHub Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      `,
    });

    console.log("Brevo SMTP submission result:", {
      messageId: info.messageId,
      acceptedCount: info.accepted?.length ?? 0,
      rejectedCount: info.rejected?.length ?? 0,
      response: info.response,
    });

    if (!info.accepted?.length) {
      throw new Error("SMTP server did not accept the recipient");
    }

    return info;
  } catch (error) {
    console.error("Brevo SMTP submission failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
    });

    throw error;
  }
}

module.exports = sendOtpEmail;

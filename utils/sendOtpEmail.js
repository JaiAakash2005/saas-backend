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

async function sendOtpEmail(email, otp) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_FROM_EMAIL;

  if (!apiKey || !senderEmail) {
    throw new Error(
      "Missing BREVO_API_KEY or BREVO_FROM_EMAIL environment variable",
    );
  }

  const payload = {
    sender: {
      name: "TemplateHub",
      email: senderEmail,
    },
    to: [{ email }],
    subject: "Your TemplateHub verification code",
    textContent: `Your verification code is ${otp}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; color: #222;">
          <h2>TemplateHub Email Verification</h2>
          <p>Use the following code to verify your email address:</p>
          <h1 style="letter-spacing: 6px;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
          <p>If you did not request this code, you can ignore this email.</p>
        </body>
      </html>
    `,
    tags: ["templatehub-otp"],
  };

  console.log("Submitting OTP email through Brevo API");

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();

    let result;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {};
    }

    if (!response.ok) {
      console.error("Brevo API request failed:", {
        status: response.status,
        message:
          result.message ||
          result.code ||
          "Brevo returned an unsuccessful response",
      });

      throw new Error(`Brevo API returned HTTP ${response.status}`);
    }

    if (!result.messageId) {
      console.error("Brevo API returned no message ID");
      throw new Error("Brevo did not return a message ID");
    }

    console.log("Brevo accepted OTP email request:", {
      messageId: result.messageId,
    });

    return result;
  } catch (error) {
    console.error("Brevo API email submission failed:", {
      name: error.name,
      message: error.message,
    });

    throw error;
  }
}

module.exports = sendOtpEmail;

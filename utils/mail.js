import nodemailer from "nodemailer"

async function sendMail(to, otp, ttlMinutes = 10) {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: 'pinkie.marks@ethereal.email',
      pass: 'fpsuq934ftBs3pa7jC'
    },
  });

  let info = await transporter.sendMail({
    from: '"AUTH" <pinkie.marks@ethereal.email>',
    to: to,
    subject: "Your password reset code!",
    text: `Here is your password reset code: ${otp}\n Use this code to reset your password. It expires in ${ttlMinutes} minutes.`, // plain‑text body
    html: `<div style="font-family: Arial, sans-serif; line-height:1.4">
      <h2 style="margin-bottom:0.2em">Password reset code</h2>
      <p style="margin-top:0.2em">Use this code to reset your password. It expires in ${ttlMinutes} minutes.</p>
      <div style="font-size:28px; font-weight:700; letter-spacing:6px; margin:18px 0; background:#f4f4f4; padding:12px 18px; display:inline-block;">
        ${otp}
      </div>
      <p style="color:#666; font-size:13px;">If you didn't request this, ignore this email.</p>
    </div>`,
  });

  console.log("Message sent:", info.messageId);
  return info;
};

export default sendMail;
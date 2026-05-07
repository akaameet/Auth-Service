import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER!,
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email server connection failed:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `Auth Service <${process.env.GOOGLE_USER!}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`📧 Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);

    throw new Error("Unable to send email");
  }
}

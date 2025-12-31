import nodemailer from "nodemailer";
import { Resend } from "resend";

const EMAIL = process.env.EMAIL;
const PASS = process.env.EMAIL_PASS_KEY;

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL,
    pass: PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});


const resendKey = process.env.RESEND_API_KEY;
export const resend = resendKey ? new Resend(resendKey) : {
  emails: {
    send: async () => ({ data: { id: 'mock-id' }, error: null })
  }
};


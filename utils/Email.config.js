import nodemailer from "nodemailer"
import { Email, pass } from "./consts.js";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: Email,
    pass: pass,
  },
});
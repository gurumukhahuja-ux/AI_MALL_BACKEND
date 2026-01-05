import { Verification_Email_Template, Welcome_Email_Template, Reset_Password_Email_Template } from "./EmailTemplate.js";
import { resend, transporter } from "./Email.config.js";
import { marketPlace } from "../consts.js";
//  console.log(transporter);

export const sendVerificationEmail = async (email, name, verificationCode) => {
  try {
    const response = await resend.emails.send({
      from: `AI-MALL <${process.env.EMAIL}>`,
      to: [email],
      subject: "Verify Your Email",
      html: Verification_Email_Template.replace("{name}", name).replace("{verificationCode}", verificationCode)
    })
    console.log("resend_msg", response);

  } catch (error) {
    console.log('Email error', error)
  }
}

// WELCOME EMAIL
export const welcomeEmail = async (name, email) => {
  const info = await resend.emails.send({
    from: `AI-MALL <${process.env.EMAIL}>`,
    to: [email],
    subject: `Welcome ${name}`,
    html: Welcome_Email_Template.replace("{name}", name).replace("{dashboardUrl}", marketPlace),
  });

};

export const sendResetPasswordEmail = async (email, name, resetUrl) => {
  try {
    const response = await resend.emails.send({
      from: `AI-MALL <${process.env.EMAIL}>`,
      to: [email],
      subject: "Reset Your Password",
      html: Reset_Password_Email_Template.replace("{name}", name).replace("{resetUrl}", resetUrl)
    })
    console.log("resend_msg", response);
  } catch (error) {
    console.log('Email error', error)
  }
}


export const sendContactAdminEmail = async (adminEmail, vendorName, vendorEmail, subject, message) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">New Admin Support Inquiry</h2>
        <p><strong>From:</strong> ${vendorName} (${vendorEmail})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This message was sent from the Vendor Dashboard.</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: `AI-MALL System <${process.env.EMAIL}>`,
      to: [adminEmail],
      reply_to: vendorEmail,
      subject: `[Vendor Support] ${subject}`,
      html: htmlContent
    });
    console.log("Admin contact email sent:", response);
  } catch (error) {
    console.log('Admin contact email error:', error);
  }
}


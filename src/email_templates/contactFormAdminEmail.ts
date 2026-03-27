// import { createMasterEmailLayout } from './masterLayout';

// interface ContactFormData {
//     name: string;
//     email: string;
//     subject: string;
//     message: string;
// }

// export const createContactFormAdminEmail = (data: ContactFormData) => {
//   const { name, email, subject, message } = data;

//   const bodyHtml = `
//     <p style="margin: 0 0 20px;" class="dark-text">You have a new message from the website contact form. Please respond as soon as possible.</p>

//     <h3 style="color: #1F2937; margin-top: 30px; margin-bottom: 10px;" class="dark-text">Submission Details</h3>
//     <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; padding: 20px;" class="dark-card dark-border">
//       <tr>
//         <td style="padding: 8px; font-weight: bold; width: 100px; color: #4B5563;" class="dark-text">Name:</td>
//         <td style="padding: 8px; color: #1F2937;" class="dark-text">${name}</td>
//       </tr>
//       <tr>
//         <td style="padding: 8px; font-weight: bold; width: 100px; color: #4B5563;" class="dark-text">Email:</td>
//         <td style="padding: 8px;"><a href="mailto:${email}" style="color: #F97316; text-decoration: none;">${email}</a></td>
//       </tr>
//       <tr>
//         <td style="padding: 8px; font-weight: bold; width: 100px; color: #4B5563;" class="dark-text">Subject:</td>
//         <td style="padding: 8px; color: #1F2937;" class="dark-text">${subject}</td>
//       </tr>
//     </table>

//     <h3 style="color: #1F2937; margin-top: 30px; margin-bottom: 10px;" class="dark-text">Message Content</h3>
//     <div style="background-color: #F9FAFB; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; color: #4B5563;" class="dark-card dark-border dark-text">
//         <p style="margin: 0;">${message.replace(/\n/g, "<br>")}</p>
//     </div>
//   `;

//   return createMasterEmailLayout({
//     preheaderText: `New message from ${name} about "${subject}"`,
//     headerText: 'New Contact Form Message',
//     bodyHtml,
//   });
// };
// /src/email_templates/contactFormAdminEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * 📨 CONTACT FORM ADMIN NOTIFICATION
 * Intercepts customer inquiries and alerts the admin team.
 * Designed for maximum readability and quick response.
 */
export const createContactFormAdminEmail = (data: ContactFormData): string => {
  const { name, email, subject, message } = data;

  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #1F2937;"><strong>System Alert: New Inquiry Intercepted</strong></p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            A new message has been submitted via the PocketValue Contact Form. Please review the details below.
        </p>
    </div>
    
    <!-- 📋 SUBMISSION INTELLIGENCE -->
    <div style="background-color: #F9FAFB; padding: 25px; border-radius: 16px; border: 1px solid #E5E7EB; margin-bottom: 30px;">
        <h3 style="color: #1F2937; margin: 0 0 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px;">Lead Information:</h3>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; width: 30%;">Sender Name:</td>
            <td style="padding: 8px 0; font-weight: 900; color: #1F2937;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Email Address:</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #F97316; font-weight: 900; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Topic/Subject:</td>
            <td style="padding: 8px 0; font-weight: 900; color: #1F2937;">${subject}</td>
          </tr>
        </table>
    </div>

    <!-- 💬 MESSAGE CONTENT -->
    <div style="margin-bottom: 30px;">
        <h3 style="color: #1F2937; margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Message Body:</h3>
        <div style="background-color: #ffffff; border: 1px solid #E5E7EB; padding: 25px; border-radius: 16px; color: #4B5563; line-height: 1.8; font-size: 15px; font-style: italic; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
            &quot;${message.replace(/\n/g, "<br>")}&quot;
        </div>
    </div>

    <!-- 🚀 QUICK ACTION BUTTON -->
    <div style="text-align: center; margin-top: 35px;">
        <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background-color: #1F2937; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            Reply Directly via Email
        </a>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #F3F4F6; text-align: center;">
        <p style="font-size: 10px; color: #D1D5DB; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
            PocketValue Communications Sentinel • Live Update
        </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: `Action Required: New inquiry from ${name} regarding "${subject}"`,
    headerText: "Contact Form Alert",
    bodyHtml,
  });
};

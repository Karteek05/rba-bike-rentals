import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP credentials not fully configured. Emails will only be logged.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || "noreply@rbabikerentals.com";

  if (!transporter) {
    console.log("========== EMAIL MOCK ==========");
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (Text): \n${text}`);
    if (html) console.log(`Body (HTML): \n${html}`);
    console.log("================================");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  const text = `Hi there,\n\nYou requested a password reset. Please click the link below to set a new password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nRBA Bike Rentals Team`;
  const html = `<p>Hi there,</p><p>You requested a password reset. Please click the link below to set a new password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br>RBA Bike Rentals Team</p>`;

  await sendEmail({
    to: email,
    subject: "Reset your RBA Bike Rentals Password",
    text,
    html,
  });
}

export async function sendBookingConfirmationEmail(email: string, bookingDetails: any) {
  // Extracting basic info from booking object
  const pickupTime = new Date(bookingDetails.pickup_at).toLocaleString();
  const dropTime = new Date(bookingDetails.drop_at).toLocaleString();
  const status = bookingDetails.status;
  
  const text = `Hi there,\n\nYour booking (ID: ${bookingDetails.id}) has been created!\n\nStatus: ${status}\nPickup Time: ${pickupTime}\nDrop-off Time: ${dropTime}\n\nWe will update you once your booking is fully confirmed.\n\nThanks,\nRBA Bike Rentals Team`;
  const html = `<p>Hi there,</p><p>Your booking (ID: <strong>${bookingDetails.id}</strong>) has been created!</p><ul><li><strong>Status:</strong> ${status}</li><li><strong>Pickup Time:</strong> ${pickupTime}</li><li><strong>Drop-off Time:</strong> ${dropTime}</li></ul><p>We will update you once your booking is fully confirmed.</p><p>Thanks,<br>RBA Bike Rentals Team</p>`;

  await sendEmail({
    to: email,
    subject: `Booking Confirmation - ${bookingDetails.id}`,
    text,
    html,
  });
}

export async function sendBookingApprovedEmail(email: string, bookingDetails: any, paymentLink: string) {
  const text = `Hi there,\n\nGreat news! Your booking request (ID: ${bookingDetails.id}) has been approved.\n\nTo confirm your booking, please complete the payment using the following secure link powered by Razorpay:\n\n${paymentLink}\n\nThanks,\nRBA Bike Rentals Team`;
  const html = `<p>Hi there,</p><p>Great news! Your booking request (ID: <strong>${bookingDetails.id}</strong>) has been <strong>approved</strong>.</p><p>To confirm your booking, please complete the payment using the following secure link powered by Razorpay:</p><p><a href="${paymentLink}" style="display:inline-block;padding:10px 20px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Pay Now with Razorpay</a></p><p>Alternatively, copy this link: <br> <a href="${paymentLink}">${paymentLink}</a></p><p>Thanks,<br>RBA Bike Rentals Team</p>`;

  await sendEmail({
    to: email,
    subject: `Booking Approved - Action Required - ${bookingDetails.id}`,
    text,
    html,
  });
}

export async function sendBookingRejectedEmail(email: string, bookingDetails: any) {
  const text = `Hi there,\n\nWe regret to inform you that your booking request (ID: ${bookingDetails.id}) could not be approved at this time.\n\nUnfortunately, the KYC process or credentials did not check out. You are welcome to try again later or contact support if you believe this is a mistake.\n\nThanks,\nRBA Bike Rentals Team`;
  const html = `<p>Hi there,</p><p>We regret to inform you that your booking request (ID: <strong>${bookingDetails.id}</strong>) could not be approved at this time.</p><p>Unfortunately, the KYC process or credentials did not check out. You are welcome to try again later or contact support if you believe this is a mistake.</p><p>Thanks,<br>RBA Bike Rentals Team</p>`;

  await sendEmail({
    to: email,
    subject: `Booking Update - ${bookingDetails.id}`,
    text,
    html,
  });
}

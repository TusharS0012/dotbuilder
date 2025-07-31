// src/app/api/send-email/route.js
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail"; // Import the SendGrid library

// Set the SendGrid API Key directly here using the environment variable
// This should be done once globally or at the top level of your API route file.
sgMail.setApiKey(process.env.SEND_GRID_API_KEY); // Make sure the env variable name is correct!

export async function POST(req) {
  try {
    const { email, code } = await req.json(); // Get recipient email and verification code

    // Define the email message object directly using SendGrid's format
    const msg = {
      to: email, // Recipient email from the request
      from: process.env.EMAIL_USER, // Your verified sender email (from environment variables)
      subject: "DotBuilder - Email Verification Code",
      text: `Your verification code for DotBuilder is: ${code}. This code is valid for 10 minutes.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hello, Coder!</h2>
              <p>Your verification code for DotBuilder is:</p>
              <h3 style="color: green;">${code}</h3>
              <p>Please enter this code on the website to verify your email.</p>
              <p>Thank you for signing up for DotBuilder!</p>
              <p style="font-size: 12px; color: gray;">
                DotBuilder | Your Company Address (Optional) | <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a>
              </p>
              <p style="font-size: 12px; color: gray;">If you didn’t request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };

    // Send the email using SendGrid's send method
    await sgMail.send(msg);

    // If no error, assume success
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully!",
    });
  } catch (error) {
    console.error("Error sending verification email via SendGrid:", error);

    // Provide more specific error details if available from SendGrid
    if (error.response) {
      console.error("SendGrid Response Body:", error.response.body);
      return NextResponse.json(
        {
          success: false,
          message: `Email sending failed: ${
            error.response.body.errors
              ? error.response.body.errors.map((e) => e.message).join(", ")
              : "Unknown SendGrid error"
          }`,
          details: error.response.body, // Include full details for debugging
        },
        { status: 500 }
      );
    } else {
      // Generic error for other issues
      return NextResponse.json(
        { success: false, message: error.message || "Failed to send email." },
        { status: 500 }
      );
    }
  }
}

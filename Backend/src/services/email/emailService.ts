import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Log email configuration for debugging
console.log('Email Configuration:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER ? '✓ Set' : '✗ Not set',
  pass: process.env.EMAIL_PASS ? '✓ Set' : '✗ Not set'
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Handle expired certificate issue
  tls: {
    // Do not fail on invalid certificates - ONLY FOR DEVELOPMENT
    rejectUnauthorized: false
  },
  // Debug settings
  debug: true,
  logger: true
});

// Alternative Gmail transporter - uncomment and set environment variables if needed
/*
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // App password, not regular password
  }
});
*/

/**
 * Send an email verification message to a user
 * @param to Recipient email address
 * @param token Verification token
 * @param frontendUrl Frontend URL for constructing verification link
 */
export const sendVerificationEmail = async (
  to: string,
  token: string,
  frontendUrl: string
): Promise<boolean> => {
  try {
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"BrainTime" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify Your BrainTime Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Welcome to BrainTime!</h2>
          <p>Thank you for signing up. Please verify your email address to activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} BrainTime. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send a password reset email to a user
 * @param to Recipient email address
 * @param token Password reset token
 * @param frontendUrl Frontend URL for constructing reset link
 */
export const sendPasswordResetEmail = async (
  to: string,
  token: string,
  frontendUrl: string
): Promise<boolean> => {
  try {
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const mailOptions = {
      from: `"BrainTime" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Reset Your BrainTime Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Password Reset Request</h2>
          <p>You requested a password reset for your BrainTime account.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This reset link will expire in 1 hour.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} BrainTime. All rights reserved.</p>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Verify the email transporter connection
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

/**
 * For development/testing: create a test account on Ethereal
 * This can be used if you don't have access to a real mail server
 */
export const createTestAccount = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Created Ethereal test account:');
    console.log('- USERNAME:', testAccount.user);
    console.log('- PASSWORD:', testAccount.pass);
    console.log('- HOST:', testAccount.smtp.host);
    console.log('- PORT:', testAccount.smtp.port);
    
    // Create reusable transporter using the test account
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    return testTransporter;
  } catch (error) {
    console.error('Failed to create test account:', error);
    return null;
  }
};

/**
 * Send a verification email using Ethereal for testing
 * This creates a temporary Ethereal account and sends a test email
 * Returns a preview URL where you can view the sent email
 */
export const sendEtherealVerificationEmail = async (
  to: string,
  token: string,
  frontendUrl: string
): Promise<{ success: boolean; previewUrl?: string }> => {
  try {
    // Create test account
    const testAccount = await nodemailer.createTestAccount();
    
    // Create test transporter
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    // Create verification link and email content
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
    
    // Send mail with the same template as the real one
    const info = await testTransporter.sendMail({
      from: '"BrainTime" <test@braintime.com>',
      to,
      subject: 'Verify Your BrainTime Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Welcome to BrainTime!</h2>
          <p>Thank you for signing up. Please verify your email address to activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} BrainTime. All rights reserved.</p>
        </div>
      `,
    });
    
    // Get the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log('Ethereal email sent:', info.messageId);
    console.log('Preview URL:', previewUrl);
    
    // Fix the type error by ensuring previewUrl is a string
    return { 
      success: true, 
      previewUrl: previewUrl ? previewUrl.toString() : undefined 
    };
  } catch (error) {
    console.error('Error sending Ethereal verification email:', error);
    return { success: false };
  }
};

/**
 * Send exam completion notification to the quiz host
 * @param hostEmail Host/creator email address
 * @param studentName Student name who completed the exam
 * @param studentEmail Student email address
 * @param quizTitle Quiz title
 * @param completedAt Time when exam was completed
 * @param frontendUrl Frontend URL for viewing submissions
 * @param quizId Quiz ID for direct link
 */
export const sendExamCompletionNotification = async (
  hostEmail: string,
  studentName: string,
  studentEmail: string,
  quizTitle: string,
  completedAt: Date,
  frontendUrl: string,
  quizId: string
): Promise<boolean> => {
  try {
    const submissionsLink = `${frontendUrl}/creator/quiz/${quizId}/submissions`;
    const formattedDate = completedAt.toLocaleString();
    
    const mailOptions = {
      from: `"BrainTime" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `New Exam Submission: ${quizTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">New Exam Submission Received</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Quiz:</strong> ${quizTitle}</p>
            <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
            <p><strong>Completed at:</strong> ${formattedDate}</p>
          </div>
          <p>A student has just completed your exam. You can view their submission and grade it using the link below:</p>
          <div style="margin: 30px 0;">
            <a href="${submissionsLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Submissions
            </a>
          </div>
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${submissionsLink}">${submissionsLink}</a></p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} BrainTime. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Exam completion notification sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending exam completion notification:', error);
    return false;
  }
};

/**
 * Send exam results to the student
 * @param studentEmail Student email address
 * @param studentName Student name
 * @param quizTitle Quiz title
 * @param score Score achieved
 * @param maxScore Maximum possible score
 * @param feedback Optional feedback from instructor
 * @param frontendUrl Frontend URL
 * @param quizId Quiz ID for reference
 */
export const sendExamResults = async (
  studentEmail: string,
  studentName: string,
  quizTitle: string,
  score: number,
  maxScore: number,
  feedback?: string,
  frontendUrl?: string,
  quizId?: string
): Promise<boolean> => {
  try {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const resultLink = frontendUrl && quizId ? `${frontendUrl}/student/results/${quizId}` : null;
    
    const mailOptions = {
      from: `"BrainTime" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `Your Results: ${quizTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Your Exam Results</h2>
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #2c5aa0;">${quizTitle}</h3>
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Score:</strong> ${score} / ${maxScore} (${percentage}%)</p>
            ${feedback ? `<p><strong>Instructor Feedback:</strong></p><p style="background-color: white; padding: 10px; border-radius: 4px; font-style: italic;">${feedback}</p>` : ''}
          </div>
          ${resultLink ? `
            <div style="margin: 30px 0;">
              <a href="${resultLink}" 
                 style="background-color: #2196F3; color: white; padding: 12px 20px; 
                        text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Detailed Results
              </a>
            </div>
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resultLink}">${resultLink}</a></p>
          ` : ''}
          <p>Thank you for taking the exam. If you have any questions about your results, please contact your instructor.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} BrainTime. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Exam results sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending exam results:', error);
    return false;
  }
};

/**
 * Email service configuration utilities
 * Centralizes email sending logic for different providers and purposes
 */

import nodemailer from 'nodemailer'
import { getEnv } from '../env-validation'

export interface EmailConfig {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface EmailTemplate {
  customerName?: string
  orderDetails?: any
  verificationLink?: string
  resetLink?: string
  message?: string
  [key: string]: any
}

/**
 * Get email transporter based on available configuration
 * Prioritizes Gmail, falls back to Resend
 */
export function getEmailTransporter() {
  const env = getEnv()
  
  // Try Gmail first (your preferred method)
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
      debug: process.env.NODE_ENV === 'development',
    })
  }
  
  // Fallback to Resend if available
  if (env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: env.RESEND_API_KEY,
      },
    })
  }
  
  throw new Error('No email configuration found. Please set up Gmail or Resend.')
}

/**
 * Get the from email address based on available configuration
 */
export function getFromEmail(): string {
  const env = getEnv()
  
  if (env.GMAIL_USER) {
    return `"CozyCatKitchen" <${env.GMAIL_USER}>`
  }
  
  if (env.RESEND_API_KEY) {
    return `"CozyCatKitchen" <noreply@cozycatkitchen.com>`
  }
  
  throw new Error('No email configuration found')
}

/**
 * Send email using configured transporter
 */
export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getEmailTransporter()
    const fromEmail = config.from || getFromEmail()
    
    const mailOptions = {
      from: fromEmail,
      to: Array.isArray(config.to) ? config.to : [config.to],
      subject: config.subject,
      html: config.html,
      replyTo: config.replyTo || fromEmail,
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('To:', config.to)
    console.log('Subject:', config.subject)
    
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Generate email templates for different purposes
 */
export const emailTemplates = {
  /**
   * Account verification email template
   */
  accountVerification: (data: EmailTemplate) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - CozyCatKitchen</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background-color: #ff6b35;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
        }
        .customer-name {
          font-weight: bold;
          color: #ff6b35;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍽 CozyCatKitchen</div>
          <p>Welcome to our family!</p>
        </div>
        
        <h2>Verify Your Email Address</h2>
        <p>Dear <span class="customer-name">${data.customerName || 'Cat Parent'}</span>,</p>
        <p>Thank you for signing up with CozyCatKitchen! To complete your registration and start shopping for premium cat food, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${data.verificationLink}" class="button">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${data.verificationLink}</p>
        
        <p><strong>Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
        
        <div class="footer">
          <p>If you didn't create an account with CozyCatKitchen, please ignore this email.</p>
          <p>© 2024 CozyCatKitchen. All rights reserved.</p>
          <p>Premium nutrition for happy, healthy cats 🐱</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Password reset email template
   */
  passwordReset: (data: EmailTemplate) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - CozyCatKitchen</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background-color: #ff6b35;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
        }
        .customer-name {
          font-weight: bold;
          color: #ff6b35;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍽 CozyCatKitchen</div>
          <p>Security Alert</p>
        </div>
        
        <h2>Reset Your Password</h2>
        <p>Dear <span class="customer-name">${data.customerName || 'Cat Parent'}</span>,</p>
        <p>We received a request to reset your password for your CozyCatKitchen account. If you made this request, please click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${data.resetLink}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${data.resetLink}</p>
        
        <div class="warning">
          <p><strong>⚠️ Security Notice:</strong></p>
          <ul>
            <li>This password reset link will expire in 1 hour for security reasons</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>If you have any concerns about your account security, please contact our support team immediately.</p>
          <p>© 2024 CozyCatKitchen. All rights reserved.</p>
          <p>Keeping your account safe and your cats happy 🐱</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Order confirmation email template
   */
  orderConfirmation: (data: EmailTemplate) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - CozyCatKitchen</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 10px;
        }
        .order-summary {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
        }
        .customer-name {
          font-weight: bold;
          color: #ff6b35;
        }
        .order-id {
          background-color: #ff6b35;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍽 CozyCatKitchen</div>
          <p>Thank you for your order!</p>
        </div>
        
        <h2>Order Confirmation</h2>
        <p>Dear <span class="customer-name">${data.customerName || 'Cat Parent'}</span>,</p>
        <p>Great news! Your order has been confirmed and your cat is one step closer to delicious, nutritious meals. Here are your order details:</p>
        
        <div class="order-summary">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> <span class="order-id">${data.orderDetails?.orderId || 'N/A'}</span></p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${data.orderDetails?.paymentMethod || 'Online Payment'}</p>
          <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
        </div>
        
        <h3>What's Next?</h3>
        <ol>
          <li>You'll receive a shipping confirmation email once your order is dispatched</li>
          <li>You can track your order status in your account dashboard</li>
          <li>Our team will carefully prepare your cat's meals with love and care</li>
        </ol>
        
        <div class="footer">
          <p>Thank you for choosing CozyCatKitchen for your feline family member!</p>
          <p>© 2024 CozyCatKitchen. All rights reserved.</p>
          <p>Premium nutrition for happy, healthy cats 🐱</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Custom email template (for admin communications)
   */
  customMessage: (data: EmailTemplate) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject || 'Message from CozyCatKitchen'}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 10px;
        }
        .content {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
        }
        .customer-name {
          font-weight: bold;
          color: #ff6b35;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍽 CozyCatKitchen</div>
          <p>Admin Communication</p>
        </div>
        
        <div class="content">
          <h2>${data.subject || 'Message from CozyCatKitchen'}</h2>
          <p>Dear <span class="customer-name">${data.customerName || 'Valued Customer'}</span>,</p>
          <div style="white-space: pre-wrap; font-family: inherit;">${data.message || ''}</div>
        </div>
        
        <div class="footer">
          <p>This email was sent from CozyCatKitchen Admin Panel</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>© 2024 CozyCatKitchen. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
}

/**
 * Send account verification email
 */
export async function sendVerificationEmail(to: string, customerName?: string, verificationLink?: string) {
  const siteUrl = getEnv().SITE_URL
  const finalVerificationLink = verificationLink || `${siteUrl}/auth/verify`
  
  return sendEmail({
    to,
    subject: 'Verify Your Email Address - CozyCatKitchen',
    html: emailTemplates.accountVerification({
      customerName,
      verificationLink: finalVerificationLink,
    }),
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, customerName?: string, resetLink?: string) {
  const siteUrl = getEnv().SITE_URL
  const finalResetLink = resetLink || `${siteUrl}/auth/reset-password`
  
  return sendEmail({
    to,
    subject: 'Reset Your Password - CozyCatKitchen',
    html: emailTemplates.passwordReset({
      customerName,
      resetLink: finalResetLink,
    }),
  })
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(to: string, orderDetails: any, customerName?: string) {
  return sendEmail({
    to,
    subject: `Order Confirmation - CozyCatKitchen #${orderDetails.orderId || 'N/A'}`,
    html: emailTemplates.orderConfirmation({
      customerName,
      orderDetails,
    }),
  })
}

/**
 * Send custom email (for admin communications)
 */
export async function sendCustomEmail(to: string, subject: string, message: string, customerName?: string) {
  return sendEmail({
    to,
    subject,
    html: emailTemplates.customMessage({
      customerName,
      subject,
      message,
    }),
  })
}

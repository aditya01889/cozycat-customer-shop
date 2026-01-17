import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Configure nodemailer with Gmail (or any SMTP service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!
  },
  debug: true // Enable debug logging
})

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, customerName } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('=== SENDING EMAIL VIA NODEMAILER ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Customer:', customerName)
    console.log('==============================')

    // Send email using nodemailer
    try {
      const info = await transporter.sendMail({
        from: `"CozyCatKitchen" <${process.env.GMAIL_USER}>`,
        to: [to],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
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
                <h2>${subject}</h2>
                <p>Dear <span class="customer-name">${customerName || 'Valued Customer'}</span>,</p>
                <div style="white-space: pre-wrap; font-family: inherit;">${body}</div>
              </div>
              
              <div class="footer">
                <p>This email was sent from CozyCatKitchen Admin Panel</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>© 2024 CozyCatKitchen. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      console.log('✅ Email sent successfully via nodemailer!')
      console.log('Message ID:', info.messageId)

    } catch (emailError: any) {
      console.error('Email sending failed:', emailError)
      return NextResponse.json({ error: `Email sending failed: ${emailError.message}` }, { status: 500 })
    }

    // Log email in database for tracking
    const { error: dbError } = await supabase
      .from('email_logs')
      .insert({
        to_email: to,
        subject,
        body,
        customer_name: customerName,
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_provider: 'nodemailer'
      })

    if (dbError) {
      console.error('Error logging email:', dbError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully via nodemailer',
      details: { 
        to, 
        subject, 
        body,
        provider: 'Nodemailer',
        delivered: true
      }
    })

  } catch (error: any) {
    console.error('Error in send-email API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

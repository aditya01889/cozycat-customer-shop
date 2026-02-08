/**
 * Simple email configuration test
 */

const nodemailer = require('nodemailer')
require('dotenv').config({ path: '.env.local' })

async function testEmailConfig() {
  console.log('🧪 Testing email configuration...\n')

  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log('   Gmail User:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing')
  console.log('   Gmail Password:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing')
  console.log('   Resend API Key:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
  console.log('   Site URL:', process.env.SITE_URL || '❌ Missing')
  console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')

  console.log('\n1️⃣ Testing Gmail transporter...')
  
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        debug: true,
      })

      // Verify connection
      await transporter.verify()
      console.log('✅ Gmail transporter verified successfully!')

      // Test sending email
      const info = await transporter.sendMail({
        from: `"CozyCatKitchen Test" <${process.env.GMAIL_USER}>`,
        to: 'test@example.com',
        subject: 'Test Email from CozyCatKitchen',
        html: `
          <h2>Email Test Successful!</h2>
          <p>This is a test email to verify the Gmail configuration is working.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <p>Site URL: ${process.env.SITE_URL}</p>
        `,
      })

      console.log('✅ Test email sent successfully!')
      console.log('   Message ID:', info.messageId)
      console.log('   To: test@example.com')
      
    } catch (error) {
      console.log('❌ Gmail test failed:', error.message)
      
      if (error.message.includes('535')) {
        console.log('   💡 Gmail authentication failed - check app password')
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('   💡 Network issue - check internet connection')
      }
    }
  } else {
    console.log('❌ Gmail credentials not set')
  }

  console.log('\n2️⃣ Testing Resend transporter...')
  
  if (process.env.RESEND_API_KEY) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 587,
        secure: false,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      })

      await transporter.verify()
      console.log('✅ Resend transporter verified successfully!')
      
    } catch (error) {
      console.log('❌ Resend test failed:', error.message)
    }
  } else {
    console.log('❌ Resend API key not set')
  }

  console.log('\n🔍 Next Steps:')
  console.log('1. If Gmail test passed - check your Gmail inbox/spam for test email')
  console.log('2. If Gmail failed - verify app password in Google Account settings')
  console.log('3. Configure Supabase Auth email settings in Supabase dashboard')
  console.log('4. Test user registration to verify email verification flow')
}

testEmailConfig().catch(console.error)

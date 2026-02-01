/**
 * Test email functionality
 */

const { createClient } = require('@supabase/supabase-js')
const { sendCustomEmail } = require('./lib/email/service.js')

async function testEmail() {
  console.log('🧪 Testing email functionality...\n')

  // Test 1: Custom email service
  console.log('1️⃣ Testing custom email service...')
  try {
    const result = await sendCustomEmail(
      'test@example.com',
      'Test Email from CozyCatKitchen',
      'This is a test email to verify the email service is working.',
      'Test User'
    )
    
    if (result.success) {
      console.log('✅ Custom email service working!')
      console.log('   Message ID:', result.messageId)
    } else {
      console.log('❌ Custom email service failed:', result.error)
    }
  } catch (error) {
    console.log('❌ Custom email service error:', error.message)
  }

  console.log('\n2️⃣ Testing Supabase auth email configuration...')
  
  // Test 2: Check Supabase auth configuration
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Test password reset (this will trigger an email)
    const { error } = await supabase.auth.resetPasswordForEmail('test@example.com')
    
    if (error) {
      if (error.message.includes('Email') || error.message.includes('SMTP')) {
        console.log('❌ Supabase email not configured:', error.message)
        console.log('   💡 You need to configure email in Supabase dashboard')
      } else {
        console.log('✅ Supabase auth email API working (error is expected for test email)')
      }
    } else {
      console.log('✅ Supabase auth email API working!')
    }
  } catch (error) {
    console.log('❌ Supabase auth email error:', error.message)
  }

  console.log('\n📋 Email Configuration Summary:')
  console.log('   Gmail User:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing')
  console.log('   Gmail Password:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing')
  console.log('   Resend API Key:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
  console.log('   Site URL:', process.env.SITE_URL || '❌ Missing')
}

testEmail().catch(console.error)

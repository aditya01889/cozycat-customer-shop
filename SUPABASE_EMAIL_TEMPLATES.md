# 🍽 CozyCatKitchen Email Templates - Ready to Paste

## 📧 How to Use These Templates

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `xfnbhheapralprcwjvzl`
3. **Navigate to**: Project Settings → Authentication → Email Template
4. **Choose email provider**: Custom SMTP (or Resend)
5. **Copy and paste** the templates below into their respective sections

---

## 🔗 **Email Confirmation Template** (Confirm Signup)

**Paste this into the "Confirm Signup" template section:**

```html
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
      font-size: 28px;
      font-weight: bold;
      color: #ff6b35;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background-color: #ff6b35;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #e55a2b;
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
    .feature-list {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .feature-list h3 {
      color: #ff6b35;
      margin-top: 0;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo"><span class="emoji">🍽</span>CozyCatKitchen</div>
      <p>Welcome to our family of happy cats! 🐱</p>
    </div>
    
    <h2>Verify Your Email Address</h2>
    <p>Dear <span class="customer-name">{{ .UserEmail }}</span>,</p>
    <p>Thank you for signing up with CozyCatKitchen! 🎉 We're excited to serve your feline family member with premium, nutritious meals.</p>
    
    <p>To complete your registration and start shopping for the best cat food, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px;">{{ .ConfirmationURL }}</p>
    
    <div class="feature-list">
      <h3><span class="emoji">🎁</span>What You'll Get After Verification:</h3>
      <ul>
        <li><strong>Premium Cat Food Selection</strong> - Nutritionally balanced meals</li>
        <li><strong>Fast Delivery</strong> - Fresh food at your doorstep</li>
        <li><strong>Order Tracking</strong> - Monitor your cat's meals in real-time</li>
        <li><strong>Exclusive Offers</strong> - Special deals for registered members</li>
        <li><strong>Expert Support</strong> - Nutrition advice for your cat</li>
      </ul>
    </div>
    
    <p><strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
    
    <div class="footer">
      <p><strong>If you didn't create an account with CozyCatKitchen</strong>, please ignore this email or contact our support team.</p>
      <p>© 2024 CozyCatKitchen. All rights reserved.</p>
      <p><span class="emoji">🐱</span> Premium nutrition for happy, healthy cats <span class="emoji">🍽</span></p>
      <p style="font-size: 12px; margin-top: 10px;">
        <strong>Our Promise:</strong> We're committed to providing the highest quality, nutritionally complete meals that your cat will love.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🔒 **Password Reset Template**

**Paste this into the "Reset Password" template section:**

```html
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
      font-size: 28px;
      font-weight: bold;
      color: #ff6b35;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background-color: #ff6b35;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #e55a2b;
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
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo"><span class="emoji">🍽</span>CozyCatKitchen</div>
      <p>Security Alert 🔒</p>
    </div>
    
    <h2>Reset Your Password</h2>
    <p>Dear <span class="customer-name">{{ .UserEmail }}</span>,</p>
    <p>We received a request to reset your password for your CozyCatKitchen account. If you made this request, please click the button below to reset your password:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px;">{{ .ConfirmationURL }}</p>
    
    <div class="warning">
      <p><strong><span class="emoji">⚠️</span> Security Notice:</strong></p>
      <ul>
        <li>This password reset link will expire in 1 hour for security reasons</li>
        <li>If you didn't request this password reset, please ignore this email</li>
        <li>Never share this link with anyone</li>
        <li>Make sure your new password is strong and unique</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>If you have any concerns about your account security, please contact our support team immediately.</p>
      <p>© 2024 CozyCatKitchen. All rights reserved.</p>
      <p><span class="emoji">🐱</span> Keeping your account safe and your cats happy <span class="emoji">🍽</span></p>
    </div>
  </div>
</body>
</html>
```

---

## 📧 **Email Change Template**

**Paste this into the "Email Change" template section:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Change Confirmation - CozyCatKitchen</title>
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
      font-size: 28px;
      font-weight: bold;
      color: #ff6b35;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background-color: #ff6b35;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #e55a2b;
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
    .info-box {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo"><span class="emoji">🍽</span>CozyCatKitchen</div>
      <p>Account Update 📧</p>
    </div>
    
    <h2>Confirm Your New Email Address</h2>
    <p>Dear <span class="customer-name">{{ .UserEmail }}</span>,</p>
    <p>You requested to change your email address for your CozyCatKitchen account. To complete this change, please confirm your new email address by clicking the button below:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px;">{{ .ConfirmationURL }}</p>
    
    <div class="info-box">
      <h3><span class="emoji">ℹ️</span>What This Means:</h3>
      <ul>
        <li>Your account email will be updated to: <strong>{{ .NewEmail }}</strong></li>
        <li>You'll use this new email for future logins</li>
        <li>Order confirmations and updates will go to this new email</li>
        <li>Your old email will no longer have access to this account</li>
      </ul>
    </div>
    
    <p><strong>⚠️ Important:</strong> This confirmation link will expire in 24 hours for security reasons.</p>
    
    <div class="footer">
      <p><strong>If you didn't request this email change</strong>, please contact our support team immediately.</p>
      <p>© 2024 CozyCatKitchen. All rights reserved.</p>
      <p><span class="emoji">🐱</span> Keeping your account secure and your cats happy <span class="emoji">🍽</span></p>
    </div>
  </div>
</body>
</html>
```

---

## ⚙️ **SMTP Configuration**

**Use these settings in Supabase Dashboard:**

### **Option 1: Gmail SMTP**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: cozycatkitchen@gmail.com
SMTP Password: stveupbonaaabmmp
Encryption: STARTTLS
```

### **Option 2: Resend (Recommended)**
```
Email Provider: Resend
API Key: re_YofEWyHA_46KUTySTTa9ELSHdvDBHLfvr
Sender Email: noreply@cozycatkitchen.com
```

---

## ✅ **After Configuration**

1. **Save changes** in Supabase Dashboard
2. **Test registration** on your website
3. **Check email inbox** (including spam folder)
4. **Verify the email template** looks correct
5. **Test password reset** functionality

---

## 🎨 **Brand Features**

- **Colors**: Primary orange (#ff6b35) matching your brand
- **Logo**: 🍽 CozyCatKitchen with cat emoji 🐱
- **Typography**: Clean, modern Segoe UI font
- **Responsive**: Works on all devices
- **Professional**: Security warnings and clear CTAs
- **Brand Voice**: Friendly, caring, cat-focused messaging

Your emails will now look professional and match your CozyCatKitchen brand perfectly! 🐱

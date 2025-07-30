# Email Verification Setup (Development Mode)

## 🎯 Overview

This guide explains how to enable email verification for the signup process using Supabase's built-in email service without configuring custom SMTP settings.

## 🔧 Supabase Configuration Steps

### 1. Enable Email Confirmation in Supabase Dashboard

1. **Go to your Supabase project dashboard**
2. **Navigate to Authentication > Settings**
3. **Enable the following settings:**
   - ✅ **Enable email confirmations** - Turn this ON
   - ✅ **Confirm email** - Set to "Required"
   - ✅ **Enable signup** - Turn this ON

### 2. Configure Site URL

1. **In Authentication > Settings**
2. **Set Site URL to:** `http://localhost:8080` (for development)
3. **Add Redirect URLs:**
   - `http://localhost:8080/verify-email`
   - `http://localhost:8080/dashboard/student`

### 3. Email Template Configuration (Optional)

1. **Go to Authentication > Email Templates**
2. **Customize the "Confirm signup" template if needed**
3. **Default template will work for development**

## 📧 How Email Verification Works (Development)

### Without Custom SMTP:
- Supabase uses their built-in email service
- Emails are sent from `noreply@mail.app.supabase.io`
- Limited to development/testing purposes
- May have delivery limitations

### Email Flow:
1. User signs up → Supabase sends verification email
2. User clicks link → Redirected to `/verify-email?token=...&type=email`
3. Our app verifies the token → Account activated
4. User redirected to dashboard

## 🚀 Testing Email Verification

### Method 1: Use Real Email (Recommended)
```typescript
// Test with your real email address
const testSignup = {
  email: 'your-real-email@gmail.com', // Use your actual email
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User',
  employeeId: 'TEST001'
};
```

### Method 2: Check Supabase Auth Logs
1. Go to **Authentication > Users** in Supabase Dashboard
2. Check user status (should show "Waiting for email verification")
3. Look for email confirmation events in logs

### Method 3: Manual Token Extraction (Development Only)
```sql
-- In Supabase SQL Editor, you can manually get confirmation tokens
SELECT 
  email,
  email_confirm_token,
  created_at
FROM auth.users 
WHERE email = 'test@example.com';
```

## 🔍 Troubleshooting

### Common Issues:

1. **Email not received:**
   - Check spam/junk folder
   - Verify email address is correct
   - Check Supabase email settings are enabled

2. **Verification link doesn't work:**
   - Ensure Site URL is set correctly
   - Check redirect URLs include `/verify-email`
   - Verify token hasn't expired (default: 24 hours)

3. **User stuck in "unconfirmed" state:**
   - Check Authentication > Users in Supabase Dashboard
   - Manually confirm user if needed for testing

### Manual User Confirmation (Development Only):
```sql
-- In Supabase SQL Editor
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test@example.com';
```

## 🎯 Development Workflow

### For Testing Signup Flow:
1. Use a real email address you can access
2. Complete signup form
3. Check email for verification link
4. Click link to verify account
5. Confirm user is activated in dashboard

### For Automated Testing:
1. Create test users with confirmed emails
2. Use the setupTestAccounts script (see next section)
3. Test accounts bypass email verification

## 📝 Code Configuration

The current implementation already handles email verification correctly:

```typescript
// In auth.ts - signUpWithPassword function
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
      employee_id: employeeId,
    }
  }
});

// Email verification is automatically triggered by Supabase
// User receives email with confirmation link
// Link redirects to /verify-email with token
```

## ✅ Verification Checklist

Before testing signup:
- [ ] Email confirmations enabled in Supabase
- [ ] Site URL set to `http://localhost:8080`
- [ ] Redirect URLs configured
- [ ] Development server running on port 8080
- [ ] Real email address available for testing

## 🚀 Next Steps

1. **Enable email confirmation in Supabase Dashboard**
2. **Test signup with real email address**
3. **Set up test accounts using the npm script (see next section)**
4. **Verify the complete signup → email → verification → login flow**

This setup will work for development and testing without requiring custom SMTP configuration.

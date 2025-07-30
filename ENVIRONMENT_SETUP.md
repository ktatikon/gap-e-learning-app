# Environment Setup Guide

## 🔒 Security Requirements

This application requires proper environment variable configuration for security. **No credentials are hardcoded in the codebase.**

## 📋 Required Environment Variables

### 1. Create .env File

Copy the example file and configure your credentials:

```bash
cp .env.example .env
```

### 2. Configure Supabase Credentials

Edit your `.env` file with your actual Supabase project credentials:

```env
# Get these from https://app.supabase.com/ > Your Project > Settings > API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here
```

### 3. Where to Find Your Credentials

1. **Go to your Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**
3. **Navigate to Settings > API**
4. **Copy the following values:**
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys > anon public** → `VITE_SUPABASE_ANON_KEY`

## ⚠️ Security Warnings

### ❌ DO NOT:
- Commit `.env` files to version control
- Share your API keys in chat, email, or documentation
- Use production credentials in development
- Hardcode any credentials in source code
- Use the same credentials across environments

### ✅ DO:
- Use environment variables for all credentials
- Keep `.env` files local to your machine
- Use different Supabase projects for development/production
- Regularly rotate API keys
- Use the `.env.example` template for documentation

## 🧪 Development vs Production

### Development Environment
- Use a separate Supabase project for development
- Test accounts can be created using the setup script
- Email verification can be bypassed for test accounts only

### Production Environment
- Use a dedicated production Supabase project
- All users must go through proper signup flow
- Email verification is mandatory
- Test account setup script will refuse to run

## 🚀 Setup Instructions

### 1. Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd gap-e-learning-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your development Supabase credentials

# 4. Start development server
npm run dev

# 5. (Optional) Set up test accounts
npm run setup-test-accounts
```

### 2. Production Setup

```bash
# 1. Configure production environment variables
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# Use your production Supabase project credentials

# 2. Build the application
npm run build

# 3. Deploy the built files
# Deploy the dist/ folder to your hosting provider
```

## 🔧 Environment Variable Validation

The application will check for required environment variables on startup:

- **Missing VITE_SUPABASE_URL**: Application will not start
- **Missing VITE_SUPABASE_ANON_KEY**: Application will not start
- **Invalid credentials**: Authentication will fail with clear error messages

## 🧪 Test Account Setup (Development Only)

### Available Scripts

```bash
# Set up all test accounts (development only)
npm run setup-test-accounts

# Verify existing test accounts
npm run verify-test-accounts

# Test signup functionality
npm run test-signup
```

### Test Accounts Created

**⚠️ These accounts are for development/testing only:**

- **Student**: `student@gxp.in` / `123456789`
- **Admin**: `admin@gxp.in` / `123456789`
- **Compliance**: `compliance@gxp.in` / `123456789`

### Security Features

- **Production Protection**: Script refuses to run in production environments
- **Environment Detection**: Checks Supabase URL for production indicators
- **Clear Warnings**: Displays security warnings during setup
- **Email Bypass**: Test accounts skip email verification (development only)

## 🔍 Troubleshooting

### Common Issues

1. **"Missing environment variable" errors**
   - Check your `.env` file exists
   - Verify all required variables are set
   - Ensure no typos in variable names

2. **"Invalid API key" errors**
   - Verify your Supabase anon key is correct
   - Check your Supabase project is active
   - Ensure you're using the right project credentials

3. **Authentication failures**
   - Confirm your Supabase URL is correct
   - Check your project's authentication settings
   - Verify RLS policies are configured correctly

### Getting Help

1. **Check the console** for detailed error messages
2. **Verify your Supabase project** is properly configured
3. **Review the authentication settings** in Supabase Dashboard
4. **Ensure your .env file** matches the .env.example template

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
- [GxP Learning Hub Documentation](./README.md)

Remember: **Security is paramount in GxP environments. Always follow proper credential management practices.**

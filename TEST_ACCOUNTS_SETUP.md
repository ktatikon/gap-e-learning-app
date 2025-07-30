# Test Accounts Setup Guide

## 🎯 Overview

This guide explains how to set up the three test accounts (student@gxp.in, admin@gxp.in, compliance@gxp.in) with the password "123456789" using the npm script we've created.

## 📦 NPM Scripts Added

The following scripts have been added to `package.json`:

```json
{
  "scripts": {
    "setup-test-accounts": "tsx src/scripts/setupTestAccounts.ts",
    "verify-test-accounts": "tsx src/scripts/setupTestAccounts.ts --verify",
    "test-signup": "tsx src/scripts/testSignup.ts"
  }
}
```

## 🔧 Prerequisites

1. **Install tsx dependency** (already added to package.json):
   ```bash
   npm install
   ```

2. **Ensure Supabase is configured** with your project credentials in the environment

3. **Database tables must exist** (users, user_roles, user_role_assignments)

## 🚀 Running the Test Account Setup

### Method 1: Setup All Test Accounts
```bash
npm run setup-test-accounts
```

This will:
- Create or update all three test accounts
- Assign appropriate roles to each account
- Verify the setup was successful

### Method 2: Verify Existing Accounts Only
```bash
npm run verify-test-accounts
```

This will:
- Check if test accounts exist
- Verify their roles and profile information
- Report any missing accounts or roles

### Method 3: Test Signup Functionality
```bash
npm run test-signup
```

This will:
- Run validation tests for the signup system
- Test password requirements
- Test rate limiting functionality

## 📋 Test Accounts Created

### 1. Student Account
- **Email**: `student@gxp.in`
- **Password**: `123456789`
- **Name**: John Student
- **Employee ID**: EMP001
- **Department**: Quality Assurance
- **Job Title**: QA Analyst
- **Roles**: student

### 2. Admin Account
- **Email**: `admin@gxp.in`
- **Password**: `123456789`
- **Name**: Jane Admin
- **Employee ID**: EMP002
- **Department**: Information Technology
- **Job Title**: System Administrator
- **Roles**: admin, student

### 3. Compliance Account
- **Email**: `compliance@gxp.in`
- **Password**: `123456789`
- **Name**: Mike Compliance
- **Employee ID**: EMP003
- **Department**: Regulatory Affairs
- **Job Title**: Compliance Officer
- **Roles**: compliance, student

## 🔍 Expected Output

### Successful Setup Output:
```
🚀 Setting up test accounts...

Setting up account for student@gxp.in...
Creating new account for student@gxp.in...
Created auth user for student@gxp.in
Created profile for student@gxp.in
Assigned role 'student' to student@gxp.in
✅ Successfully set up account for student@gxp.in

Setting up account for admin@gxp.in...
Creating new account for admin@gxp.in...
Created auth user for admin@gxp.in
Created profile for admin@gxp.in
Assigned role 'admin' to admin@gxp.in
Assigned role 'student' to admin@gxp.in
✅ Successfully set up account for admin@gxp.in

Setting up account for compliance@gxp.in...
Creating new account for compliance@gxp.in...
Created auth user for compliance@gxp.in
Created profile for compliance@gxp.in
Assigned role 'compliance' to compliance@gxp.in
Assigned role 'student' to compliance@gxp.in
✅ Successfully set up account for compliance@gxp.in

Test account setup completed!

🔍 Verifying setup...

Verifying test accounts...
✅ Profile found for student@gxp.in
   - Name: John Student
   - Employee ID: EMP001
   - Department: Quality Assurance
   - Active: true
   - Roles: student
✅ student@gxp.in - All roles assigned correctly

✅ Profile found for admin@gxp.in
   - Name: Jane Admin
   - Employee ID: EMP002
   - Department: Information Technology
   - Active: true
   - Roles: admin, student
✅ admin@gxp.in - All roles assigned correctly

✅ Profile found for compliance@gxp.in
   - Name: Mike Compliance
   - Employee ID: EMP003
   - Department: Regulatory Affairs
   - Active: true
   - Roles: compliance, student
✅ compliance@gxp.in - All roles assigned correctly

Test account verification completed!

✅ Script completed successfully!
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"tsx command not found"**
   ```bash
   # Install tsx
   npm install --save-dev tsx
   # Or run with npx
   npx tsx src/scripts/setupTestAccounts.ts
   ```

2. **"Missing script: setup-test-accounts"**
   - Ensure the scripts are added to package.json
   - Run `npm install` to refresh dependencies

3. **Supabase connection errors**
   - Check your `.env` file has correct Supabase credentials
   - Verify your Supabase project is active
   - Ensure database tables exist

4. **Role assignment errors**
   - Check that user_roles table has the required roles:
     - student
     - admin
     - compliance
   - Verify user_role_assignments table exists

### Manual Verification:

You can manually check the accounts in Supabase Dashboard:

1. **Go to Authentication > Users**
   - Should see the three test accounts
   - All should be confirmed/active

2. **Go to Table Editor > users**
   - Should see user profiles with correct information

3. **Go to Table Editor > user_role_assignments**
   - Should see role assignments for each user

## 🔄 Re-running the Script

The script is designed to be idempotent, meaning:
- It can be run multiple times safely
- Existing accounts will be updated, not duplicated
- Missing roles will be added
- Existing data will be preserved

## 🧪 Testing the Accounts

After setup, test the accounts by:

1. **Navigate to the login page**: http://localhost:8080/login
2. **Use the test credentials** to log in
3. **Verify role-based access** works correctly
4. **Test the quick login buttons** on the login page

## 📝 Script Customization

To modify the test accounts, edit `src/scripts/setupTestAccounts.ts`:

```typescript
const testAccounts: TestAccount[] = [
  {
    email: 'your-custom@email.com',
    password: 'your-password',
    firstName: 'Your',
    lastName: 'Name',
    employeeId: 'EMP004',
    department: 'Your Department',
    jobTitle: 'Your Title',
    roles: ['student'] // or ['admin', 'student'], etc.
  }
  // Add more accounts as needed
];
```

Then run the setup script again to create the new accounts.

This setup ensures you have working test accounts for development and testing of the GxP Learning Hub signup and authentication system.

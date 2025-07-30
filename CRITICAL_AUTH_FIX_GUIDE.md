# 🚨 CRITICAL AUTHENTICATION FIX GUIDE

## **IMMEDIATE ACTION REQUIRED**

Your GxP Learning Hub has critical authentication failures. Follow these steps **in order** to resolve all issues.

## 📋 **STEP-BY-STEP RESOLUTION**

### **STEP 1: Confirm Email Addresses (MANUAL - URGENT)**

1. **Open Supabase Dashboard:**
   - Go to https://app.supabase.com/
   - Select your project: `rrmidxxrcwfwjxuhbwtv`

2. **Navigate to Authentication:**
   - Click **Authentication** → **Users**

3. **Confirm Each Test Account Email:**
   
   **For `student@gxp.in`:**
   - Find the user in the list
   - Click on the user row
   - Click **"Confirm Email"** button
   - Verify **"Email Confirmed At"** shows a timestamp
   
   **For `admin@gxp.in`:**
   - Find the user in the list
   - Click on the user row
   - Click **"Confirm Email"** button
   - Verify **"Email Confirmed At"** shows a timestamp
   
   **For `compliance@gxp.in`:**
   - Find the user in the list
   - Click on the user row
   - Click **"Confirm Email"** button
   - Verify **"Email Confirmed At"** shows a timestamp

4. **Check New User Account:**
   - Search for `t.krishnadeeppak@gmail.com`
   - **If found**: Confirm email using same process
   - **If not found**: User needs to complete signup again

### **STEP 2: Set Up Database Schema (CRITICAL)**

The database is completely empty. You must create the basic schema:

1. **Go to Supabase Dashboard → SQL Editor**

2. **Copy and paste the entire contents of `database_setup.sql`**

3. **Click "Run" to execute the script**

4. **Verify the script ran successfully** (should see success messages)

### **STEP 3: Create User Profiles**

After running the database setup script:

1. **Get User IDs from Auth:**
   ```sql
   SELECT id, email FROM auth.users 
   WHERE email IN ('student@gxp.in', 'admin@gxp.in', 'compliance@gxp.in');
   ```

2. **Copy the user IDs and create profiles:**

   **For Student Account:**
   ```sql
   SELECT create_user_profile(
     'REPLACE_WITH_ACTUAL_USER_ID'::UUID,
     'EMP001',
     'student@gxp.in',
     'John',
     'Student',
     'Quality Assurance',
     'QA Analyst'
   );
   SELECT assign_user_role('REPLACE_WITH_ACTUAL_USER_ID'::UUID, 'student');
   ```

   **For Admin Account:**
   ```sql
   SELECT create_user_profile(
     'REPLACE_WITH_ACTUAL_USER_ID'::UUID,
     'EMP002',
     'admin@gxp.in',
     'Jane',
     'Admin',
     'Information Technology',
     'System Administrator'
   );
   SELECT assign_user_role('REPLACE_WITH_ACTUAL_USER_ID'::UUID, 'admin');
   SELECT assign_user_role('REPLACE_WITH_ACTUAL_USER_ID'::UUID, 'student');
   ```

   **For Compliance Account:**
   ```sql
   SELECT create_user_profile(
     'REPLACE_WITH_ACTUAL_USER_ID'::UUID,
     'EMP003',
     'compliance@gxp.in',
     'Mike',
     'Compliance',
     'Regulatory Affairs',
     'Compliance Officer'
   );
   SELECT assign_user_role('REPLACE_WITH_ACTUAL_USER_ID'::UUID, 'compliance');
   SELECT assign_user_role('REPLACE_WITH_ACTUAL_USER_ID'::UUID, 'student');
   ```

### **STEP 4: Verification**

1. **Run the guided fix script:**
   ```bash
   npm run guided-auth-fix
   ```

2. **Test authentication:**
   ```bash
   npm run test-current-auth
   ```

3. **Manual login test:**
   - Go to http://localhost:8080/login
   - Try each account:
     - `student@gxp.in` / `123456789`
     - `admin@gxp.in` / `123456789`
     - `compliance@gxp.in` / `123456789`

## ⚠️ **TROUBLESHOOTING**

### **If emails still not confirmed:**
- Double-check you clicked "Confirm Email" in Supabase Dashboard
- Refresh the Users page and verify timestamp appears
- Try logging out and back into Supabase Dashboard

### **If database script fails:**
- Check you have proper permissions
- Verify you're in the correct project
- Try running sections of the script individually

### **If login still fails after all steps:**
- Run `npm run test-current-auth` to see specific error messages
- Check that user profiles were created correctly
- Verify roles were assigned properly

## 🎯 **EXPECTED RESULTS**

After completing all steps:

✅ **All test accounts login successfully**
✅ **Users have proper roles assigned**
✅ **Role-based access control works**
✅ **New user registration works**
✅ **Complete authentication flow functions**

## 📞 **NEED HELP?**

If you encounter issues:

1. **Check the console output** from the test scripts for specific errors
2. **Verify each step was completed** exactly as described
3. **Run the guided fix script** for step-by-step assistance
4. **Check Supabase project logs** for any backend errors

## 🚀 **AUTOMATION SCRIPTS AVAILABLE**

- `npm run guided-auth-fix` - Step-by-step guided resolution
- `npm run test-current-auth` - Test current authentication state
- `npm run test-signup` - Test signup functionality

**This is a critical system issue that prevents all user access. Complete these steps immediately to restore functionality.**

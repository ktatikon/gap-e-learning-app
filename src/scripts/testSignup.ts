import { validatePassword } from '../lib/auth';
import { signupRateLimiter, emailVerificationRateLimiter, getClientIP } from '../lib/rateLimiter';

// Test password validation
export function testPasswordValidation() {
  console.log('🧪 Testing Password Validation...');
  
  const testCases = [
    { password: '123', expected: false, description: 'Too short' },
    { password: 'password', expected: false, description: 'No uppercase, numbers, or special chars' },
    { password: 'Password123', expected: false, description: 'No special characters' },
    { password: 'Password123!', expected: true, description: 'Strong password' },
    { password: 'MySecure@Pass123', expected: true, description: 'Very strong password' },
  ];
  
  testCases.forEach(({ password, expected, description }) => {
    const result = validatePassword(password);
    const status = result.isValid === expected ? '✅' : '❌';
    console.log(`${status} ${description}: "${password}" - Valid: ${result.isValid}`);
    if (!result.isValid) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  });
  
  console.log('');
}

// Test rate limiting
export function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting...');
  
  const clientIP = getClientIP();
  console.log(`Client fingerprint: ${clientIP}`);
  
  // Test signup rate limiting
  console.log('\n📝 Testing Signup Rate Limiting:');
  for (let i = 1; i <= 5; i++) {
    const result = signupRateLimiter.recordAttempt(clientIP, 'signup');
    console.log(`Attempt ${i}: Blocked: ${result.blocked}, Remaining: ${result.attemptsRemaining}`);
    
    if (result.blocked) {
      console.log(`⏰ Blocked until: ${new Date(result.blockedUntil!).toLocaleTimeString()}`);
      break;
    }
  }
  
  // Reset for next test
  signupRateLimiter.reset(clientIP, 'signup');
  
  // Test email verification rate limiting
  console.log('\n📧 Testing Email Verification Rate Limiting:');
  for (let i = 1; i <= 7; i++) {
    const result = emailVerificationRateLimiter.recordAttempt(clientIP, 'resend-verification');
    console.log(`Attempt ${i}: Blocked: ${result.blocked}, Remaining: ${result.attemptsRemaining}`);
    
    if (result.blocked) {
      console.log(`⏰ Blocked until: ${new Date(result.blockedUntil!).toLocaleTimeString()}`);
      break;
    }
  }
  
  // Reset for cleanup
  emailVerificationRateLimiter.reset(clientIP, 'resend-verification');
  
  console.log('');
}

// Test form validation
export function testFormValidation() {
  console.log('🧪 Testing Form Validation...');
  
  const testData = {
    email: 'test@example.com',
    password: 'TestPass123!',
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'EMP001',
    department: 'Quality Assurance',
    jobTitle: 'QA Analyst'
  };
  
  // Test required fields
  const requiredFields = ['email', 'password', 'firstName', 'lastName', 'employeeId'];
  requiredFields.forEach(field => {
    const testDataCopy = { ...testData };
    delete (testDataCopy as any)[field];
    
    const isValid = Object.values(testDataCopy).every(value => value && value.trim());
    console.log(`${isValid ? '❌' : '✅'} Missing ${field}: Validation ${isValid ? 'failed' : 'passed'}`);
  });
  
  // Test email format
  const emailTests = [
    { email: 'valid@example.com', expected: true },
    { email: 'invalid-email', expected: false },
    { email: '@example.com', expected: false },
    { email: 'test@', expected: false },
  ];
  
  emailTests.forEach(({ email, expected }) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const status = isValid === expected ? '✅' : '❌';
    console.log(`${status} Email "${email}": Valid: ${isValid}`);
  });
  
  console.log('');
}

// Test signup data structure
export function testSignupDataStructure() {
  console.log('🧪 Testing Signup Data Structure...');
  
  const signupData = {
    email: 'test@gxp.in',
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User',
    employeeId: 'TEST001',
    department: 'Quality Assurance',
    jobTitle: 'Test Analyst'
  };
  
  // Validate structure
  const requiredFields = ['email', 'password', 'firstName', 'lastName', 'employeeId'];
  const optionalFields = ['department', 'jobTitle'];
  
  const hasAllRequired = requiredFields.every(field => 
    signupData.hasOwnProperty(field) && (signupData as any)[field]
  );
  
  const hasValidOptional = optionalFields.every(field => 
    signupData.hasOwnProperty(field)
  );
  
  console.log(`✅ Required fields present: ${hasAllRequired}`);
  console.log(`✅ Optional fields present: ${hasValidOptional}`);
  console.log(`✅ Data structure valid: ${hasAllRequired && hasValidOptional}`);
  
  // Test password validation
  const passwordValidation = validatePassword(signupData.password);
  console.log(`✅ Password meets requirements: ${passwordValidation.isValid}`);
  
  console.log('');
}

// Test department options
export function testDepartmentOptions() {
  console.log('🧪 Testing Department Options...');
  
  const departments = [
    'Quality Assurance',
    'Quality Control',
    'Manufacturing',
    'Research & Development',
    'Regulatory Affairs',
    'Clinical Operations',
    'Validation',
    'Engineering',
    'Information Technology',
    'Human Resources',
    'Training & Development',
    'Other'
  ];
  
  console.log(`✅ Department options available: ${departments.length}`);
  departments.forEach((dept, index) => {
    console.log(`   ${index + 1}. ${dept}`);
  });
  
  console.log('');
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Running Signup System Tests...\n');
  
  testPasswordValidation();
  testRateLimiting();
  testFormValidation();
  testSignupDataStructure();
  testDepartmentOptions();
  
  console.log('✅ All tests completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).signupTests = {
    runAllTests,
    testPasswordValidation,
    testRateLimiting,
    testFormValidation,
    testSignupDataStructure,
    testDepartmentOptions
  };
  
  console.log('🧪 Signup tests available in browser console as window.signupTests');
  console.log('Run window.signupTests.runAllTests() to execute all tests');
}

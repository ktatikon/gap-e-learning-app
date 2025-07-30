# 🎓 GxP Learning Hub

A comprehensive Learning Management System (LMS) designed for GxP (Good Practice) compliance training in pharmaceutical, biotechnology, and medical device industries. Built with modern web technologies and powered by Supabase for enterprise-grade security and scalability.

![GxP Learning Hub](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.10-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 🚀 Live Demo

**Access the application:** [http://localhost:8080](http://localhost:8080)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Module Structure](#module-structure)
- [Assessment System](#assessment-system)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

GxP Learning Hub is a modern, enterprise-grade Learning Management System specifically designed for GxP compliance training. The platform provides comprehensive training modules, assessments, digital signatures, and audit trails to ensure regulatory compliance in highly regulated industries.

### Key Benefits

- ✅ **GxP Compliance Ready** - Built for pharmaceutical, biotech, and medical device industries
- ✅ **Supabase-Powered Backend** - Enterprise-grade database with real-time capabilities
- ✅ **Role-Based Access Control** - Secure access for Students, Admins, and Compliance Officers
- ✅ **Electronic Signatures** - 21 CFR Part 11 compliant digital signatures with cryptographic integrity
- ✅ **Comprehensive Audit Trail** - Complete activity logging with tamper-proof records
- ✅ **Advanced Reporting** - Compliance reports, training records, and audit analytics
- ✅ **Row Level Security** - Database-level security ensuring data isolation
- ✅ **Real-time Synchronization** - Live updates across all user sessions

## ✨ Features

### 🎓 **Learning Management**

- **Interactive Training Modules** - Video, PDF, and SCORM content support
- **Progress Tracking** - Real-time progress monitoring with visual indicators
- **Prerequisite Management** - Sequential learning paths with dependency tracking
- **Certificate Generation** - Automatic certificate creation upon completion

### 📊 **Assessment & Evaluation**

- **Professional Quizzes** - 5-question assessments per module with detailed explanations
- **Pass/Fail System** - 70% passing threshold with attempt tracking
- **Retry Logic** - Up to 3 attempts with supervisor escalation
- **Score Tracking** - Comprehensive score history and performance analytics

### 🔐 **Security & Compliance**

- **21 CFR Part 11 Compliance** - Electronic records and signatures
- **Role-Based Authorization** - Secure access control for different user types
- **Audit Trail** - Complete activity logging for compliance reporting
- **Digital Signatures** - Legally binding electronic signatures

### 📈 **Reporting & Analytics**

- **Training Reports** - Comprehensive training completion statistics
- **Audit Logs** - Detailed activity tracking for compliance audits
- **User Progress Analytics** - Individual and team performance metrics
- **Compliance Dashboards** - Real-time compliance status monitoring

### 🎨 **User Experience**

- **Modern UI Design** - Glassmorphism effects and gradient backgrounds
- **Responsive Design** - Mobile-friendly interface across all devices
- **Auto-Login Features** - Quick access for demo users
- **Toast Notifications** - Real-time feedback and status updates
- **Landing Page** - Professional marketing page with feature highlights

## 🛠 Technology Stack

### **Frontend**

- **React 18.2.0** - Modern UI library with hooks and functional components
- **TypeScript 5.0.0** - Type-safe development with enhanced IDE support
- **Vite 5.4.10** - Fast build tool and development server
- **React Router DOM** - Client-side routing and navigation

### **UI Components**

- **Shadcn UI** - High-quality, accessible component library
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Radix UI** - Unstyled, accessible UI primitives

### **Backend & Database**

- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Database-level security policies
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for training materials

### **State Management**

- **React Query (TanStack Query)** - Server state management and caching
- **React Context** - Authentication state management

### **Styling & Design**

- **CSS Variables** - Custom HSL color palette
- **Glassmorphism** - Modern UI trend with blurred backgrounds
- **Gradients** - Beautiful gradient effects for buttons and backgrounds
- **Animations** - Smooth transitions and hover effects

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Supabase Account** - Create a free account at [supabase.com](https://supabase.com)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gxp-learn-hub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   **🔒 SECURITY NOTICE**: No credentials are hardcoded in this application.

   - Create a new project in Supabase
   - Copy your project URL and anon key from Settings > API
   - Configure your environment:

   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env with your actual Supabase credentials
   ```

   Required variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   ```

   **⚠️ Never commit your `.env` file to version control!**

4. **Initialize the database**

   - Run the SQL scripts in `supabase/migrations/` to set up the database schema
   - Enable Row Level Security (RLS) policies
   - Set up authentication providers if needed

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:5173](http://localhost:5173)
   - Register a new account or use the test accounts below

### Test Accounts (Development Only)

**⚠️ DEVELOPMENT ONLY**: These accounts bypass email verification and should NEVER be used in production.

For development and testing, use these pre-configured accounts (password: `123456789`):

- **Student**: `student@gxp.in` / `123456789`
- **Admin**: `admin@gxp.in` / `123456789`
- **Compliance**: `compliance@gxp.in` / `123456789`

**Setup test accounts:**
```bash
npm run setup-test-accounts  # Development only - will refuse to run in production
```

### User Registration

New users can register at `/signup` with:
- Email verification required
- Strong password requirements
- Role-based access control
- Rate limiting for security

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## �️ Database Architecture

### **Core Tables**

- **users** - User profiles with role-based access control
- **training_courses** - Course catalog with metadata and versioning
- **training_modules** - Individual learning modules within courses
- **training_enrollments** - User course enrollments with progress tracking
- **module_progress** - Detailed progress tracking for each module
- **quiz_attempts** - Assessment attempts with scores and feedback
- **electronic_signatures** - 21 CFR Part 11 compliant digital signatures
- **audit_logs** - Comprehensive audit trail for all system activities

### **Security Features**

- **Row Level Security (RLS)** - Database-level access control
- **Real-time Subscriptions** - Live updates for progress and notifications
- **Encrypted Storage** - Sensitive data encryption at rest
- **Audit Trail** - Immutable logging of all user actions
- **Data Integrity** - Foreign key constraints and validation rules

### **Compliance Features**

- **Electronic Signatures** - Cryptographically signed training completions
- **Audit Logging** - Complete activity tracking with timestamps
- **Data Retention** - Configurable retention policies for compliance
- **Backup & Recovery** - Automated backups with point-in-time recovery

## �👥 User Roles

### 🎓 **Student**

- Access training modules and assessments
- Track learning progress
- Complete quizzes and digital signatures
- View certificates and completion status

**Demo Credentials:**

- Email: `student@gxp.in`
- Password: `123456789`

### 👨‍💼 **Admin**

- Manage users and permissions
- Create and edit training content
- View comprehensive reports
- Monitor system activity

**Demo Credentials:**

- Email: `admin@gxp.in`
- Password: `123456789`

### 🛡️ **Compliance Officer**

- Access audit logs and reports
- Monitor training compliance
- Review escalated assessments
- Generate compliance reports

**Demo Credentials:**

- Email: `compliance@gxp.in`
- Password: `123456789`

## 📚 Module Structure

### **Available Training Modules**

1. **GMP Fundamentals** (`gmp-fundamentals`)

   - Good Manufacturing Practices basics
   - Quality systems and documentation
   - Regulatory compliance requirements

2. **21 CFR Part 11 Overview** (`cfr-part-11`)

   - Electronic Records and Electronic Signatures
   - FDA compliance requirements
   - System validation guidelines

3. **Deviations & CAPA** (`deviations-capa`)

   - Corrective and Preventive Action procedures
   - Quality deviation handling
   - CAPA system implementation

4. **Data Integrity Principles** (`data-integrity`)

   - ALCOA+ principles
   - Data integrity best practices
   - GxP environment compliance

5. **Computer System Validation** (`validation-basics`)
   - CSV requirements and GAMP 5 guidelines
   - Validation lifecycle processes
   - System qualification procedures

### **Module Features**

- **Prerequisites** - Sequential learning paths
- **Progress Tracking** - Real-time completion status
- **Assessment Quizzes** - Professional 5-question tests
- **Digital Signatures** - 21 CFR Part 11 compliant
- **Certificates** - Automatic generation upon completion

## 🎯 Assessment System

### **Quiz Structure**

- **5 Questions per Module** - Comprehensive coverage
- **Multiple Choice Format** - Professional assessment style
- **Detailed Explanations** - Educational feedback
- **70% Passing Threshold** - Industry standard

### **Assessment Flow**

1. **Module Completion** - Reach 80% progress to unlock quiz
2. **Quiz Access** - Click "Take Quiz" button
3. **Question Navigation** - Previous/Next with progress tracking
4. **Submission** - Review answers before submitting
5. **Results** - Pass/Fail with detailed feedback
6. **Next Steps** - Retry, review, or continue to signature

### **Pass/Fail Logic**

- **Pass (≥70%)** - Module completion, certificate generation
- **Fail (<70%)** - Retry with attempt tracking
- **3 Attempts Maximum** - Supervisor escalation after failures
- **Audit Trail** - Complete attempt logging

## 📊 API Documentation

### **Store Actions**

```typescript
// Authentication
login(user: User): void
logout(): void

// Progress Management
updateProgress(userId: string, moduleId: string, progress: number): void
completeModule(userId: string, moduleId: string, score?: number): void

// Assessment
saveSignature(userId: string, moduleId: string, signature: string): void

// Audit & Reporting
addAuditLog(action: string, userId: string, moduleId?: string, details?: string): void
```

### **Data Models**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "compliance";
}

interface Module {
  id: string;
  title: string;
  description: string;
  type: "video" | "pdf" | "scorm";
  category: string;
  prerequisites: string[];
  hasQuiz: boolean;
  requiresSignature: boolean;
}

interface UserProgress {
  userId: string;
  moduleId: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  attempts: number;
  score?: number;
  completedAt?: Date;
  signatureData?: string;
}
```

## 🚀 Deployment

### **Production Build**

```bash
npm run build
```

### **Deployment Options**

1. **Vercel** - Recommended for React apps with Supabase
2. **Netlify** - Easy deployment with environment variables
3. **AWS Amplify** - Full-stack deployment with CI/CD
4. **Docker** - Containerized deployment for enterprise

### **Environment Variables**

**🔒 SECURITY REQUIREMENT**: All credentials must be configured via environment variables.

For production deployment, set these environment variables:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

**⚠️ NEVER use development credentials in production!**

### **Supabase Production Setup**

1. **Create Production Project**
   - Set up a new Supabase project for production
   - Configure custom domain if needed
   - Set up SSL certificates

2. **Database Migration**
   - Run all migration scripts in production
   - Set up Row Level Security policies
   - Configure backup schedules

3. **Authentication Setup**
   - Configure OAuth providers
   - Set up email templates
   - Configure redirect URLs

4. **Security Configuration**
   - Enable RLS on all tables
   - Set up API rate limiting
   - Configure CORS policies

### **Monitoring & Maintenance**

- **Supabase Dashboard** - Monitor database performance
- **Error Tracking** - Set up error monitoring (Sentry, etc.)
- **Analytics** - Track user engagement and training completion
- **Backup Strategy** - Regular database backups and testing

```env
VITE_APP_TITLE=GxP Learning Hub
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

### **Development Workflow**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### **Code Standards**

- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message standards

---

**Built with ❤️ for GxP Compliance Training**

_Last updated: July 29, 2025_

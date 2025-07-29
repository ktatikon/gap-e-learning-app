# 🎓 GxP Learning Hub

A comprehensive Learning Management System (LMS) designed for GxP (Good Practice) compliance training in pharmaceutical, biotechnology, and medical device industries.

![GxP Learning Hub](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.10-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-38B2AC)

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
- ✅ **Role-Based Access Control** - Secure access for Students, Admins, and Compliance Officers
- ✅ **Comprehensive Assessment System** - Professional quizzes with pass/fail tracking
- ✅ **Digital Signature Integration** - 21 CFR Part 11 compliant electronic signatures
- ✅ **Audit Trail & Reporting** - Complete activity logging and compliance reporting
- ✅ **Modern UI/UX** - Beautiful, responsive interface with glassmorphism design
- ✅ **Real-time Progress Tracking** - Live progress monitoring and completion certificates

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

### **State Management**

- **Zustand** - Lightweight state management with persistence
- **React Query** - Server state management and caching

### **Styling & Design**

- **CSS Variables** - Custom HSL color palette
- **Glassmorphism** - Modern UI trend with blurred backgrounds
- **Gradients** - Beautiful gradient effects for buttons and backgrounds
- **Animations** - Smooth transitions and hover effects

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

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

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:8080](http://localhost:8080)
   - Use auto-login buttons for quick access

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

## 👥 User Roles

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

1. **Vercel** - Zero-config deployment
2. **Netlify** - Drag and drop deployment
3. **GitHub Pages** - Static site hosting
4. **AWS S3** - Scalable cloud hosting

### **Environment Variables**

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

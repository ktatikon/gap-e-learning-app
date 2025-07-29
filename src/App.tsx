import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import TrainingCatalog from "./pages/TrainingCatalog";
import ModulePlayer from "./pages/ModulePlayer";
import CoursePlayer from "./pages/CoursePlayer";
import Quiz from "./pages/Quiz";
import Signature from "./pages/Signature";
import Certificates from "./pages/Certificates";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import NotFound from "./pages/NotFound";
import { clearLegacyData } from "./lib/store";
import { AuthProvider } from "./lib/auth-context";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Clear legacy data on app initialization
clearLegacyData();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4 text-destructive">
                    Unauthorized Access
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">
                    You don't have permission to access this page.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="text-primary hover:underline"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route
              path="/dashboard/compliance"
              element={<ComplianceDashboard />}
            />
            <Route path="/catalog" element={<TrainingCatalog />} />
            <Route path="/course/:id" element={<CoursePlayer />} />
            <Route path="/module/:id" element={<ModulePlayer />} />
            <Route path="/module/:id/quiz" element={<Quiz />} />
            <Route path="/module/:id/signature" element={<Signature />} />
            <Route path="/certificates" element={<Certificates />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/content" element={<ContentManagement />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRoles={["admin", "compliance"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/audit" element={<AuditLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import TrainingCatalog from "./pages/TrainingCatalog";
import ModulePlayer from "./pages/ModulePlayer";
import Quiz from "./pages/Quiz";
import Signature from "./pages/Signature";
import Certificates from "./pages/Certificates";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard/student" element={<StudentDashboard />} />
            <Route path="dashboard/admin" element={<AdminDashboard />} />
            <Route path="dashboard/compliance" element={<ComplianceDashboard />} />
            <Route path="catalog" element={<TrainingCatalog />} />
            <Route path="module/:id" element={<ModulePlayer />} />
            <Route path="module/:id/quiz" element={<Quiz />} />
            <Route path="module/:id/signature" element={<Signature />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/content" element={<ContentManagement />} />
            <Route path="admin/reports" element={<Reports />} />
            <Route path="admin/audit" element={<AuditLogs />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

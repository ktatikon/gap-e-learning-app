import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/hooks/useUsers";
import { useCourses } from "@/hooks/useCourses";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  BarChart3,
  Upload,
  FileText,
  Shield,
  Loader2,
  AlertCircle,
  Plus,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();
  const navigate = useNavigate();

  if (!user) return null;

  const isLoading = usersLoading || coursesLoading;
  const hasError = usersError || coursesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error loading dashboard data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const totalUsers = users?.length || 0;
  const totalCourses = courses?.length || 0;
  const activeCourses = courses?.filter(c => c.is_active)?.length || 0;
  const mandatoryCourses = courses?.filter(c => c.is_mandatory)?.length || 0;



  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage users, content, and monitor training compliance across your
          organization.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active learners in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {activeCourses} active courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mandatory Training
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandatoryCourses}</div>
            <p className="text-xs text-muted-foreground">
              Required courses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Courses
            </CardTitle>
            <CardDescription>Latest training courses in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses?.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                >
                  <div>
                    <h3 className="font-medium text-foreground">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.category} • v{course.version}
                      {course.is_mandatory && " • Mandatory"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.is_mandatory && (
                      <Shield className="h-4 w-4 text-orange-600" />
                    )}
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No courses available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Management Actions</CardTitle>
            <CardDescription>Quick access to admin functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gxp-button-primary"
              onClick={() => navigate("/admin/users")}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button
              className="w-full justify-start gxp-button-secondary"
              onClick={() => navigate("/admin/content")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Training Content
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate("/admin/reports")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate("/admin/audit")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system activities and audit events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {log.action.replace("_", " ").toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.details} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {log.ipAddress}
                </span>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

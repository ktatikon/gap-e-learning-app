import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/hooks/useUsers";
import { useCourses } from "@/hooks/useCourses";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  FileCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ComplianceDashboard() {
  const { user } = useAuth();
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();

  if (!user) return null;

  const isLoading = usersLoading || coursesLoading;
  const hasError = usersError || coursesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error loading compliance data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Calculate compliance metrics from real data
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.is_active)?.length || 0;
  const totalCourses = courses?.length || 0;
  const mandatoryCourses = courses?.filter(c => c.is_mandatory)?.length || 0;

  // These would come from enrollment data in a real implementation
  const completionRate = 85; // Placeholder - would calculate from actual enrollments
  const overdueRate = 12; // Placeholder - would calculate from actual due dates

  const departmentData = [
    { name: "Quality Assurance", completion: 95, total: 20 },
    { name: "Manufacturing", completion: 87, total: 35 },
    { name: "Regulatory Affairs", completion: 100, total: 15 },
    { name: "IT", completion: 78, total: 12 },
  ];

  const failedCases = [
    {
      user: "John Doe",
      module: "GMP Fundamentals",
      attempts: 4,
      lastAttempt: "2024-01-15",
    },
    {
      user: "Jane Smith",
      module: "Deviations & CAPA",
      attempts: 3,
      lastAttempt: "2024-01-14",
    },
  ];

  const validationChecklist = [
    { item: "Training records backed up", status: "completed" },
    { item: "Compliance reports generated", status: "completed" },
    { item: "Audit trail verified", status: "pending" },
    { item: "Certificate validation", status: "completed" },
    { item: "Remedial training assigned", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Compliance Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor training compliance, audit activities, and ensure regulatory
          requirements are met.
        </p>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall training completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Training
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overdueRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Training past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Attempts
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedAttempts}
            </div>
            <p className="text-xs text-muted-foreground">
              Users requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Completion by Department
            </CardTitle>
            <CardDescription>
              Training completion rates across departments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentData.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dept.name}</span>
                  <span>
                    {dept.completion}% ({dept.total} users)
                  </span>
                </div>
                <Progress value={dept.completion} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Failed Training Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Failed Training Cases
            </CardTitle>
            <CardDescription>Users requiring remedial training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedCases.map((case_, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-foreground">
                      {case_.user}
                    </h3>
                    <span className="text-xs text-red-600 font-medium">
                      {case_.attempts} attempts
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {case_.module}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last attempt: {case_.lastAttempt}
                  </p>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 gxp-button-accent">
              Assign Remedial Training
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Preview & Validation Checklist */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Audit Activity
            </CardTitle>
            <CardDescription>
              Latest compliance and audit events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-4 gap-2 text-xs border-b pb-2"
                >
                  <span className="font-medium">
                    {log.action.replace("_", " ")}
                  </span>
                  <span className="truncate">{log.userId}</span>
                  <span>{log.moduleId || "System"}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No audit activity yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Validation Checklist
            </CardTitle>
            <CardDescription>Daily compliance validation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-muted-foreground rounded" />
                  )}
                  <span
                    className={`text-sm ${
                      item.status === "completed"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

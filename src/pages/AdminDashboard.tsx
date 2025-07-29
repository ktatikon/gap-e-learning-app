import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  BarChart3,
  Upload,
  FileText,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, modules, userProgress, auditLogs } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  // Calculate stats
  const totalUsers = 3; // Demo data
  const assignedModules = modules.length;
  const completionRate = Math.round(
    (userProgress.filter((p) => p.status === "completed").length /
      Math.max(userProgress.length, 1)) *
      100
  );

  const recentUploads = [
    {
      id: 1,
      title: "GMP Fundamentals Update v2.1",
      type: "Video",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "21 CFR Part 11 Revision",
      type: "PDF",
      date: "2024-01-14",
    },
    {
      id: 3,
      title: "Safety Protocol Training",
      type: "SCORM",
      date: "2024-01-13",
    },
  ];

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
              Assigned Modules
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedModules}</div>
            <p className="text-xs text-muted-foreground">
              Training modules available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Recent Uploads
            </CardTitle>
            <CardDescription>Latest training content additions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-foreground">
                      {upload.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {upload.type} • {upload.date}
                    </p>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
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

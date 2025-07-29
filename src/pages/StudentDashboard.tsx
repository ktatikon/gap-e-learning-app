import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useUserDashboard } from "@/hooks/useProgress";
import { useCourses } from "@/hooks/useCourses";
import { useNavigate } from "react-router-dom";
import {
  Play,
  BookOpen,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enrollments, completed, inProgress, isLoading, error } = useUserDashboard();
  const { data: allCourses } = useCourses();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  const completedCourses = completed.data || [];
  const inProgressCourses = inProgress.data || [];
  const allEnrollments = enrollments.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="status-badge-completed">
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="status-badge-in-progress">
            In Progress
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="status-badge-failed">
            Failed
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="status-badge-expired">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="status-badge-not-started">
            Not Started
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionButton = (enrollment: any) => {
    const courseId = enrollment.training_courses?.id || enrollment.course_id;

    switch (enrollment.status) {
      case "completed":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/course/${courseId}`)}
          >
            Review
          </Button>
        );
      case "in_progress":
        return (
          <Button
            size="sm"
            onClick={() => navigate(`/course/${courseId}`)}
            className="gxp-button-primary"
          >
            Continue
          </Button>
        );
      case "failed":
        return (
          <Button
            size="sm"
            onClick={() => navigate(`/course/${courseId}`)}
            className="gxp-button-primary"
          >
            Retry
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => navigate(`/course/${courseId}`)}
            className="gxp-button-primary"
          >
            Start Training
          </Button>
        );
    }
  };



  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div className="gxp-card">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Welcome back, {user.first_name} {user.last_name}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Continue your learning journey and stay compliant with the latest
          training requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* My Trainings */}
        <div className="space-y-4">
          <Card className="rounded-xl p-4 shadow-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BookOpen className="h-5 w-5" />
                My Trainings
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track your progress and continue learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No training courses assigned yet.</p>
                  <Button
                    onClick={() => navigate('/catalog')}
                    className="mt-4"
                    variant="outline"
                  >
                    Browse Course Catalog
                  </Button>
                </div>
              ) : (
                allEnrollments.map((enrollment) => {
                  const course = enrollment.training_courses;
                  if (!course) return null;

                  return (
                    <div
                      key={enrollment.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(enrollment.status)}
                          <div>
                            <h3 className="font-medium text-foreground text-base sm:text-lg">
                              {course.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {course.description}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(enrollment.status)}
                      </div>

                      {enrollment.status === 'in_progress' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Progress</span>
                            <span>{Math.round((enrollment.time_spent / (course.estimated_duration || 60)) * 100)}%</span>
                          </div>
                          <Progress
                            value={Math.round((enrollment.time_spent / (course.estimated_duration || 60)) * 100)}
                            className="h-2"
                          />
                        </div>
                      )}

                      {enrollment.status === 'completed' && enrollment.score && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Final Score</span>
                            <span>{enrollment.score}%</span>
                          </div>
                          <Progress
                            value={enrollment.score}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Category: {course.category || 'General'}
                        </span>
                        {getActionButton(enrollment)}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <Card className="rounded-xl p-4 shadow-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5" />
                Your Progress
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track your learning achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {completedCourses.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completed
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {inProgressCourses.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    In Progress
                  </div>
                </div>
              </div>

              {completedCourses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Recent Achievements</span>
                  </div>
                  {completedCourses.slice(0, 3).map((enrollment) => (
                    <div key={enrollment.id} className="text-xs text-muted-foreground">
                      • Completed {enrollment.training_courses?.title}
                      {enrollment.score && ` (${enrollment.score}%)`}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-xl p-4 shadow-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {inProgressCourses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Continue Learning</h4>
                  {inProgressCourses.slice(0, 2).map((enrollment) => (
                    <Button
                      key={enrollment.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate(`/course/${enrollment.course_id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {enrollment.training_courses?.title}
                    </Button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Explore</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/catalog')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Course Catalog
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/certificates')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  View Certificates
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-xl p-4 shadow-md w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="min-h-10 px-4 rounded-md text-sm sm:text-base w-full sm:w-auto justify-start"
                onClick={() => navigate("/catalog")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Training Catalog
              </Button>
              <Button
                variant="outline"
                className="min-h-10 px-4 rounded-md text-sm sm:text-base w-full sm:w-auto justify-start"
                onClick={() => navigate("/certificates")}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View My Certificates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

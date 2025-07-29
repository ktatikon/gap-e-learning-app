import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useCourse } from "@/hooks/useCourses";
import { useCourseProgress, useStartCourse, useUpdateModuleProgress, useUserDashboard } from "@/hooks/useProgress";
import { useSignatureWorkflow } from "@/hooks/useSignatures";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import type { ModuleProgressWithModule } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  PlayCircle,
  FileText,
  Monitor,
  CheckCircle2,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { logCourseStart, logCourseCompletion, logModuleProgress } = useAuditLog();

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);

  // Fetch course data first
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(id || '');

  // Get user enrollments to find the enrollment for this course
  const { enrollments } = useUserDashboard();
  const enrollment = enrollments.data?.find(e => e.course_id === id);

  // Fetch progress data if we have an enrollment
  const { moduleProgress: moduleProgressData, progressSummary, isLoading: progressLoading } = useCourseProgress(
    enrollment?.id || ''
  );

  // Get signature workflow data
  const { hasCompletionSignature, isSignatureRequired } = useSignatureWorkflow(enrollment?.id || '');

  // Mutations
  const startCourseMutation = useStartCourse();
  const updateProgressMutation = useUpdateModuleProgress();

  const isLoading = courseLoading || progressLoading;
  const hasError = courseError;

  useEffect(() => {
    // Auto-start course if not already enrolled
    if (course && user && !enrollment && !startCourseMutation.isPending) {
      startCourseMutation.mutate({ courseId: course.id });
      // Log course start
      logCourseStart(course.id);
    }
  }, [course, user, enrollment, startCourseMutation, logCourseStart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (hasError || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Course not found or error loading course</p>
          <Button onClick={() => navigate('/catalog')} className="mt-4">
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const modules = (moduleProgressData.data || []) as ModuleProgressWithModule[];
  const currentModule = modules[currentModuleIndex];

  const handleProgressUpdate = (progress: number) => {
    setModuleProgress(progress);

    if (currentModule && user && enrollment) {
      updateProgressMutation.mutate({
        enrollmentId: enrollment.id,
        moduleId: (currentModule as any).module_id,
        userId: user.id,
        progressData: {
          progress_percentage: progress,
          status: progress === 100 ? 'completed' : 'in_progress',
          time_spent: Math.floor(progress / 10), // Rough estimate
        }
      });

      // Log module progress
      logModuleProgress((currentModule as any).module_id, progress);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setModuleProgress(0);
    } else {
      // Course completed - check if signature is required
      if (course) {
        logCourseCompletion(course.id, progressSummary.progressPercentage);
      }

      if (isSignatureRequired && !hasCompletionSignature) {
        // Navigate to signature page
        navigate(`/signature/${enrollment?.id}?type=training_completion&return=/dashboard/student`);
      } else {
        toast({
          title: "Course Completed!",
          description: "Congratulations on completing the course.",
        });
        navigate('/dashboard/student');
      }
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      const prevModule = modules[currentModuleIndex - 1];
      setModuleProgress((prevModule as any)?.progress_percentage || 0);
    }
  };

  const getModuleIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <PlayCircle className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'scorm':
        return <Monitor className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/catalog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progressSummary.progressPercentage}%</span>
            </div>
            <Progress value={progressSummary.progressPercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {progressSummary.completedModules}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {progressSummary.totalModules - progressSummary.completedModules}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {progressSummary.totalModules}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Module List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modules.map((module, index) => (
                <div
                  key={(module as any).id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    index === currentModuleIndex
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentModuleIndex(index)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getModuleIcon(module.training_modules?.content_type || 'text')}
                    <span className="font-medium text-sm">
                      {module.training_modules?.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge((module as any).status)}
                    {(module as any).status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentModule && getModuleIcon(currentModule.training_modules?.content_type || 'text')}
              {currentModule?.training_modules?.title || 'Select a module'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentModule ? (
              <div className="space-y-6">
                {/* Module Description */}
                <div>
                  <p className="text-muted-foreground">
                    {currentModule.training_modules?.description}
                  </p>
                </div>

                {/* Content Area */}
                <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                  <div>
                    {getModuleIcon(currentModule.training_modules?.content_type || 'text')}
                    <p className="mt-4 text-muted-foreground">
                      {currentModule.training_modules?.content_type === 'video' && 'Video content would be displayed here'}
                      {currentModule.training_modules?.content_type === 'pdf' && 'PDF content would be displayed here'}
                      {currentModule.training_modules?.content_type === 'scorm' && 'SCORM content would be displayed here'}
                      {!currentModule.training_modules?.content_type && 'Module content would be displayed here'}
                    </p>
                  </div>
                </div>

                {/* Progress Controls */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Module Progress</span>
                    <span>{moduleProgress}%</span>
                  </div>
                  <Progress value={moduleProgress} className="h-2" />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleProgressUpdate(Math.min(moduleProgress + 25, 100))}
                    >
                      Simulate Progress (+25%)
                    </Button>
                    <Button
                      onClick={() => handleProgressUpdate(100)}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousModule}
                    disabled={currentModuleIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextModule}
                    disabled={moduleProgress < 100}
                  >
                    {currentModuleIndex === modules.length - 1 ? 'Complete Course' : 'Next Module'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a module to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

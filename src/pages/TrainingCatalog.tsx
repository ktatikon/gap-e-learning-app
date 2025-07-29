import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useCoursesCatalog } from "@/hooks/useCourses";
import { useUserDashboard } from "@/hooks/useProgress";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Play, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TrainingCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { user } = useAuth();
  const navigate = useNavigate();

  // Get courses with filtering
  const { data: courses, isLoading, error } = useCoursesCatalog({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: searchTerm.length >= 2 ? searchTerm : undefined,
  });

  // Get user's progress data
  const { completed } = useUserDashboard();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error loading courses</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const completedCourseIds = completed.data?.map(e => e.course_id) || [];

  // Get unique categories from courses
  const categories = [
    "all",
    ...Array.from(new Set(courses?.map((c) => c.category).filter(Boolean) || [])),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Training Catalog
        </h1>
        <p className="text-muted-foreground">
          Explore available training modules and continue your professional
          development.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Training</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search training courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Training Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          courses?.map((course) => {
            const isCompleted = completedCourseIds.includes(course.id);

            return (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <div className="flex gap-2">
                      {course.category && (
                        <Badge variant="outline">{course.category}</Badge>
                      )}
                      {course.is_mandatory && (
                        <Badge variant="destructive">Mandatory</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Course Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{course.estimated_duration || 60} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="capitalize">{course.difficulty_level || 'Intermediate'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Passing Score:</span>
                      <span>{course.passing_score}%</span>
                    </div>
                  </div>

                  {/* Course Status */}
                  {isCompleted && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      className="w-full gxp-button-primary"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isCompleted ? "Review Course" : "Start Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

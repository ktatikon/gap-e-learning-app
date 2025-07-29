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
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Play, Lock } from "lucide-react";

export default function TrainingCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [prerequisiteFilter, setPrerequisiteFilter] = useState("all");

  const { user, modules, getUserProgress, getCompletedModules } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  const completedModules = getCompletedModules(user.id);
  const completedModuleIds = completedModules.map((p) => p.moduleId);

  const checkPrerequisites = (module: { prerequisites: string[] }) => {
    return module.prerequisites.every((prereq: string) =>
      completedModuleIds.includes(prereq)
    );
  };

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || module.category === categoryFilter;

    const prerequisitesMet = checkPrerequisites(module);
    const matchesPrerequisites =
      prerequisiteFilter === "all" ||
      (prerequisiteFilter === "met" && prerequisitesMet) ||
      (prerequisiteFilter === "not-met" && !prerequisitesMet);

    return matchesSearch && matchesCategory && matchesPrerequisites;
  });

  const categories = [
    "all",
    ...Array.from(new Set(modules.map((m) => m.category))),
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search training modules..."
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

            <Select
              value={prerequisiteFilter}
              onValueChange={setPrerequisiteFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prerequisites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Training</SelectItem>
                <SelectItem value="met">Prerequisites Met</SelectItem>
                <SelectItem value="not-met">Prerequisites Not Met</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Training Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module) => {
          const progress = getUserProgress(user.id, module.id);
          const prerequisitesMet = checkPrerequisites(module);

          return (
            <Card key={module.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <Badge variant="outline">{module.category}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{module.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {module.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Prerequisites */}
                {module.prerequisites.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Prerequisites:</h4>
                    <div className="flex flex-wrap gap-1">
                      {module.prerequisites.map((prereq) => {
                        const prereqModule = modules.find(
                          (m) => m.id === prereq
                        );
                        const isCompleted = completedModuleIds.includes(prereq);
                        return (
                          <Badge
                            key={prereq}
                            variant={isCompleted ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {prereqModule?.title || prereq}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Module Features */}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{module.type} Content</span>
                  {module.hasQuiz && <span>• Quiz Included</span>}
                  {module.requiresSignature && (
                    <span>• Signature Required</span>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {!prerequisitesMet ? (
                    <div className="space-y-2">
                      <Button disabled className="w-full" variant="outline">
                        <Lock className="h-4 w-4 mr-2" />
                        Prerequisites Required
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Complete required training first
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full gxp-button-primary"
                      onClick={() => navigate(`/module/${module.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {progress?.status === "completed"
                        ? "Review"
                        : progress?.status === "in-progress"
                        ? "Continue"
                        : "Start Training"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No training modules found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

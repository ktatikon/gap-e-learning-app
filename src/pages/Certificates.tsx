import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Download, Award, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Certificates() {
  const { user, getCompletedModules, getModuleById } = useStore();
  const { toast } = useToast();

  if (!user) return null;

  const completedModules = getCompletedModules(user.id);

  const handleDownloadCertificate = async (moduleId: string) => {
    const module = getModuleById(moduleId);
    const progress = completedModules.find((p) => p.moduleId === moduleId);

    if (!module || !progress) return;

    // Create certificate content
    const certificateContent = `
CERTIFICATE OF COMPLETION

This certifies that

${user.name}

has successfully completed the training module

${module.title}

Completed on: ${
      progress.completedAt
        ? new Date(progress.completedAt).toLocaleDateString()
        : "N/A"
    }
Score: ${progress.score || "N/A"}%

GxP Learning Management System
    `;

    // Download certificate
    const blob = new Blob([certificateContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${module.title.replace(/\s+/g, "_")}_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Certificate Downloaded",
      description: `Certificate for ${module.title} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Certificates
        </h1>
        <p className="text-muted-foreground">
          Download and manage your training completion certificates.
        </p>
      </div>

      {/* Certificates Grid */}
      {completedModules.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {completedModules.map((progress) => {
            const module = getModuleById(progress.moduleId);
            if (!module) return null;

            return (
              <Card key={progress.moduleId} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">
                      Certified
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{module.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Completed:{" "}
                        {progress.completedAt
                          ? new Date(progress.completedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    {progress.score && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Score: {progress.score}%</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleDownloadCertificate(progress.moduleId)}
                    className="w-full gxp-button-primary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No certificates yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Complete training modules to earn certificates.
            </p>
            <Button onClick={() => (window.location.href = "/catalog")}>
              Browse Training Catalog
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

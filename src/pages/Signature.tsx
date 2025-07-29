import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { PenTool, CheckCircle2, Download, ArrowLeft } from "lucide-react";

export default function Signature() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getModuleById, getUserProgress, saveSignature } = useStore();

  const [signature, setSignature] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const module = id ? getModuleById(id) : null;
  const progress = user && id ? getUserProgress(user.id, id) : null;

  if (!module || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Module not found</h2>
        <Button onClick={() => navigate("/catalog")} className="mt-4">
          Back to Catalog
        </Button>
      </div>
    );
  }

  if (progress?.status !== "completed") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Complete the module first</h2>
        <p className="text-muted-foreground mt-2">
          You need to complete the training and pass the quiz before signing.
        </p>
        <Button onClick={() => navigate(`/module/${id}`)} className="mt-4">
          Return to Module
        </Button>
      </div>
    );
  }

  const handleSubmitSignature = () => {
    if (!signature.trim()) {
      toast({
        title: "Invalid Signature",
        description: "Signature invalid. Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (id && user) {
      saveSignature(user.id, id, signature);
      setIsSubmitted(true);
      toast({
        title: "Signature Accepted",
        description: "Signature accepted. Training Complete.",
      });
    }
  };

  const handleDownloadCertificate = async () => {
    setIsGenerating(true);

    // Simulate certificate generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a simple certificate content
    const certificateContent = `
CERTIFICATE OF COMPLETION

This certifies that

${user.name}

has successfully completed the training module

${module.title}

Completed on: ${new Date().toLocaleDateString()}
Score: ${progress?.score || "N/A"}%
Signature: ${signature}

GxP Learning Management System
    `;

    // Create and download the certificate
    const blob = new Blob([certificateContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${module.title.replace(/\s+/g, "_")}_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsGenerating(false);
    toast({
      title: "Certificate Downloaded",
      description: "Your completion certificate has been downloaded.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/catalog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Training Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-lg">
                Congratulations! You have successfully completed:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{module.title}</h3>
                <p className="text-muted-foreground">{module.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <span className="font-medium">Completed by:</span>
                <p>{user.name}</p>
              </div>
              <div>
                <span className="font-medium">Completion Date:</span>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Score:</span>
                <p>{progress?.score || "N/A"}%</p>
              </div>
              <div>
                <span className="font-medium">Digital Signature:</span>
                <p>{signature}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDownloadCertificate}
                disabled={isGenerating}
                className="gxp-button-primary w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Download Certificate"}
              </Button>

              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/certificates")}
                >
                  View All Certificates
                </Button>
                <Button variant="outline" onClick={() => navigate("/catalog")}>
                  Continue Learning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/module/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Module
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Digital Signature
          </h1>
          <p className="text-muted-foreground">
            Complete your training by providing your digital signature
          </p>
        </div>
      </div>

      {/* Module Info */}
      <Card>
        <CardHeader>
          <CardTitle>Training Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{module.title}</h3>
              <p className="text-muted-foreground">{module.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <span className="font-medium">Trainee:</span>
                <p>{user.name}</p>
              </div>
              <div>
                <span className="font-medium">Completion Date:</span>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Quiz Score:</span>
                <p>{progress?.score || "N/A"}%</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-green-600 font-medium">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Digital Signature Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Signature Requirements
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter your full legal name as your digital signature</li>
              <li>• This signature confirms you have completed the training</li>
              <li>
                • Your signature will be recorded with timestamp and audit trail
              </li>
              <li>
                • This signature is legally binding for compliance purposes
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="signature">Digital Signature *</Label>
              <Input
                id="signature"
                placeholder="Enter your full name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Type your full name exactly as it appears on official documents
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>IP Address:</span>
              <span className="font-mono">192.168.1.100</span>
              <span>•</span>
              <span>Timestamp:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={handleSubmitSignature}
            disabled={!signature.trim()}
            className="w-full gxp-button-primary"
          >
            Submit Digital Signature
          </Button>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground">
          <p className="font-medium mb-2">Legal Notice:</p>
          <p>
            By submitting your digital signature, you acknowledge that you have
            completed this training module and understand its content. This
            signature has the same legal effect as a handwritten signature for
            GxP compliance purposes and will be maintained in our audit trail
            system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

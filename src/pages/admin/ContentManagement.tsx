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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Edit } from "lucide-react";

export default function ContentManagement() {
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    type: "video",
    category: "",
  });

  const { toast } = useToast();

  const handleUpload = () => {
    if (!uploadData.title || !uploadData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Content Uploaded",
      description: `${uploadData.title} has been uploaded successfully.`,
    });

    setUploadData({ title: "", description: "", type: "video", category: "" });
  };

  const contentList = [
    {
      id: 1,
      title: "GMP Fundamentals v2.1",
      type: "Video",
      category: "GMP",
      uploaded: "2024-01-15",
    },
    {
      id: 2,
      title: "21 CFR Part 11 Guide",
      type: "PDF",
      category: "Regulatory",
      uploaded: "2024-01-14",
    },
    {
      id: 3,
      title: "CAPA Training Module",
      type: "SCORM",
      category: "Quality",
      uploaded: "2024-01-13",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Content Management
        </h1>
        <p className="text-muted-foreground">
          Upload and manage training content.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Training module title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Module description"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select
                  value={uploadData.type}
                  onValueChange={(value) =>
                    setUploadData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="scorm">SCORM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={uploadData.category}
                  onChange={(e) =>
                    setUploadData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g., GMP, Quality"
                />
              </div>
            </div>
            <Button
              onClick={handleUpload}
              className="w-full gxp-button-primary"
            >
              Upload Content
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.type} • {item.category}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

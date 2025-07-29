import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Save, PlayCircle, FileText, Monitor } from 'lucide-react';

export default function ModulePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getModuleById, getUserProgress, updateProgress } = useStore();
  
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const module = id ? getModuleById(id) : null;
  const progress = user && id ? getUserProgress(user.id, id) : null;

  useEffect(() => {
    if (progress) {
      setCurrentProgress(progress.progress);
    }
  }, [progress]);

  if (!module || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Module not found</h2>
        <Button onClick={() => navigate('/catalog')} className="mt-4">
          Back to Catalog
        </Button>
      </div>
    );
  }

  const handleSaveProgress = () => {
    if (id && user) {
      updateProgress(user.id, id, currentProgress);
      toast({
        title: "Progress Saved",
        description: `Your progress has been saved at ${currentProgress}%`,
      });
    }
  };

  const handleProgressUpdate = (newProgress: number) => {
    setCurrentProgress(newProgress);
  };

  const handleNext = () => {
    const newProgress = Math.min(currentProgress + 25, 100);
    handleProgressUpdate(newProgress);
  };

  const handlePrevious = () => {
    const newProgress = Math.max(currentProgress - 25, 0);
    handleProgressUpdate(newProgress);
  };

  const getContentArea = () => {
    switch (module.type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <PlayCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
              <p className="text-gray-300">Video Training Content</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'Pause' : 'Play'} Video
              </Button>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="bg-gray-50 rounded-lg p-8 min-h-[400px]">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
              <p className="text-muted-foreground">PDF Training Document</p>
            </div>
            <div className="prose max-w-none">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold mb-4">21 CFR Part 11 Overview</h4>
                <p className="mb-4">
                  This regulation defines the requirements for electronic records and electronic signatures 
                  in FDA-regulated industries. Key requirements include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Validation of computerized systems</li>
                  <li>Audit trail requirements</li>
                  <li>Record retention policies</li>
                  <li>Electronic signature standards</li>
                  <li>System access controls</li>
                </ul>
                <p className="mt-4">
                  {module.content || 'Additional content would be displayed here in a real implementation.'}
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'scorm':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Monitor className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
              <p className="text-muted-foreground mb-4">SCORM Interactive Content</p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">
                  SCORM package would be loaded here in a real implementation.
                  This would provide interactive learning experiences with tracking.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/catalog')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{module.title}</h1>
          <p className="text-muted-foreground">{module.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Training Progress</span>
            <span className="text-sm font-normal">{currentProgress}% Complete</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={currentProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Content Area */}
      <Card>
        <CardContent className="p-6">
          {getContentArea()}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentProgress === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleSaveProgress} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              
              {module.hasQuiz && currentProgress >= 80 && (
                <Button
                  onClick={() => navigate(`/module/${id}/quiz`)}
                  className="gxp-button-accent"
                >
                  Take Quiz
                </Button>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentProgress === 100}
              className="gxp-button-primary"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Info */}
      <Card>
        <CardHeader>
          <CardTitle>Module Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Category</h4>
              <p className="text-muted-foreground">{module.category}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Content Type</h4>
              <p className="text-muted-foreground capitalize">{module.type}</p>
            </div>
            {module.hasQuiz && (
              <div>
                <h4 className="font-medium mb-2">Assessment</h4>
                <p className="text-muted-foreground">Quiz Required</p>
              </div>
            )}
            {module.requiresSignature && (
              <div>
                <h4 className="font-medium mb-2">Completion</h4>
                <p className="text-muted-foreground">Digital Signature Required</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
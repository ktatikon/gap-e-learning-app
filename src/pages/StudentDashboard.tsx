import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Bell, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, modules, getUserProgress } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  const userModules = modules.map(module => ({
    ...module,
    progress: getUserProgress(user.id, module.id)
  }));

  const getStatusBadge = (progress: any) => {
    if (!progress) {
      return <Badge variant="secondary" className="status-badge-not-started">Not Started</Badge>;
    }
    if (progress.status === 'completed') {
      return <Badge variant="default" className="status-badge-completed">Completed</Badge>;
    }
    return <Badge variant="default" className="status-badge-in-progress">In Progress</Badge>;
  };

  const getStatusIcon = (progress: any) => {
    if (!progress) return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (progress.status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <Play className="h-4 w-4 text-orange-600" />;
  };

  const getActionButton = (module: any) => {
    if (!module.progress) {
      return (
        <Button 
          size="sm" 
          onClick={() => navigate(`/module/${module.id}`)}
          className="gxp-button-primary"
        >
          Start Training
        </Button>
      );
    }
    if (module.progress.status === 'completed') {
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/module/${module.id}`)}
        >
          Review
        </Button>
      );
    }
    return (
      <Button 
        size="sm" 
        onClick={() => navigate(`/module/${module.id}`)}
        className="gxp-button-accent"
      >
        Resume
      </Button>
    );
  };

  const notifications = [
    {
      id: 1,
      message: "GMP Module assigned",
      time: "2 hours ago",
      type: "assignment"
    },
    {
      id: 2,
      message: "Training due in 2 days",
      time: "1 day ago",
      type: "reminder"
    },
    {
      id: 3,
      message: "New compliance update available",
      time: "3 days ago",
      type: "info"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Continue your learning journey and stay compliant with the latest training requirements.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Trainings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Trainings
              </CardTitle>
              <CardDescription>
                Track your progress and continue learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userModules.map((module) => (
                <div key={module.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(module.progress)}
                      <div>
                        <h3 className="font-medium text-foreground">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(module.progress)}
                  </div>
                  
                  {module.progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{module.progress.progress}%</span>
                      </div>
                      <Progress value={module.progress.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Category: {module.category}
                    </span>
                    {getActionButton(module)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Stay updated with your training requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {notification.type === 'assignment' && <BookOpen className="h-4 w-4 text-blue-600" />}
                    {notification.type === 'reminder' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                    {notification.type === 'info' && <Bell className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/catalog')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Training Catalog
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/certificates')}
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
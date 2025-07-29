import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle,
  Trophy,
  Clock,
  BookOpen,
  Target,
  Award
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const QUIZ_QUESTIONS: Record<string, Question[]> = {
  "gmp-fundamentals": [
    {
      id: "1",
      question: "What does GMP stand for?",
      options: [
        "Good Manufacturing Practices",
        "General Medical Procedures",
        "Global Marketing Principles",
        "Guaranteed Material Purity",
      ],
      correctAnswer: 0,
      explanation: "GMP stands for Good Manufacturing Practices, which are regulations that ensure products are consistently produced and controlled according to quality standards."
    },
    {
      id: "2",
      question: "Which of the following is a key principle of GMP?",
      options: [
        "Cost reduction",
        "Quality assurance",
        "Speed of production",
        "Market expansion",
      ],
      correctAnswer: 1,
      explanation: "Quality assurance is a fundamental principle of GMP, ensuring that products meet quality standards."
    },
    {
      id: "3",
      question: "How often should GMP training be refreshed?",
      options: [
        "Every 5 years",
        "Once only",
        "Annually or as needed",
        "Only when regulations change",
      ],
      correctAnswer: 2,
      explanation: "GMP training should be refreshed annually or as needed to ensure compliance with current regulations."
    },
    {
      id: "4",
      question: "What is the primary goal of GMP documentation?",
      options: [
        "To increase paperwork",
        "To provide evidence of compliance",
        "To slow down processes",
        "To create bureaucracy",
      ],
      correctAnswer: 1,
      explanation: "GMP documentation provides evidence of compliance and ensures traceability of all processes."
    },
    {
      id: "5",
      question: "Which department is typically responsible for GMP compliance?",
      options: [
        "Marketing",
        "Quality Assurance",
        "Sales",
        "Finance",
      ],
      correctAnswer: 1,
      explanation: "Quality Assurance is typically responsible for ensuring GMP compliance across the organization."
    }
  ],
  "cfr-part-11": [
    {
      id: "1",
      question: "What does 21 CFR Part 11 regulate?",
      options: [
        "Electronic Records and Electronic Signatures",
        "Good Manufacturing Practices",
        "Food Safety Standards",
        "Drug Pricing",
      ],
      correctAnswer: 0,
      explanation: "21 CFR Part 11 specifically regulates Electronic Records and Electronic Signatures in FDA-regulated industries."
    },
    {
      id: "2",
      question: "What is required for electronic signatures under Part 11?",
      options: [
        "Only username and password",
        "Username, password, and unique identifier",
        "Just a digital certificate",
        "No specific requirements",
      ],
      correctAnswer: 1,
      explanation: "Electronic signatures under Part 11 require username, password, and a unique identifier for security."
    },
    {
      id: "3",
      question: "How long must electronic records be retained?",
      options: [
        "Until the end of the year",
        "For the same period as paper records",
        "Only for 1 year",
        "Until the system is replaced",
      ],
      correctAnswer: 1,
      explanation: "Electronic records must be retained for the same period as paper records according to Part 11."
    },
    {
      id: "4",
      question: "What is an audit trail in Part 11 context?",
      options: [
        "A financial audit report",
        "A chronological record of system activities",
        "A security camera recording",
        "A backup of data",
      ],
      correctAnswer: 1,
      explanation: "An audit trail is a chronological record of system activities that provides accountability and traceability."
    },
    {
      id: "5",
      question: "Which validation is required for Part 11 systems?",
      options: [
        "No validation required",
        "System validation only",
        "Complete system validation including software and hardware",
        "Only hardware validation",
      ],
      correctAnswer: 2,
      explanation: "Complete system validation including software and hardware is required for Part 11 compliance."
    }
  ],
  "deviations-capa": [
    {
      id: "1",
      question: "What does CAPA stand for?",
      options: [
        "Corrective and Preventive Action",
        "Compliance and Process Assessment",
        "Control and Prevention Activities",
        "Continuous Analysis and Process Audit",
      ],
      correctAnswer: 0,
      explanation: "CAPA stands for Corrective and Preventive Action, a systematic approach to identifying and addressing quality issues."
    },
    {
      id: "2",
      question: "When should a deviation be reported?",
      options: [
        "Only if it affects product quality",
        "At the end of the month",
        "Immediately when discovered",
        "Only if requested by management",
      ],
      correctAnswer: 2,
      explanation: "Deviations should be reported immediately when discovered to ensure timely investigation and resolution."
    },
    {
      id: "3",
      question: "What is the primary goal of CAPA?",
      options: [
        "To punish employees",
        "To prevent recurrence of problems",
        "To increase documentation",
        "To slow down production",
      ],
      correctAnswer: 1,
      explanation: "The primary goal of CAPA is to prevent recurrence of problems through systematic investigation and corrective actions."
    },
    {
      id: "4",
      question: "What is the first step in a CAPA process?",
      options: [
        "Implementing solutions",
        "Identifying the problem",
        "Writing a report",
        "Assigning blame",
      ],
      correctAnswer: 1,
      explanation: "The first step in a CAPA process is identifying the problem or deviation that needs to be addressed."
    },
    {
      id: "5",
      question: "How should CAPA effectiveness be measured?",
      options: [
        "By the number of reports filed",
        "By the reduction in similar deviations",
        "By the cost savings achieved",
        "By the time taken to complete",
      ],
      correctAnswer: 1,
      explanation: "CAPA effectiveness is measured by the reduction in similar deviations, indicating successful problem resolution."
    }
  ],
  "data-integrity": [
    {
      id: "1",
      question: "What does ALCOA+ stand for?",
      options: [
        "Attributable, Legible, Contemporaneous, Original, Accurate",
        "Accurate, Lasting, Complete, Original, Available",
        "Attributable, Legible, Complete, Original, Accessible",
        "Available, Lasting, Contemporaneous, Original, Accurate",
      ],
      correctAnswer: 0,
      explanation: "ALCOA+ stands for Attributable, Legible, Contemporaneous, Original, Accurate, plus Complete, Consistent, Enduring, and Available."
    },
    {
      id: "2",
      question: "What does 'Attributable' mean in data integrity?",
      options: [
        "Data must be signed",
        "Data must be traceable to the person who created it",
        "Data must be original",
        "Data must be accurate",
      ],
      correctAnswer: 1,
      explanation: "Attributable means data must be traceable to the person who created, modified, or deleted it."
    },
    {
      id: "3",
      question: "What is the purpose of audit trails in data integrity?",
      options: [
        "To track system performance",
        "To provide chronological record of data changes",
        "To monitor user activity",
        "To backup data automatically",
      ],
      correctAnswer: 1,
      explanation: "Audit trails provide a chronological record of data changes, ensuring traceability and accountability."
    },
    {
      id: "4",
      question: "Which principle ensures data cannot be altered without detection?",
      options: [
        "Attributable",
        "Legible",
        "Contemporaneous",
        "Original",
      ],
      correctAnswer: 3,
      explanation: "The Original principle ensures data cannot be altered without detection, maintaining data integrity."
    },
    {
      id: "5",
      question: "What is the 'Complete' principle in ALCOA+?",
      options: [
        "All data must be perfect",
        "All data must be available",
        "All data must be included without gaps",
        "All data must be signed",
      ],
      correctAnswer: 2,
      explanation: "The Complete principle ensures all data is included without gaps, maintaining a comprehensive record."
    }
  ],
  "validation-basics": [
    {
      id: "1",
      question: "What is the purpose of computer system validation?",
      options: [
        "To test system performance",
        "To ensure fitness for intended use",
        "To reduce costs",
        "To improve user interface",
      ],
      correctAnswer: 1,
      explanation: "Computer system validation ensures the system is fit for its intended use and meets regulatory requirements."
    },
    {
      id: "2",
      question: "What does GAMP stand for?",
      options: [
        "Good Automated Manufacturing Practice",
        "General Application Management Process",
        "Global Assessment and Monitoring Protocol",
        "Good Application Management Practice",
      ],
      correctAnswer: 0,
      explanation: "GAMP stands for Good Automated Manufacturing Practice, providing guidelines for computer system validation."
    },
    {
      id: "3",
      question: "What is the V-Model in validation?",
      options: [
        "A visual representation of validation steps",
        "A mathematical model for validation",
        "A software development methodology",
        "A testing framework",
      ],
      correctAnswer: 0,
      explanation: "The V-Model is a visual representation of validation steps, showing the relationship between requirements and testing."
    },
    {
      id: "4",
      question: "What is User Acceptance Testing (UAT)?",
      options: [
        "Testing by developers",
        "Testing by end users in their environment",
        "Testing by quality assurance",
        "Testing by system administrators",
      ],
      correctAnswer: 1,
      explanation: "User Acceptance Testing is performed by end users in their actual environment to ensure the system meets their needs."
    },
    {
      id: "5",
      question: "What is the final step in the validation lifecycle?",
      options: [
        "System retirement",
        "Ongoing monitoring and maintenance",
        "Documentation completion",
        "User training",
      ],
      correctAnswer: 1,
      explanation: "Ongoing monitoring and maintenance is the final step in the validation lifecycle, ensuring continued compliance."
    }
  ]
};

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user,
    getModuleById,
    getUserProgress,
    updateProgress,
    completeModule,
    addAuditLog,
  } = useStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const module = id ? getModuleById(id) : null;
  const progress = user && id ? getUserProgress(user.id, id) : null;
  const questions = id ? QUIZ_QUESTIONS[id] || [] : [];

  // Timer effect
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults]);

  if (!module || !user || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="gxp-card max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quiz Not Available</h2>
          <p className="text-muted-foreground mb-4">
            This module doesn't have a quiz or the quiz is not available.
          </p>
          <Button onClick={() => navigate("/catalog")} className="gxp-button-primary">
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Calculate score
    let correct = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setShowResults(true);

    // Update attempts and score
    const newAttempts = (progress?.attempts || 0) + 1;

    // Add audit log
    addAuditLog('quiz_attempt', user.id, id!, `Quiz attempted with score: ${score}%`);

    if (score >= 70) {
      // Pass
      completeModule(user.id, id!, score);
      toast({
        title: "🎉 Congratulations!",
        description: `Module Complete! You scored ${score}% and passed the assessment.`,
      });
      
      // Redirect to next module or catalog after a delay
      setTimeout(() => {
        if (module.requiresSignature) {
          navigate(`/module/${id}/signature`);
        } else {
          navigate("/catalog");
        }
      }, 3000);
    } else {
      // Fail
      updateProgress(user.id, id!, progress?.progress || 0);

      if (newAttempts >= 3) {
        toast({
          title: "⚠️ Training Escalated",
          description: "Multiple failed attempts. This has been escalated to your supervisor.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Quiz Failed",
          description: `You scored ${score}%. You have ${3 - newAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
    }
    
    setIsSubmitting(false);
  };

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQ?.id] !== undefined;
  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;

  if (showResults) {
    const passed = quizScore >= 70;
    const attemptsRemaining = 3 - ((progress?.attempts || 0) + 1);

    return (
      <div className="space-y-6">
        <Card className="gxp-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <div className="relative">
                  <Trophy className="h-16 w-16 text-yellow-500" />
                  <CheckCircle2 className="h-8 w-8 text-green-600 absolute -top-2 -right-2" />
                </div>
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle
              className={`text-3xl font-bold ${
                passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {passed ? "🎉 Assessment Passed!" : "❌ Assessment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold text-foreground">
                {quizScore}%
              </div>
              <div className="flex justify-center gap-4">
                <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {passed ? "PASSED" : "FAILED"}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {questions.length} Questions
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                {passed 
                  ? "Excellent work! You have successfully completed this module."
                  : `You need 70% to pass. Keep studying and try again!`
                }
              </p>
            </div>

            {passed ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Module Complete!</span>
                  </div>
                  <p className="text-green-600 mt-1">
                    You have successfully completed the {module.title} assessment.
                  </p>
                </div>
                
                {module.requiresSignature ? (
                  <Button
                    onClick={() => navigate(`/module/${id}/signature`)}
                    className="gxp-button-primary text-lg px-8 py-3"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Proceed to Digital Signature
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/catalog")}
                    className="gxp-button-primary text-lg px-8 py-3"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Continue to Next Module
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {attemptsRemaining > 0 ? (
                  <>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">Attempts Remaining</span>
                      </div>
                      <p className="text-orange-600 mt-1">
                        You have {attemptsRemaining} attempts remaining.
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => navigate(`/module/${id}`)}
                        variant="outline"
                        className="px-6 py-2"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review Material
                      </Button>
                      <Button
                        onClick={() => window.location.reload()}
                        className="gxp-button-accent px-6 py-2"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Retry Quiz
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">Escalated to Supervisor</span>
                      </div>
                      <p className="text-red-600 mt-1">
                        Multiple failed attempts. This has been escalated to your supervisor for review.
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/catalog")}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      Return to Catalog
                    </Button>
                  </>
                )}
              </div>
            )}
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
          <h1 className="text-3xl font-bold text-foreground">
            {module.title} - Assessment
          </h1>
          <p className="text-muted-foreground text-lg">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="gxp-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length} of {questions.length} answered
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="gxp-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
            <Badge variant="outline">
              {Math.round((currentQuestion + 1) / questions.length * 100)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-xl font-medium leading-relaxed">{currentQ.question}</h2>

          <RadioGroup
            value={answers[currentQ.id]?.toString()}
            onValueChange={(value) =>
              handleAnswerSelect(currentQ.id, parseInt(value))
            }
            className="space-y-3"
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                  className="h-5 w-5"
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-base leading-relaxed"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="gxp-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                {Object.keys(answers).length} of {questions.length} answered
              </div>
              <div className="text-xs text-muted-foreground">
                Passing score: 70%
              </div>
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length || isSubmitting}
                className="gxp-button-primary px-8 py-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="gxp-button-primary px-6 py-2"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Info */}
      <Card className="gxp-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Passing Score: 70%</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Maximum Attempts: 3</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              <span>Review answers before submitting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

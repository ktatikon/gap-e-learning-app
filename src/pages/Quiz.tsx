import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QUIZ_QUESTIONS: Record<string, Question[]> = {
  'gmp-fundamentals': [
    {
      id: '1',
      question: 'What does GMP stand for?',
      options: [
        'Good Manufacturing Practices',
        'General Medical Procedures',
        'Global Marketing Principles',
        'Guaranteed Material Purity'
      ],
      correctAnswer: 0
    },
    {
      id: '2',
      question: 'Which of the following is a key principle of GMP?',
      options: [
        'Cost reduction',
        'Quality assurance',
        'Speed of production',
        'Market expansion'
      ],
      correctAnswer: 1
    },
    {
      id: '3',
      question: 'How often should GMP training be refreshed?',
      options: [
        'Every 5 years',
        'Once only',
        'Annually or as needed',
        'Only when regulations change'
      ],
      correctAnswer: 2
    }
  ],
  'deviations-capa': [
    {
      id: '1',
      question: 'What does CAPA stand for?',
      options: [
        'Corrective and Preventive Action',
        'Compliance and Process Assessment',
        'Control and Prevention Activities',
        'Continuous Analysis and Process Audit'
      ],
      correctAnswer: 0
    },
    {
      id: '2',
      question: 'When should a deviation be reported?',
      options: [
        'Only if it affects product quality',
        'At the end of the month',
        'Immediately when discovered',
        'Only if requested by management'
      ],
      correctAnswer: 2
    },
    {
      id: '3',
      question: 'What is the primary goal of CAPA?',
      options: [
        'To punish employees',
        'To prevent recurrence of problems',
        'To increase documentation',
        'To slow down production'
      ],
      correctAnswer: 1
    }
  ]
};

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getModuleById, getUserProgress, updateProgress, completeModule } = useStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const module = id ? getModuleById(id) : null;
  const progress = user && id ? getUserProgress(user.id, id) : null;
  const questions = id ? QUIZ_QUESTIONS[id] || [] : [];

  if (!module || !user || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Quiz not available</h2>
        <Button onClick={() => navigate('/catalog')} className="mt-4">
          Back to Catalog
        </Button>
      </div>
    );
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
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

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setShowResults(true);

    // Update attempts and score
    const newAttempts = (progress?.attempts || 0) + 1;
    
    if (score >= 60) {
      // Pass
      completeModule(user.id, id!, score);
      toast({
        title: "Congratulations!",
        description: `Pass – Module Complete! Score: ${score}%`,
      });
    } else {
      // Fail
      updateProgress(user.id, id!, progress?.progress || 0);
      
      if (newAttempts >= 3) {
        toast({
          title: "Training Escalated",
          description: "Escalated to Supervisor due to multiple failed attempts.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Quiz Failed",
          description: `You have ${3 - newAttempts} attempts remaining. Score: ${score}%`,
          variant: "destructive",
        });
      }
    }
  };

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQ?.id] !== undefined;

  if (showResults) {
    const passed = quizScore >= 60;
    const attemptsRemaining = 3 - ((progress?.attempts || 0) + 1);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className={`text-2xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-foreground">{quizScore}%</div>
            <p className="text-muted-foreground">
              You scored {quizScore}% on this quiz. {passed ? 'Passing score is 60%.' : `You need 60% to pass.`}
            </p>
            
            {passed ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">Module Complete!</p>
                {module.requiresSignature ? (
                  <Button 
                    onClick={() => navigate(`/module/${id}/signature`)}
                    className="gxp-button-primary"
                  >
                    Proceed to Digital Signature
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/catalog')}
                    className="gxp-button-primary"
                  >
                    Return to Catalog
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {attemptsRemaining > 0 ? (
                  <>
                    <p className="text-orange-600">
                      You have {attemptsRemaining} attempts remaining.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={() => navigate(`/module/${id}`)}
                        variant="outline"
                      >
                        Review Material
                      </Button>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="gxp-button-accent"
                      >
                        Retry Quiz
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-red-600 font-medium">
                      Escalated to Supervisor.
                    </p>
                    <Button 
                      onClick={() => navigate('/catalog')}
                      variant="outline"
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
          <h1 className="text-2xl font-bold text-foreground">{module.title} - Quiz</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-lg font-medium">{currentQ.question}</h2>
          
          <RadioGroup
            value={answers[currentQ.id]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground self-center">
              {Object.keys(answers).length} of {questions.length} answered
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                className="gxp-button-primary"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="gxp-button-primary"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Info */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>• Passing score: 60%</p>
          <p>• Maximum attempts: 3</p>
          <p>• You can review your answers before submitting</p>
        </CardContent>
      </Card>
    </div>
  );
}
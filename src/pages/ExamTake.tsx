import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  X
} from "lucide-react";

const sampleQuestions = [
  {
    id: 1,
    question: "বাংলাদেশের স্বাধীনতা দিবস কবে পালিত হয়?",
    options: ["২১ ফেব্রুয়ারি", "২৬ মার্চ", "১৬ ডিসেম্বর", "১৪ এপ্রিল"],
    correct: 1,
  },
  {
    id: 2,
    question: "পদ্মা সেতুর মোট দৈর্ঘ্য কত?",
    options: ["৬.১৫ কি.মি.", "৫.২০ কি.মি.", "৭.১০ কি.মি.", "৪.৮০ কি.মি."],
    correct: 0,
  },
  {
    id: 3,
    question: "'অপরাজেয় বাংলা' ভাস্কর্যের শিল্পী কে?",
    options: ["জয়নুল আবেদীন", "সৈয়দ আবদুল্লাহ খালিদ", "কামরুল হাসান", "হামিদুর রহমান"],
    correct: 1,
  },
  {
    id: 4,
    question: "বাংলাদেশের জাতীয় ফুল কোনটি?",
    options: ["গোলাপ", "শাপলা", "জুঁই", "বেলি"],
    correct: 1,
  },
  {
    id: 5,
    question: "কোন নদী বাংলাদেশের দীর্ঘতম?",
    options: ["পদ্মা", "মেঘনা", "যমুনা", "ব্রহ্মপুত্র"],
    correct: 3,
  },
  {
    id: 6,
    question: "বাংলাদেশের মুক্তিযুদ্ধ কত দিন স্থায়ী হয়েছিল?",
    options: ["৯ মাস", "১০ মাস", "৮ মাস", "১১ মাস"],
    correct: 0,
  },
  {
    id: 7,
    question: "বাংলাদেশের জাতীয় পতাকার ডিজাইনার কে?",
    options: ["কামরুল হাসান", "শিব নারায়ণ দাস", "জয়নুল আবেদীন", "পটুয়া কামরুল হাসান"],
    correct: 0,
  },
  {
    id: 8,
    question: "'সোনার বাংলা' কবিতাটি কে লিখেছেন?",
    options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জসীম উদ্দীন", "মাইকেল মধুসূদন দত্ত"],
    correct: 1,
  },
  {
    id: 9,
    question: "বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?",
    options: ["কেওক্রাডং", "তাজিংডং", "সাকা হাফং", "মোদক মুয়াল"],
    correct: 2,
  },
  {
    id: 10,
    question: "বাংলাদেশের মোট জেলার সংখ্যা কত?",
    options: ["৬২", "৬৪", "৬৬", "৬৮"],
    correct: 1,
  },
];

const ExamTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const toggleFlag = () => {
    if (flagged.includes(currentQuestion)) {
      setFlagged(flagged.filter((f) => f !== currentQuestion));
    } else {
      setFlagged([...flagged, currentQuestion]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowSubmitDialog(false);
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuestions.forEach((q, index) => {
      if (answers[index] === q.correct) correct++;
    });
    return correct;
  };

  const progress = (Object.keys(answers).length / sampleQuestions.length) * 100;

  if (isSubmitted) {
    const score = calculateScore();
    const percentage = (score / sampleQuestions.length) * 100;
    
    return (
      <div className="min-h-screen bg-background font-bengali flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            percentage >= 80 ? "bg-green-100" : percentage >= 50 ? "bg-yellow-100" : "bg-red-100"
          }`}>
            {percentage >= 80 ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">পরীক্ষা শেষ!</h1>
          <p className="text-muted-foreground mb-6">তোমার ফলাফল দেখো</p>
          
          <div className="bg-muted rounded-xl p-6 mb-6">
            <p className="text-4xl font-bold text-primary mb-2">{score}/{sampleQuestions.length}</p>
            <p className="text-muted-foreground">সঠিক উত্তর</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold text-green-600">{score}</p>
                <p className="text-muted-foreground">সঠিক</p>
              </div>
              <div>
                <p className="font-bold text-red-600">{Object.keys(answers).length - score}</p>
                <p className="text-muted-foreground">ভুল</p>
              </div>
              <div>
                <p className="font-bold text-gray-600">{sampleQuestions.length - Object.keys(answers).length}</p>
                <p className="text-muted-foreground">এড়িয়ে গেছ</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/question-bank")}>
              আরো প্র্যাকটিস
            </Button>
            <Button variant="hero" className="flex-1" onClick={() => navigate("/leaderboard")}>
              লিডারবোর্ড
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bengali">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-medium">মডেল টেস্ট #{id}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>

            <Button variant="hero" onClick={() => setShowSubmitDialog(true)}>
              সাবমিট করো
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Question Card */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                প্রশ্ন {currentQuestion + 1}/{sampleQuestions.length}
              </Badge>
              <Button
                variant={flagged.includes(currentQuestion) ? "hero" : "outline"}
                size="sm"
                onClick={toggleFlag}
              >
                <Flag className="w-4 h-4 mr-1" />
                {flagged.includes(currentQuestion) ? "মার্ক করা" : "মার্ক করো"}
              </Button>
            </div>

            <h2 className="text-xl md:text-2xl font-medium text-foreground mb-8">
              {sampleQuestions[currentQuestion].question}
            </h2>

            <div className="space-y-4">
              {sampleQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      answers[currentQuestion] === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-card rounded-2xl border border-border p-4 mt-4">
            <p className="text-sm text-muted-foreground mb-3">প্রশ্ন নেভিগেটর</p>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    currentQuestion === index
                      ? "bg-primary text-primary-foreground"
                      : answers[index] !== undefined
                      ? "bg-green-100 text-green-700"
                      : flagged.includes(index)
                      ? "bg-orange-100 text-orange-700"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100" /> উত্তর দেওয়া
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-100" /> মার্ক করা
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-muted" /> বাকি আছে
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              পূর্ববর্তী
            </Button>
            <Button
              variant="hero"
              onClick={() =>
                setCurrentQuestion(Math.min(sampleQuestions.length - 1, currentQuestion + 1))
              }
              disabled={currentQuestion === sampleQuestions.length - 1}
            >
              পরবর্তী
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </footer>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-foreground mb-2">পরীক্ষা সাবমিট করবে?</h3>
            <p className="text-muted-foreground mb-4">
              তুমি {Object.keys(answers).length}/{sampleQuestions.length} টি প্রশ্নের উত্তর দিয়েছ।
              {sampleQuestions.length - Object.keys(answers).length > 0 && (
                <span className="text-orange-600 block mt-1">
                  {sampleQuestions.length - Object.keys(answers).length} টি প্রশ্ন এড়িয়ে গেছ!
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSubmitDialog(false)}>
                ফিরে যাও
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleSubmit}>
                সাবমিট করো
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTake;

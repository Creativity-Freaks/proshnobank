import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  X,
  MinusCircle
} from "lucide-react";

interface ExamConfig {
  category: string;
  subjects: string[];
  topics: Record<string, string[]>;
  questionCount: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarking: number;
  difficulty: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  subject?: string;
  topic?: string;
  difficulty?: string;
}

// Extended mock questions pool for random selection
const questionPool: Question[] = [
  { id: 1, question: "বাংলাদেশের স্বাধীনতা দিবস কবে পালিত হয়?", options: ["২১ ফেব্রুয়ারি", "২৬ মার্চ", "১৬ ডিসেম্বর", "১৪ এপ্রিল"], correct: 1, subject: "gk", topic: "bangladesh", difficulty: "easy" },
  { id: 2, question: "পদ্মা সেতুর মোট দৈর্ঘ্য কত?", options: ["৬.১৫ কি.মি.", "৫.২০ কি.মি.", "৭.১০ কি.মি.", "৪.৮০ কি.মি."], correct: 0, subject: "gk", topic: "bangladesh", difficulty: "medium" },
  { id: 3, question: "'অপরাজেয় বাংলা' ভাস্কর্যের শিল্পী কে?", options: ["জয়নুল আবেদীন", "সৈয়দ আবদুল্লাহ খালিদ", "কামরুল হাসান", "হামিদুর রহমান"], correct: 1, subject: "gk", topic: "bangladesh", difficulty: "medium" },
  { id: 4, question: "বাংলাদেশের জাতীয় ফুল কোনটি?", options: ["গোলাপ", "শাপলা", "জুঁই", "বেলি"], correct: 1, subject: "gk", topic: "bangladesh", difficulty: "easy" },
  { id: 5, question: "কোন নদী বাংলাদেশের দীর্ঘতম?", options: ["পদ্মা", "মেঘনা", "যমুনা", "ব্রহ্মপুত্র"], correct: 3, subject: "gk", topic: "bangladesh", difficulty: "medium" },
  { id: 6, question: "বাংলাদেশের মুক্তিযুদ্ধ কত দিন স্থায়ী হয়েছিল?", options: ["৯ মাস", "১০ মাস", "৮ মাস", "১১ মাস"], correct: 0, subject: "gk", topic: "bangladesh", difficulty: "easy" },
  { id: 7, question: "বাংলাদেশের জাতীয় পতাকার ডিজাইনার কে?", options: ["কামরুল হাসান", "শিব নারায়ণ দাস", "জয়নুল আবেদীন", "পটুয়া কামরুল হাসান"], correct: 0, subject: "gk", topic: "bangladesh", difficulty: "medium" },
  { id: 8, question: "'সোনার বাংলা' কবিতাটি কে লিখেছেন?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জসীম উদ্দীন", "মাইকেল মধুসূদন দত্ত"], correct: 1, subject: "bangla", topic: "literature", difficulty: "easy" },
  { id: 9, question: "বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?", options: ["কেওক্রাডং", "তাজিংডং", "সাকা হাফং", "মোদক মুয়াল"], correct: 2, subject: "gk", topic: "bangladesh", difficulty: "hard" },
  { id: 10, question: "বাংলাদেশের মোট জেলার সংখ্যা কত?", options: ["৬২", "৬৪", "৬৬", "৬৮"], correct: 1, subject: "gk", topic: "bangladesh", difficulty: "easy" },
  { id: 11, question: "F = ma সূত্রটি কার?", options: ["আইনস্টাইন", "নিউটন", "গ্যালিলিও", "আর্কিমিডিস"], correct: 1, subject: "physics", topic: "mechanics", difficulty: "easy" },
  { id: 12, question: "আলোর বেগ কত?", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: 0, subject: "physics", topic: "optics", difficulty: "easy" },
  { id: 13, question: "পানির সংকেত কী?", options: ["H₂O", "CO₂", "NaCl", "H₂SO₄"], correct: 0, subject: "chemistry", topic: "inorganic", difficulty: "easy" },
  { id: 14, question: "DNA এর পূর্ণরূপ কী?", options: ["Deoxyribonucleic Acid", "Dinucleic Acid", "Double Nuclear Acid", "Data Nuclear Acid"], correct: 0, subject: "biology", topic: "genetics", difficulty: "easy" },
  { id: 15, question: "সালোকসংশ্লেষণে কোন গ্যাস উৎপন্ন হয়?", options: ["CO₂", "O₂", "N₂", "H₂"], correct: 1, subject: "biology", topic: "botany", difficulty: "easy" },
  { id: 16, question: "Which is correct?", options: ["He go to school", "He goes to school", "He going to school", "He gone to school"], correct: 1, subject: "english", topic: "grammar", difficulty: "easy" },
  { id: 17, question: "'Abandon' এর অর্থ কী?", options: ["গ্রহণ করা", "পরিত্যাগ করা", "সম্মান করা", "প্রশংসা করা"], correct: 1, subject: "english", topic: "vocabulary", difficulty: "medium" },
  { id: 18, question: "x² - 4 = 0 হলে x = ?", options: ["±2", "±4", "2", "4"], correct: 0, subject: "math", topic: "algebra", difficulty: "easy" },
  { id: 19, question: "ত্রিভুজের তিন কোণের সমষ্টি কত?", options: ["90°", "180°", "270°", "360°"], correct: 1, subject: "math", topic: "geometry", difficulty: "easy" },
  { id: 20, question: "sin 90° = ?", options: ["0", "1", "-1", "∞"], correct: 1, subject: "math", topic: "trigonometry", difficulty: "easy" },
  { id: 21, question: "CPU এর পূর্ণরূপ কী?", options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"], correct: 0, subject: "computer", topic: "basics", difficulty: "easy" },
  { id: 22, question: "১ কিলোবাইট = কত বাইট?", options: ["1000", "1024", "100", "10000"], correct: 1, subject: "computer", topic: "basics", difficulty: "easy" },
  { id: 23, question: "বঙ্গবন্ধু স্যাটেলাইট-১ কবে উৎক্ষেপণ করা হয়?", options: ["২০১৭", "২০১৮", "২০১৯", "২০২০"], correct: 1, subject: "gk", topic: "bangladesh", difficulty: "medium" },
  { id: 24, question: "জাতিসংঘের সদর দপ্তর কোথায়?", options: ["জেনেভা", "নিউইয়র্ক", "লন্ডন", "প্যারিস"], correct: 1, subject: "gk", topic: "international", difficulty: "easy" },
  { id: 25, question: "বিশ্ব স্বাস্থ্য সংস্থার সদর দপ্তর কোথায়?", options: ["জেনেভা", "নিউইয়র্ক", "রোম", "প্যারিস"], correct: 0, subject: "gk", topic: "international", difficulty: "medium" },
  { id: 26, question: "পর্যায় সারণিতে মোট মৌল কয়টি?", options: ["108", "118", "128", "100"], correct: 1, subject: "chemistry", topic: "inorganic", difficulty: "medium" },
  { id: 27, question: "ক্যালকুলাসের জনক কে?", options: ["নিউটন", "আইনস্টাইন", "পিথাগোরাস", "ইউক্লিড"], correct: 0, subject: "math", topic: "calculus", difficulty: "medium" },
  { id: 28, question: "তাপগতিবিদ্যার প্রথম সূত্র কী নিয়ে?", options: ["শক্তির সংরক্ষণ", "এনট্রপি", "চাপ", "আয়তন"], correct: 0, subject: "physics", topic: "thermodynamics", difficulty: "hard" },
  { id: 29, question: "বাংলা ব্যাকরণে কত প্রকার বাক্য?", options: ["২", "৩", "৪", "৫"], correct: 1, subject: "bangla", topic: "grammar", difficulty: "easy" },
  { id: 30, question: "'কাজী নজরুল ইসলাম' কে কী উপাধি দেওয়া হয়?", options: ["কবিগুরু", "বিদ্রোহী কবি", "পল্লীকবি", "রূপসী বাংলার কবি"], correct: 1, subject: "bangla", topic: "literature", difficulty: "easy" },
];

const ExamTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get config from navigation state or use defaults
  const config: ExamConfig = location.state?.config || {
    category: "general",
    subjects: [],
    topics: {},
    questionCount: 10,
    duration: 30,
    marksPerQuestion: 1,
    negativeMarking: 0,
    difficulty: "all",
  };

  // Generate questions based on config
  const questions = useMemo(() => {
    let filteredQuestions = [...questionPool];

    // Filter by subjects if specified
    if (config.subjects.length > 0) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.subject && config.subjects.includes(q.subject)
      );
    }

    // Filter by difficulty if not "all"
    if (config.difficulty !== "all") {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.difficulty === config.difficulty
      );
    }

    // Shuffle and pick required number
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
  }, [config]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
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
    let wrong = 0;
    
    questions.forEach((q, index) => {
      if (answers[index] !== undefined) {
        if (answers[index] === q.correct) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const positiveMarks = correct * config.marksPerQuestion;
    const negativeMarks = wrong * config.negativeMarking;
    const totalMarks = positiveMarks - negativeMarks;

    return { correct, wrong, skipped: questions.length - Object.keys(answers).length, totalMarks, positiveMarks, negativeMarks };
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const totalPossibleMarks = questions.length * config.marksPerQuestion;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background font-bengali flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">প্রশ্ন পাওয়া যায়নি</h1>
          <p className="text-muted-foreground mb-6">
            তোমার সিলেক্ট করা বিষয়/টপিক অনুযায়ী কোনো প্রশ্ন পাওয়া যায়নি। অন্য বিষয় সিলেক্ট করে আবার চেষ্টা করো।
          </p>
          <Button variant="hero" onClick={() => navigate(-1)}>
            ফিরে যাও
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const { correct, wrong, skipped, totalMarks, positiveMarks, negativeMarks } = calculateScore();
    const percentage = (totalMarks / totalPossibleMarks) * 100;
    
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
            <p className="text-4xl font-bold text-primary mb-2">
              {totalMarks.toFixed(2)}/{totalPossibleMarks}
            </p>
            <p className="text-muted-foreground">মোট মার্কস</p>
            <p className="text-sm text-muted-foreground mt-1">
              ({percentage.toFixed(1)}%)
            </p>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold text-green-600">{correct}</p>
                <p className="text-muted-foreground">সঠিক</p>
                <p className="text-xs text-green-600">+{positiveMarks}</p>
              </div>
              <div>
                <p className="font-bold text-red-600">{wrong}</p>
                <p className="text-muted-foreground">ভুল</p>
                {config.negativeMarking > 0 && (
                  <p className="text-xs text-red-600">-{negativeMarks.toFixed(2)}</p>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-600">{skipped}</p>
                <p className="text-muted-foreground">এড়িয়ে গেছ</p>
                <p className="text-xs text-gray-500">০</p>
              </div>
            </div>

            {config.negativeMarking > 0 && (
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MinusCircle className="w-4 h-4 text-destructive" />
                নেগেটিভ মার্কিং: -{config.negativeMarking} প্রতি ভুল উত্তরে
              </div>
            )}
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
                <span className="font-medium">
                  {id === "custom" ? "কাস্টম এক্সাম" : `মডেল টেস্ট #${id}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {config.negativeMarking > 0 && (
                <Badge variant="destructive" className="hidden sm:flex items-center gap-1">
                  <MinusCircle className="w-3 h-3" />
                  -{config.negativeMarking}
                </Badge>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
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
                প্রশ্ন {currentQuestion + 1}/{questions.length}
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
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
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
              {questions.map((_, index) => (
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
                setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))
              }
              disabled={currentQuestion === questions.length - 1}
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
              তুমি {Object.keys(answers).length}/{questions.length} টি প্রশ্নের উত্তর দিয়েছ।
              {questions.length - Object.keys(answers).length > 0 && (
                <span className="text-orange-600 block mt-1">
                  {questions.length - Object.keys(answers).length} টি প্রশ্ন এড়িয়ে গেছ!
                </span>
              )}
            </p>
            {config.negativeMarking > 0 && (
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-destructive" />
                নেগেটিভ মার্কিং সক্রিয়: -{config.negativeMarking} প্রতি ভুল উত্তরে
              </p>
            )}
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

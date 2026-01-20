import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Award,
  MinusCircle,
  Settings,
  Play,
  ChevronRight,
  Layers,
  Target,
} from "lucide-react";

// Mock data - will be replaced with DB data
const categorySubjects: Record<string, { id: string; name: string; topics: { id: string; name: string }[] }[]> = {
  medical: [
    { id: "physics", name: "পদার্থবিজ্ঞান", topics: [
      { id: "mechanics", name: "বলবিদ্যা" },
      { id: "waves", name: "তরঙ্গ" },
      { id: "optics", name: "আলোকবিজ্ঞান" },
      { id: "electricity", name: "তড়িৎ" },
    ]},
    { id: "chemistry", name: "রসায়ন", topics: [
      { id: "organic", name: "জৈব রসায়ন" },
      { id: "inorganic", name: "অজৈব রসায়ন" },
      { id: "physical", name: "ভৌত রসায়ন" },
    ]},
    { id: "biology", name: "জীববিজ্ঞান", topics: [
      { id: "botany", name: "উদ্ভিদবিদ্যা" },
      { id: "zoology", name: "প্রাণিবিদ্যা" },
      { id: "genetics", name: "জেনেটিক্স" },
    ]},
    { id: "english", name: "ইংরেজি", topics: [
      { id: "grammar", name: "Grammar" },
      { id: "vocabulary", name: "Vocabulary" },
    ]},
    { id: "gk", name: "সাধারণ জ্ঞান", topics: [
      { id: "bangladesh", name: "বাংলাদেশ" },
      { id: "international", name: "আন্তর্জাতিক" },
    ]},
  ],
  engineering: [
    { id: "physics", name: "পদার্থবিজ্ঞান", topics: [
      { id: "mechanics", name: "বলবিদ্যা" },
      { id: "waves", name: "তরঙ্গ" },
      { id: "thermodynamics", name: "তাপগতিবিদ্যা" },
    ]},
    { id: "chemistry", name: "রসায়ন", topics: [
      { id: "organic", name: "জৈব রসায়ন" },
      { id: "inorganic", name: "অজৈব রসায়ন" },
    ]},
    { id: "math", name: "গণিত", topics: [
      { id: "algebra", name: "বীজগণিত" },
      { id: "calculus", name: "ক্যালকুলাস" },
      { id: "trigonometry", name: "ত্রিকোণমিতি" },
    ]},
    { id: "english", name: "ইংরেজি", topics: [
      { id: "grammar", name: "Grammar" },
      { id: "vocabulary", name: "Vocabulary" },
    ]},
  ],
  ssc: [
    { id: "bangla", name: "বাংলা", topics: [
      { id: "grammar", name: "ব্যাকরণ" },
      { id: "literature", name: "সাহিত্য" },
    ]},
    { id: "english", name: "ইংরেজি", topics: [
      { id: "grammar", name: "Grammar" },
      { id: "composition", name: "Composition" },
    ]},
    { id: "math", name: "গণিত", topics: [
      { id: "algebra", name: "বীজগণিত" },
      { id: "geometry", name: "জ্যামিতি" },
    ]},
    { id: "science", name: "বিজ্ঞান", topics: [
      { id: "physics", name: "পদার্থ" },
      { id: "chemistry", name: "রসায়ন" },
      { id: "biology", name: "জীববিজ্ঞান" },
    ]},
    { id: "gk", name: "সাধারণ জ্ঞান", topics: [
      { id: "bangladesh", name: "বাংলাদেশ" },
      { id: "current", name: "সাম্প্রতিক" },
    ]},
  ],
  hsc: [
    { id: "bangla", name: "বাংলা", topics: [
      { id: "grammar", name: "ব্যাকরণ" },
      { id: "literature", name: "সাহিত্য" },
    ]},
    { id: "english", name: "ইংরেজি", topics: [
      { id: "grammar", name: "Grammar" },
      { id: "literature", name: "Literature" },
    ]},
    { id: "ict", name: "ICT", topics: [
      { id: "programming", name: "প্রোগ্রামিং" },
      { id: "database", name: "ডাটাবেজ" },
    ]},
  ],
  university: [
    { id: "bangla", name: "বাংলা", topics: [
      { id: "grammar", name: "ব্যাকরণ" },
      { id: "literature", name: "সাহিত্য" },
    ]},
    { id: "english", name: "ইংরেজি", topics: [
      { id: "grammar", name: "Grammar" },
      { id: "vocabulary", name: "Vocabulary" },
    ]},
    { id: "math", name: "গণিত", topics: [
      { id: "algebra", name: "বীজগণিত" },
      { id: "arithmetic", name: "পাটিগণিত" },
    ]},
    { id: "gk", name: "সাধারণ জ্ঞান", topics: [
      { id: "bangladesh", name: "বাংলাদেশ" },
      { id: "international", name: "আন্তর্জাতিক" },
    ]},
    { id: "iq", name: "বুদ্ধিমত্তা", topics: [
      { id: "verbal", name: "Verbal" },
      { id: "analytical", name: "Analytical" },
    ]},
  ],
  job: [
    { id: "bangla", name: "বাংলা", topics: [
      { id: "grammar", name: "ব্যাকরণ" },
      { id: "literature", name: "সাহিত্য" },
    ]},
    { id: "english", name: "ইংরেজি", topics: [
      { id: "grammar", name: "Grammar" },
      { id: "vocabulary", name: "Vocabulary" },
    ]},
    { id: "math", name: "গণিত", topics: [
      { id: "arithmetic", name: "পাটিগণিত" },
      { id: "algebra", name: "বীজগণিত" },
    ]},
    { id: "gk", name: "সাধারণ জ্ঞান", topics: [
      { id: "bangladesh", name: "বাংলাদেশ বিষয়াবলী" },
      { id: "international", name: "আন্তর্জাতিক বিষয়াবলী" },
      { id: "current", name: "সাম্প্রতিক" },
    ]},
    { id: "computer", name: "কম্পিউটার", topics: [
      { id: "basics", name: "বেসিক" },
      { id: "ms-office", name: "MS Office" },
    ]},
  ],
};

const difficultyLevels = [
  { id: "easy", name: "সহজ" },
  { id: "medium", name: "মাঝারি" },
  { id: "hard", name: "কঠিন" },
  { id: "all", name: "সব" },
];

const categoryNames: Record<string, string> = {
  medical: "মেডিকেল",
  engineering: "ইঞ্জিনিয়ারিং",
  ssc: "SSC",
  hsc: "HSC",
  university: "বিশ্ববিদ্যালয়",
  job: "চাকরি",
};

const ExamSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "medical";
  
  const subjects = categorySubjects[category] || categorySubjects.medical;

  // Selected subjects and topics
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string[]>>({});

  // Exam configuration
  const [questionCount, setQuestionCount] = useState([25]);
  const [duration, setDuration] = useState([30]);
  const [marksPerQuestion, setMarksPerQuestion] = useState([1]);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false);
  const [negativeMarkValue, setNegativeMarkValue] = useState("0.25");
  const [difficulty, setDifficulty] = useState("all");

  const handleSubjectToggle = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subjectId));
      const newTopics = { ...selectedTopics };
      delete newTopics[subjectId];
      setSelectedTopics(newTopics);
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleTopicToggle = (subjectId: string, topicId: string) => {
    const currentTopics = selectedTopics[subjectId] || [];
    if (currentTopics.includes(topicId)) {
      setSelectedTopics({
        ...selectedTopics,
        [subjectId]: currentTopics.filter((t) => t !== topicId),
      });
    } else {
      setSelectedTopics({
        ...selectedTopics,
        [subjectId]: [...currentTopics, topicId],
      });
    }
  };

  const selectAllTopics = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject) {
      setSelectedTopics({
        ...selectedTopics,
        [subjectId]: subject.topics.map((t) => t.id),
      });
    }
  };

  const totalMarks = questionCount[0] * marksPerQuestion[0];

  const handleStartExam = () => {
    const config = {
      category,
      subjects: selectedSubjects,
      topics: selectedTopics,
      questionCount: questionCount[0],
      duration: duration[0],
      marksPerQuestion: marksPerQuestion[0],
      negativeMarking: negativeMarkingEnabled ? parseFloat(negativeMarkValue) : 0,
      difficulty,
    };
    
    // Navigate to exam with config in state
    navigate("/exam/custom/take", { state: { config } });
  };

  const canStart = selectedSubjects.length > 0;

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Settings className="w-5 h-5" />
              <span className="font-medium">কাস্টম এক্সাম সেটআপ</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {categoryNames[category]} - নিজের মতো করে সাজাও
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              বিষয়, টপিক, প্রশ্ন সংখ্যা, সময়, মার্কস - সব কিছু তোমার ইচ্ছামতো সেট করো এবং পরীক্ষা দাও
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Subject & Topic Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">বিষয় নির্বাচন</h2>
                    <p className="text-sm text-muted-foreground">যেসব বিষয় থেকে প্রশ্ন চাও সেগুলো সিলেক্ট করো</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`border rounded-xl transition-all ${
                        selectedSubjects.includes(subject.id)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={() => handleSubjectToggle(subject.id)}
                          />
                          <span className="font-medium text-foreground">{subject.name}</span>
                        </div>
                        {selectedSubjects.includes(subject.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllTopics(subject.id);
                            }}
                          >
                            সব সিলেক্ট
                          </Button>
                        )}
                      </div>

                      {/* Topics */}
                      {selectedSubjects.includes(subject.id) && (
                        <div className="px-4 pb-4">
                          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                            <Layers className="w-4 h-4" />
                            <span>টপিক নির্বাচন (ঐচ্ছিক)</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {subject.topics.map((topic) => (
                              <button
                                key={topic.id}
                                onClick={() => handleTopicToggle(subject.id, topic.id)}
                                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                                  (selectedTopics[subject.id] || []).includes(topic.id)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {topic.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">কঠিনতার মাত্রা</h2>
                    <p className="text-sm text-muted-foreground">কোন লেভেলের প্রশ্ন চাও?</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setDifficulty(level.id)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        difficulty === level.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Configuration Panel */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  এক্সাম সেটিংস
                </h2>

                {/* Question Count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      প্রশ্ন সংখ্যা
                    </Label>
                    <span className="text-xl font-bold text-primary">{questionCount[0]}</span>
                  </div>
                  <Slider
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>৫</span>
                    <span>১০০</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      সময় (মিনিট)
                    </Label>
                    <span className="text-xl font-bold text-primary">{duration[0]}</span>
                  </div>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    min={5}
                    max={180}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>৫ মি.</span>
                    <span>১৮০ মি.</span>
                  </div>
                </div>

                {/* Marks per Question */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <Award className="w-4 h-4 text-primary" />
                      প্রতি প্রশ্নে মার্কস
                    </Label>
                    <span className="text-xl font-bold text-primary">{marksPerQuestion[0]}</span>
                  </div>
                  <Slider
                    value={marksPerQuestion}
                    onValueChange={setMarksPerQuestion}
                    min={1}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>১</span>
                    <span>৫</span>
                  </div>
                </div>

                {/* Negative Marking */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="flex items-center gap-2 text-foreground">
                      <MinusCircle className="w-4 h-4 text-destructive" />
                      নেগেটিভ মার্কিং
                    </Label>
                    <Switch
                      checked={negativeMarkingEnabled}
                      onCheckedChange={setNegativeMarkingEnabled}
                    />
                  </div>

                  {negativeMarkingEnabled && (
                    <Select value={negativeMarkValue} onValueChange={setNegativeMarkValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="নেগেটিভ মার্ক সিলেক্ট করো" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">-০.২৫ (প্রতি ভুল উত্তরে)</SelectItem>
                        <SelectItem value="0.5">-০.৫০ (প্রতি ভুল উত্তরে)</SelectItem>
                        <SelectItem value="1">-১.০০ (প্রতি ভুল উত্তরে)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট প্রশ্ন</span>
                    <span className="font-medium text-foreground">{questionCount[0]}টি</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট সময়</span>
                    <span className="font-medium text-foreground">{duration[0]} মিনিট</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট মার্কস</span>
                    <span className="font-medium text-foreground">{totalMarks}</span>
                  </div>
                  {negativeMarkingEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">নেগেটিভ মার্ক</span>
                      <span className="font-medium text-destructive">-{negativeMarkValue}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">বিষয় সংখ্যা</span>
                    <span className="font-medium text-foreground">{selectedSubjects.length}টি</span>
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!canStart}
                  onClick={handleStartExam}
                >
                  <Play className="w-5 h-5 mr-2" />
                  পরীক্ষা শুরু করো
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>

                {!canStart && (
                  <p className="text-sm text-center text-muted-foreground">
                    অন্তত একটি বিষয় সিলেক্ট করো
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExamSetup;

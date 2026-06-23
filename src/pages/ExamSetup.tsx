import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { examsApi } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Loader2, BookOpen, Clock, Award, MinusCircle, Settings, Play, ChevronRight, Layers, Target, ArrowLeft, ChevronDown } from "lucide-react";
import { getChaptersForSubject } from "@/lib/curriculum-chapters";

type TopicItem = { id: string; name: string };
type SubjectItem = { id: string; name: string; topics: TopicItem[] };
type CategoryItem = { id: string; name: string; subjects: SubjectItem[] };

const difficultyLevels = [
  { id: "easy", name: "সহজ" },
  { id: "medium", name: "মাঝারি" },
  { id: "hard", name: "কঠিন" },
  { id: "all", name: "সব" },
];

const fallbackCategoryNames: Record<string, string> = {
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
  const categoryFromQuery = searchParams.get("category") || "medical";

  usePageMeta({
    title: "কাস্টম এক্সাম সেটআপ",
    description: "নিজের পছন্দমতো বিষয়, টপিক, সময় ও মার্কিং সেট করে কাস্টম এক্সাম শুরু করো।",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["exam-catalog"],
    queryFn: () => examsApi.catalog(),
  });

  const categories = useMemo<CategoryItem[]>(() => {
    const rows = data?.data?.categories;
    return Array.isArray(rows) ? rows : [];
  }, [data]);

  const activeCategory =
    categories.find((c) => c.id === categoryFromQuery) || categories[0] || null;

  const subjects = activeCategory?.subjects || [];
  const categoryName = activeCategory?.name || fallbackCategoryNames[categoryFromQuery] || "এক্সাম";

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string[]>>({});
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [questionCount, setQuestionCount] = useState([25]);
  const [duration, setDuration] = useState([30]);
  const [marksPerQuestion, setMarksPerQuestion] = useState([1]);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false);
  const [negativeMarkValue, setNegativeMarkValue] = useState("0.25");
  const [difficulty, setDifficulty] = useState("all");

  const handleSubjectToggle = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects((prev) => prev.filter((s) => s !== subjectId));
      setSelectedTopics((prev) => {
        const next = { ...prev };
        delete next[subjectId];
        return next;
      });
      return;
    }

    setSelectedSubjects((prev) => [...prev, subjectId]);
  };

  const handleTopicToggle = (subjectId: string, topicId: string) => {
    const currentTopics = selectedTopics[subjectId] || [];
    if (currentTopics.includes(topicId)) {
      setSelectedTopics((prev) => ({
        ...prev,
        [subjectId]: currentTopics.filter((t) => t !== topicId),
      }));
    } else {
      setSelectedTopics((prev) => ({
        ...prev,
        [subjectId]: [...currentTopics, topicId],
      }));
    }
  };

  const handleChapterToggle = (subjectId: string, chapterId: string) => {
    const currentChapters = selectedChapters[subjectId] || [];
    if (currentChapters.includes(chapterId)) {
      setSelectedChapters((prev) => ({
        ...prev,
        [subjectId]: currentChapters.filter((c) => c !== chapterId),
      }));
    } else {
      setSelectedChapters((prev) => ({
        ...prev,
        [subjectId]: [...currentChapters, chapterId],
      }));
    }
  };

  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const selectAllTopics = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    setSelectedTopics((prev) => ({
      ...prev,
      [subjectId]: subject.topics.map((t) => t.id),
    }));
  };

  const totalMarks = questionCount[0] * marksPerQuestion[0];

  const handleStartExam = () => {
    const config = {
      category: activeCategory?.id || categoryFromQuery,
      subjects: selectedSubjects,
      topics: selectedTopics,
      questionCount: questionCount[0],
      duration: duration[0],
      marksPerQuestion: marksPerQuestion[0],
      negativeMarking: negativeMarkingEnabled ? parseFloat(negativeMarkValue) : 0,
      difficulty,
    };

    navigate("/exam/custom/take", { state: { config } });
  };

  const canStart = selectedSubjects.length > 0;

  return (
    <div className="min-h-screen bg-background font-bengali">

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4 md:mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm md:text-base">ফিরে যান</span>
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-primary">
                <Settings className="w-5 h-5" />
                <span className="font-medium">কাস্টম এক্সাম সেটআপ</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{categoryName} - নিজের মতো করে সাজাও</h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                বিষয়, টপিক, প্রশ্ন সংখ্যা, সময়, মার্কস - সব কিছু তোমার ইচ্ছামতো সেট করো এবং পরীক্ষা দাও
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <div className="md:col-span-2 space-y-4 md:space-y-6">
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

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : subjects.length === 0 ? (
                  <p className="text-muted-foreground">এই ক্যাটাগরিতে এখনো কোনো বিষয় সেট করা হয়নি।</p>
                ) : (
                  <div className="space-y-4">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`border rounded-xl transition-all ${
                          selectedSubjects.includes(subject.id) ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => handleSubjectToggle(subject.id)}>
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

                        {selectedSubjects.includes(subject.id) && (
                          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                            {/* Chapters Section */}
                            {getChaptersForSubject(subject.id).length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                  <BookOpen className="w-4 h-4" />
                                  <span>অধ্যায় নির্বাচন (ঐচ্ছিক)</span>
                                </div>
                                <div className="space-y-2">
                                  {getChaptersForSubject(subject.id).map((chapter) => (
                                    <div key={chapter.id} className="border border-border rounded-lg overflow-hidden">
                                      <button
                                        onClick={() => toggleChapterExpand(chapter.id)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <Checkbox
                                            checked={(selectedChapters[subject.id] || []).includes(chapter.id)}
                                            onCheckedChange={() => handleChapterToggle(subject.id, chapter.id)}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <span className="text-sm font-medium">অধ্যায়-{String(chapter.number).padStart(2, '0')} {chapter.name}</span>
                                        </div>
                                        <ChevronDown
                                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                                            expandedChapters[chapter.id] ? "rotate-180" : ""
                                          }`}
                                        />
                                      </button>
                                      
                                      {expandedChapters[chapter.id] && (
                                        <div className="px-3 pb-3 pt-2 bg-muted/20 border-t border-border space-y-2">
                                          {chapter.topics.map((topic) => (
                                            <label key={topic} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                                              <Checkbox
                                                checked={(selectedTopics[subject.id] || []).includes(topic)}
                                                onCheckedChange={() => handleTopicToggle(subject.id, topic)}
                                              />
                                              <span>{topic}</span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Topics Section (Legacy) */}
                            {subject.topics && subject.topics.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                  <Layers className="w-4 h-4" />
                                  <span>টপিক নির্বাচন (ঐচ্ছিক)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {subject.topics.map((topic) => (
                                    <button
                                      key={topic.id}
                                      onClick={() => handleTopicToggle(subject.id, topic.id)}
                                      className={`px-3 py-1 rounded-lg text-xs md:text-sm transition-all ${
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
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

            <div className="md:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-4 md:p-6 md:sticky md:top-24 space-y-4 md:space-y-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  এক্সাম সেটিংস
                </h2>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      প্রশ্ন সংখ্যা
                    </Label>
                    <span className="text-xl font-bold text-primary">{questionCount[0]}</span>
                  </div>
                  <Slider value={questionCount} onValueChange={setQuestionCount} min={5} max={100} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>৫</span>
                    <span>১০০</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      সময় (মিনিট)
                    </Label>
                    <span className="text-xl font-bold text-primary">{duration[0]}</span>
                  </div>
                  <Slider value={duration} onValueChange={setDuration} min={5} max={180} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>৫ মি.</span>
                    <span>১৮০ মি.</span>
                  </div>
                </div>

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

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="flex items-center gap-2 text-foreground">
                      <MinusCircle className="w-4 h-4 text-destructive" />
                      নেগেটিভ মার্কিং
                    </Label>
                    <Switch checked={negativeMarkingEnabled} onCheckedChange={setNegativeMarkingEnabled} />
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

                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট ���্রশ্ন</span>
                    <span className="font-medium text-foreground">{questionCount[0]}টি</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট ���ময়</span>
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

                <Button variant="hero" size="lg" className="w-full" disabled={!canStart} onClick={handleStartExam}>
                  <Play className="w-5 h-5 mr-2" />
                  পরীক্ষা শুরু করো
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>

                {!canStart && <p className="text-sm text-center text-muted-foreground">অন্তত একটি বিষয় সিলেক্ট করো</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ExamSetup;

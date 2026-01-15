import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  FileText,
  BarChart3,
  Clock,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Download,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Target,
  MoreVertical,
  Filter,
  ArrowUpDown,
} from "lucide-react";

// Mock Data
const examsData = [
  {
    id: 1,
    title: "মেডিকেল মডেল টেস্ট - ২০২৬",
    subject: "পদার্থবিজ্ঞান + রসায়ন + জীববিজ্ঞান",
    questions: 100,
    duration: "২ ঘণ্টা",
    participants: 1250,
    status: "active",
    scheduledDate: "২০ জানুয়ারি, ২০২৬",
    avgScore: 72,
  },
  {
    id: 2,
    title: "HSC পদার্থবিজ্ঞান - চ্যাপ্টার ৫",
    subject: "পদার্থবিজ্ঞান",
    questions: 50,
    duration: "১ ঘণ্টা",
    participants: 890,
    status: "completed",
    scheduledDate: "১৫ জানুয়ারি, ২০২৬",
    avgScore: 68,
  },
  {
    id: 3,
    title: "BCS প্রিলিমিনারি মডেল - ০১",
    subject: "সাধারণ জ্ঞান",
    questions: 200,
    duration: "২.৫ ঘণ্টা",
    participants: 0,
    status: "draft",
    scheduledDate: "২৫ জানুয়ারি, ২০২৬",
    avgScore: 0,
  },
  {
    id: 4,
    title: "রসায়ন - জৈব রসায়ন মডেল",
    subject: "রসায়ন",
    questions: 80,
    duration: "১.৫ ঘণ্টা",
    participants: 560,
    status: "active",
    scheduledDate: "১৮ জানুয়ারি, ২০২৬",
    avgScore: 75,
  },
];

const questionsData = [
  {
    id: 1,
    question: "নিউটনের প্রথম সূত্র অনুযায়ী বস্তুর জড়তা কী?",
    subject: "পদার্থবিজ্ঞান",
    chapter: "গতিবিদ্যা",
    difficulty: "সহজ",
    type: "MCQ",
    usedIn: 5,
  },
  {
    id: 2,
    question: "H₂SO₄ এর আণবিক ভর কত?",
    subject: "রসায়ন",
    chapter: "রাসায়নিক গণনা",
    difficulty: "মাঝারি",
    type: "MCQ",
    usedIn: 8,
  },
  {
    id: 3,
    question: "সালোকসংশ্লেষণ প্রক্রিয়ায় কোন গ্যাস উৎপন্ন হয়?",
    subject: "জীববিজ্ঞান",
    chapter: "উদ্ভিদ শরীরবিদ্যা",
    difficulty: "সহজ",
    type: "MCQ",
    usedIn: 12,
  },
  {
    id: 4,
    question: "বাংলাদেশের স্বাধীনতা দিবস কবে?",
    subject: "সাধারণ জ্ঞান",
    chapter: "বাংলাদেশ বিষয়াবলী",
    difficulty: "সহজ",
    type: "MCQ",
    usedIn: 15,
  },
  {
    id: 5,
    question: "∫(x² + 2x)dx এর মান কত?",
    subject: "উচ্চতর গণিত",
    chapter: "ক্যালকুলাস",
    difficulty: "কঠিন",
    type: "MCQ",
    usedIn: 3,
  },
];

const studentsData = [
  {
    id: 1,
    name: "রহিম উদ্দিন",
    email: "rahim@example.com",
    examsGiven: 15,
    avgScore: 82,
    rank: 5,
    lastActive: "আজ",
  },
  {
    id: 2,
    name: "করিম হোসেন",
    email: "karim@example.com",
    examsGiven: 12,
    avgScore: 75,
    rank: 12,
    lastActive: "গতকাল",
  },
  {
    id: 3,
    name: "ফাতেমা আক্তার",
    email: "fatema@example.com",
    examsGiven: 18,
    avgScore: 88,
    rank: 2,
    lastActive: "আজ",
  },
  {
    id: 4,
    name: "আব্দুল্লাহ আল মামুন",
    email: "mamun@example.com",
    examsGiven: 10,
    avgScore: 65,
    rank: 25,
    lastActive: "৩ দিন আগে",
  },
  {
    id: 5,
    name: "সাবিনা ইয়াসমিন",
    email: "sabina@example.com",
    examsGiven: 20,
    avgScore: 91,
    rank: 1,
    lastActive: "আজ",
  },
];

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-secondary/20 text-secondary">চলমান</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">সম্পন্ন</Badge>;
      case "draft":
        return <Badge className="bg-accent/20 text-accent">ড্রাফট</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "সহজ":
        return <Badge className="bg-green-100 text-green-700">সহজ</Badge>;
      case "মাঝারি":
        return <Badge className="bg-yellow-100 text-yellow-700">মাঝারি</Badge>;
      case "কঠিন":
        return <Badge className="bg-red-100 text-red-700">কঠিন</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                টিচার ড্যাশবোর্ড
              </h1>
              <p className="text-muted-foreground">
                স্বাগতম, <span className="text-primary font-semibold">মোহাম্মদ আলী স্যার</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    প্রশ্ন যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>নতুন প্রশ্ন যোগ করুন</DialogTitle>
                    <DialogDescription>
                      MCQ প্রশ্ন তৈরি করুন এবং প্রশ্নব্যাংকে সংরক্ষণ করুন
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>প্রশ্ন</Label>
                      <Textarea placeholder="প্রশ্নটি লিখুন..." className="min-h-[80px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>বিষয়</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="physics">পদার্থবিজ্ঞান</SelectItem>
                            <SelectItem value="chemistry">রসায়ন</SelectItem>
                            <SelectItem value="biology">জীববিজ্ঞান</SelectItem>
                            <SelectItem value="math">উচ্চতর গণিত</SelectItem>
                            <SelectItem value="gk">সাধারণ জ্ঞান</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>কঠিনতার মাত্রা</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="মাত্রা নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">সহজ</SelectItem>
                            <SelectItem value="medium">মাঝারি</SelectItem>
                            <SelectItem value="hard">কঠিন</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>অপশনসমূহ</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="অপশন ক" />
                        <Input placeholder="অপশন খ" />
                        <Input placeholder="অপশন গ" />
                        <Input placeholder="অপশন ঘ" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>সঠিক উত্তর</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="সঠিক উত্তর নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">অপশন ক</SelectItem>
                          <SelectItem value="b">অপশন খ</SelectItem>
                          <SelectItem value="c">অপশন গ</SelectItem>
                          <SelectItem value="d">অপশন ঘ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ব্যাখ্যা (ঐচ্ছিক)</Label>
                      <Textarea placeholder="উত্তরের ব্যাখ্যা লিখুন..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
                      বাতিল
                    </Button>
                    <Button variant="hero">প্রশ্ন সংরক্ষণ করুন</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="gap-2">
                    <Plus className="w-4 h-4" />
                    নতুন এক্সাম তৈরি
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>নতুন এক্সাম তৈরি করুন</DialogTitle>
                    <DialogDescription>
                      এক্সামের বিস্তারিত তথ্য দিন এবং প্রশ্ন যোগ করুন
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>এক্সামের নাম</Label>
                      <Input placeholder="উদাহরণ: মেডিকেল মডেল টেস্ট - ০১" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>বিষয়</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="physics">পদার্থবিজ্ঞান</SelectItem>
                            <SelectItem value="chemistry">রসায়ন</SelectItem>
                            <SelectItem value="biology">জীববিজ্ঞান</SelectItem>
                            <SelectItem value="mixed">মিক্সড</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>সময়কাল</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="সময় নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">৩০ মিনিট</SelectItem>
                            <SelectItem value="60">১ ঘণ্টা</SelectItem>
                            <SelectItem value="90">১.৫ ঘণ্টা</SelectItem>
                            <SelectItem value="120">২ ঘণ্টা</SelectItem>
                            <SelectItem value="150">২.৫ ঘণ্টা</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>তারিখ</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>সময়</Label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>মোট প্রশ্ন</Label>
                        <Input type="number" placeholder="১০০" />
                      </div>
                      <div className="space-y-2">
                        <Label>প্রতি প্রশ্নে মার্কস</Label>
                        <Input type="number" placeholder="১" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>নেগেটিভ মার্কিং</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="নেগেটিভ মার্কিং নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">নেই</SelectItem>
                          <SelectItem value="0.25">০.২৫ মার্কস</SelectItem>
                          <SelectItem value="0.5">০.৫০ মার্কস</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateExamOpen(false)}>
                      বাতিল
                    </Button>
                    <Button variant="hero">এক্সাম তৈরি করুন</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{examsData.length}</div>
              <div className="text-sm text-muted-foreground">মোট এক্সাম</div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{questionsData.length * 50}</div>
              <div className="text-sm text-muted-foreground">মোট প্রশ্ন</div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{studentsData.length * 200}</div>
              <div className="text-sm text-muted-foreground">মোট শিক্ষার্থী</div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">৭৫%</div>
              <div className="text-sm text-muted-foreground">গড় স্কোর</div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="exams" className="space-y-6">
            <TabsList className="bg-muted p-1 h-auto flex-wrap">
              <TabsTrigger value="exams" className="gap-2">
                <FileText className="w-4 h-4" />
                এক্সাম ম্যানেজমেন্ট
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-2">
                <BookOpen className="w-4 h-4" />
                প্রশ্নব্যাংক
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                শিক্ষার্থীদের রেজাল্ট
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                অ্যানালিটিক্স
              </TabsTrigger>
            </TabsList>

            {/* Exams Tab */}
            <TabsContent value="exams">
              <div className="bg-card rounded-2xl border border-border shadow-card">
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="এক্সাম খুঁজুন..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        ফিল্টার
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ArrowUpDown className="w-4 h-4" />
                        সাজান
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {examsData.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-foreground">{exam.title}</h3>
                            {getStatusBadge(exam.status)}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{exam.subject}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {exam.questions} প্রশ্ন
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exam.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {exam.participants} জন
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {exam.scheduledDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {exam.status === "completed" && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">গড় স্কোর</span>
                            <span className="font-bold text-foreground">{exam.avgScore}%</span>
                          </div>
                          <Progress value={exam.avgScore} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions">
              <div className="bg-card rounded-2xl border border-border shadow-card">
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="প্রশ্ন খুঁজুন..." className="pl-10" />
                    </div>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="বিষয়" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সব বিষয়</SelectItem>
                          <SelectItem value="physics">পদার্থবিজ্ঞান</SelectItem>
                          <SelectItem value="chemistry">রসায়ন</SelectItem>
                          <SelectItem value="biology">জীববিজ্ঞান</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="কঠিনতা" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সব মাত্রা</SelectItem>
                          <SelectItem value="easy">সহজ</SelectItem>
                          <SelectItem value="medium">মাঝারি</SelectItem>
                          <SelectItem value="hard">কঠিন</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {questionsData.map((q) => (
                    <div
                      key={q.id}
                      className="p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-foreground font-medium mb-3">{q.question}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{q.subject}</Badge>
                            <Badge variant="outline">{q.chapter}</Badge>
                            {getDifficultyBadge(q.difficulty)}
                            <Badge variant="secondary">{q.type}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">ব্যবহৃত হয়েছে</p>
                            <p className="font-bold text-foreground">{q.usedIn} বার</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students">
              <div className="bg-card rounded-2xl border border-border shadow-card">
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="শিক্ষার্থী খুঁজুন..." className="pl-10" />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      রেজাল্ট ডাউনলোড
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">শিক্ষার্থী</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">এক্সাম দিয়েছে</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">গড় স্কোর</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">র‍্যাংক</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">সর্বশেষ সক্রিয়</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {studentsData.map((student) => (
                        <tr key={student.id} className="hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{student.examsGiven}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${
                                student.avgScore >= 80 ? "text-secondary" : student.avgScore >= 60 ? "text-accent" : "text-destructive"
                              }`}>
                                {student.avgScore}%
                              </span>
                              {student.avgScore >= 80 ? (
                                <TrendingUp className="w-4 h-4 text-secondary" />
                              ) : null}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={student.rank <= 3 ? "default" : "outline"} className={
                              student.rank === 1 ? "bg-yellow-500 text-white" :
                              student.rank === 2 ? "bg-gray-400 text-white" :
                              student.rank === 3 ? "bg-amber-600 text-white" : ""
                            }>
                              #{student.rank}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">{student.lastActive}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="w-4 h-4" />
                              বিস্তারিত
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Performance Overview */}
                <div className="bg-card rounded-2xl border border-border shadow-card p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    পারফরম্যান্স ওভারভিউ
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-foreground">পাস রেট</span>
                      </div>
                      <span className="text-2xl font-bold text-secondary">৮৫%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-foreground">গড় নম্বর</span>
                      </div>
                      <span className="text-2xl font-bold text-accent">৭২%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-foreground">গড় সময়</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">৪৫ মি.</span>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="bg-card rounded-2xl border border-border shadow-card p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    সেরা শিক্ষার্থী
                  </h3>
                  <div className="space-y-3">
                    {studentsData.slice(0, 5).sort((a, b) => a.rank - b.rank).map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? "bg-yellow-500" :
                            index === 1 ? "bg-gray-400" :
                            index === 2 ? "bg-amber-600" : "bg-muted-foreground"
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-foreground">{student.name}</span>
                        </div>
                        <span className="font-bold text-primary">{student.avgScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject-wise Performance */}
                <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:col-span-2">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    বিষয়ভিত্তিক পারফরম্যান্স
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { subject: "পদার্থবিজ্ঞান", score: 72, color: "from-blue-500 to-cyan-500" },
                      { subject: "রসায়ন", score: 68, color: "from-emerald-500 to-teal-500" },
                      { subject: "জীববিজ্ঞান", score: 75, color: "from-purple-500 to-pink-500" },
                      { subject: "সাধারণ জ্ঞান", score: 80, color: "from-orange-500 to-amber-500" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-border"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-foreground mb-2">{item.subject}</h4>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-foreground">{item.score}%</span>
                          <span className="text-sm text-muted-foreground mb-1">গড় স্কোর</span>
                        </div>
                        <Progress value={item.score} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;

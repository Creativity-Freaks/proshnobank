import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Clock, CheckCircle, ChevronRight, GraduationCap } from "lucide-react";

const subjects = [
  { id: "all", name: "সকল বিষয়" },
  { id: "bangla", name: "বাংলা" },
  { id: "english", name: "ইংরেজি" },
  { id: "math", name: "গণিত" },
  { id: "physics", name: "পদার্থবিজ্ঞান" },
  { id: "chemistry", name: "রসায়ন" },
  { id: "biology", name: "জীববিজ্ঞান" },
  { id: "gk", name: "সাধারণ জ্ঞান" },
];

const questionSets = [
  {
    id: 1,
    title: "বাংলা সাহিত্য - কবিতা",
    subject: "বাংলা",
    questions: 50,
    duration: "৩০ মিনিট",
    difficulty: "সহজ",
    attempts: 1250,
    category: "SSC",
  },
  {
    id: 2,
    title: "English Grammar - Tenses",
    subject: "ইংরেজি",
    questions: 40,
    duration: "২৫ মিনিট",
    difficulty: "মধ্যম",
    attempts: 980,
    category: "HSC",
  },
  {
    id: 3,
    title: "গণিত - বীজগণিত",
    subject: "গণিত",
    questions: 35,
    duration: "৪০ মিনিট",
    difficulty: "কঠিন",
    attempts: 750,
    category: "ভর্তি",
  },
  {
    id: 4,
    title: "পদার্থবিজ্ঞান - গতিবিদ্যা",
    subject: "পদার্থবিজ্ঞান",
    questions: 30,
    duration: "৩৫ মিনিট",
    difficulty: "মধ্যম",
    attempts: 620,
    category: "মেডিকেল",
  },
  {
    id: 5,
    title: "রসায়ন - জৈব যৌগ",
    subject: "রসায়ন",
    questions: 45,
    duration: "৪০ মিনিট",
    difficulty: "কঠিন",
    attempts: 540,
    category: "ইঞ্জিনিয়ারিং",
  },
  {
    id: 6,
    title: "বাংলাদেশ বিষয়াবলী",
    subject: "সাধারণ জ্ঞান",
    questions: 60,
    duration: "৪৫ মিনিট",
    difficulty: "মধ্যম",
    attempts: 2100,
    category: "BCS",
  },
  {
    id: 7,
    title: "জীববিজ্ঞান - উদ্ভিদবিদ্যা",
    subject: "জীববিজ্ঞান",
    questions: 40,
    duration: "৩০ মিনিট",
    difficulty: "সহজ",
    attempts: 890,
    category: "মেডিকেল",
  },
  {
    id: 8,
    title: "আন্তর্জাতিক বিষয়াবলী",
    subject: "সাধারণ জ্ঞান",
    questions: 50,
    duration: "৪০ মিনিট",
    difficulty: "মধ্যম",
    attempts: 1560,
    category: "BCS",
  },
];

const QuestionBank = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const filteredSets = questionSets.filter((set) => {
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || set.subject === subjects.find(s => s.id === selectedSubject)?.name;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "সহজ":
        return "bg-green-100 text-green-700";
      case "মধ্যম":
        return "bg-yellow-100 text-yellow-700";
      case "কঠিন":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-primary">প্রশ্নব্যাংক</span> থেকে প্র্যাকটিস করো
            </h1>
            <p className="text-muted-foreground mb-8">
              হাজার হাজার প্রশ্ন থেকে তোমার পছন্দের বিষয় বেছে নিয়ে প্র্যাকটিস করো
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="প্রশ্নব্যাংক খুঁজো..."
                className="pl-12 pr-4 py-6 text-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Subject Filters */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant={selectedSubject === subject.id ? "hero" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject.id)}
                className="font-bengali"
              >
                {subject.name}
              </Button>
            ))}
          </div>

          {/* Question Sets Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSets.map((set) => (
              <div
                key={set.id}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="font-bengali">
                    {set.category}
                  </Badge>
                </div>

                <h3 className="font-bold text-card-foreground mb-2 line-clamp-2">
                  {set.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">{set.subject}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {set.questions} প্রশ্ন
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {set.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge className={getDifficultyColor(set.difficulty)}>
                      {set.difficulty}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {set.attempts}+ চেষ্টা
                    </span>
                  </div>
                </div>

                <Link to={`/exam/${set.id}`}>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    প্র্যাকটিস শুরু করো
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {filteredSets.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">কোনো প্রশ্নব্যাংক পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">অন্য কীওয়ার্ড দিয়ে খুঁজে দেখো</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuestionBank;

import { useState, useMemo } from "react";
import ExamFilters from "@/components/ExamFilters";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, Users, BookOpen, Trophy, ArrowRight, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const subjects = [
  { id: "bangla", name: "বাংলা" },
  { id: "english", name: "ইংরেজি" },
  { id: "math", name: "গণিত" },
  { id: "physics", name: "পদার্থবিজ্ঞান" },
  { id: "chemistry", name: "রসায়ন" },
  { id: "biology", name: "জীববিজ্ঞান" },
  { id: "ict", name: "আইসিটি" },
  { id: "bgp", name: "বাংলাদেশ ও বিশ্বপরিচয়" },
];

const exams = [
  { id: 1, title: "SSC বাংলা ১ম পত্র", subject: "bangla", questions: 50, duration: 60, attempts: 1250 },
  { id: 2, title: "SSC বাংলা ২য় পত্র", subject: "bangla", questions: 50, duration: 60, attempts: 980 },
  { id: 3, title: "SSC ইংরেজি ১ম পত্র", subject: "english", questions: 50, duration: 60, attempts: 1450 },
  { id: 4, title: "SSC ইংরেজি ২য় পত্র", subject: "english", questions: 50, duration: 60, attempts: 1120 },
  { id: 5, title: "SSC গণিত", subject: "math", questions: 40, duration: 50, attempts: 2100 },
  { id: 6, title: "SSC পদার্থবিজ্ঞান", subject: "physics", questions: 40, duration: 45, attempts: 890 },
  { id: 7, title: "SSC রসায়ন", subject: "chemistry", questions: 40, duration: 45, attempts: 760 },
  { id: 8, title: "SSC জীববিজ্ঞান", subject: "biology", questions: 40, duration: 45, attempts: 650 },
  { id: 9, title: "SSC বাংলাদেশ ও বিশ্বপরিচয়", subject: "bgp", questions: 50, duration: 50, attempts: 540 },
  { id: 10, title: "SSC আইসিটি", subject: "ict", questions: 25, duration: 30, attempts: 720 },
  { id: 11, title: "SSC গণিত - জ্যামিতি", subject: "math", questions: 30, duration: 40, attempts: 1850 },
  { id: 12, title: "SSC গণিত - বীজগণিত", subject: "math", questions: 30, duration: 40, attempts: 1650 },
];

const SSCExams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const filteredAndSortedExams = useMemo(() => {
    let result = [...exams];

    // Filter by subject
    if (selectedSubject !== "all") {
      result = result.filter((exam) => exam.subject === selectedSubject);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter((exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.attempts - a.attempts);
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "questions-high":
        result.sort((a, b) => b.questions - a.questions);
        break;
      case "questions-low":
        result.sort((a, b) => a.questions - b.questions);
        break;
      case "duration-high":
        result.sort((a, b) => b.duration - a.duration);
        break;
      case "duration-low":
        result.sort((a, b) => a.duration - b.duration);
        break;
    }

    return result;
  }, [searchQuery, selectedSubject, sortBy]);

  return (
    <div className="min-h-screen bg-background font-bengali">
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  SSC পরীক্ষা
                </h1>
                <p className="text-muted-foreground">এসএসসি বোর্ড পরীক্ষার প্রস্তুতি</p>
              </div>
            </div>
            <Link to="/exam/setup?category=ssc">
              <Button variant="hero" size="lg" className="w-full md:w-auto">
                <Settings className="w-5 h-5 mr-2" />
                কাস্টম এক্সাম সেটআপ
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">১২০+</p>
              <p className="text-sm text-muted-foreground">মোট এক্সাম</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">৫০০০+</p>
              <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">৯২%</p>
              <p className="text-sm text-muted-foreground">সাফল্যের হার</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Clock className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">২৪/৭</p>
              <p className="text-sm text-muted-foreground">অ্যাক্সেস</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Exams Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ExamFilters
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedSubject === "all" ? "সব এক্সাম" : subjects.find(s => s.id === selectedSubject)?.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedExams.length}টি এক্সাম পাওয়া গেছে
              </span>
            </div>
            
            {filteredAndSortedExams.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedExams.map((exam) => (
                  <Link
                    key={exam.id}
                    to={`/exam/${exam.id}`}
                    className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <h3 className="text-lg font-semibold text-card-foreground mb-3">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {exam.questions} প্রশ্ন
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration} মিনিট
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {exam.attempts} জন অংশ নিয়েছে
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">কোনো এক্সাম পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default SSCExams;

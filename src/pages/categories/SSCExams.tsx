import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, Clock, Users, BookOpen, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const exams = [
  { id: 1, title: "SSC বাংলা ১ম পত্র", questions: 50, duration: "60 মিনিট", attempts: 1250 },
  { id: 2, title: "SSC বাংলা ২য় পত্র", questions: 50, duration: "60 মিনিট", attempts: 980 },
  { id: 3, title: "SSC ইংরেজি ১ম পত্র", questions: 50, duration: "60 মিনিট", attempts: 1450 },
  { id: 4, title: "SSC ইংরেজি ২য় পত্র", questions: 50, duration: "60 মিনিট", attempts: 1120 },
  { id: 5, title: "SSC গণিত", questions: 40, duration: "50 মিনিট", attempts: 2100 },
  { id: 6, title: "SSC পদার্থবিজ্ঞান", questions: 40, duration: "45 মিনিট", attempts: 890 },
  { id: 7, title: "SSC রসায়ন", questions: 40, duration: "45 মিনিট", attempts: 760 },
  { id: 8, title: "SSC জীববিজ্ঞান", questions: 40, duration: "45 মিনিট", attempts: 650 },
  { id: 9, title: "SSC বাংলাদেশ ও বিশ্বপরিচয়", questions: 50, duration: "50 মিনিট", attempts: 540 },
];

const SSCExams = () => {
  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
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

      {/* Exams Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">সব এক্সাম</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
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
                    {exam.duration}
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SSCExams;

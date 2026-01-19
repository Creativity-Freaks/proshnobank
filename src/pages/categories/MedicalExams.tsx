import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Stethoscope, Clock, Users, BookOpen, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const exams = [
  { id: 1, title: "মেডিকেল ভর্তি পরীক্ষা - পদার্থবিজ্ঞান", questions: 40, duration: "40 মিনিট", attempts: 3250 },
  { id: 2, title: "মেডিকেল ভর্তি পরীক্ষা - রসায়ন", questions: 40, duration: "40 মিনিট", attempts: 3180 },
  { id: 3, title: "মেডিকেল ভর্তি পরীক্ষা - জীববিজ্ঞান", questions: 40, duration: "40 মিনিট", attempts: 3450 },
  { id: 4, title: "মেডিকেল ভর্তি পরীক্ষা - ইংরেজি", questions: 20, duration: "20 মিনিট", attempts: 2720 },
  { id: 5, title: "মেডিকেল ভর্তি পরীক্ষা - সাধারণ জ্ঞান", questions: 20, duration: "20 মিনিট", attempts: 2150 },
  { id: 6, title: "মেডিকেল মডেল টেস্ট - ১", questions: 100, duration: "60 মিনিট", attempts: 4890 },
  { id: 7, title: "মেডিকেল মডেল টেস্ট - ২", questions: 100, duration: "60 মিনিট", attempts: 4560 },
  { id: 8, title: "মেডিকেল মডেল টেস্ট - ৩", questions: 100, duration: "60 মিনিট", attempts: 4120 },
  { id: 9, title: "বিগত বছরের প্রশ্ন - ২০২৩", questions: 100, duration: "60 মিনিট", attempts: 5670 },
];

const MedicalExams = () => {
  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                মেডিকেল ভর্তি
              </h1>
              <p className="text-muted-foreground">MBBS ভর্তি পরীক্ষার প্রস্তুতি</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">২০০+</p>
              <p className="text-sm text-muted-foreground">মোট এক্সাম</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">১২০০০+</p>
              <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">৮৫%</p>
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

export default MedicalExams;

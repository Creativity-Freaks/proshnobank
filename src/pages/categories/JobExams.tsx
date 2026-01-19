import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Briefcase, Clock, Users, BookOpen, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const exams = [
  { id: 1, title: "BCS প্রিলিমিনারি - বাংলা", questions: 35, duration: "35 মিনিট", attempts: 8250 },
  { id: 2, title: "BCS প্রিলিমিনারি - ইংরেজি", questions: 35, duration: "35 মিনিট", attempts: 7980 },
  { id: 3, title: "BCS প্রিলিমিনারি - সাধারণ জ্ঞান", questions: 50, duration: "50 মিনিট", attempts: 9450 },
  { id: 4, title: "BCS প্রিলিমিনারি - গণিত", questions: 15, duration: "20 মিনিট", attempts: 6120 },
  { id: 5, title: "ব্যাংক নিয়োগ পরীক্ষা - সম্পূর্ণ", questions: 80, duration: "60 মিনিট", attempts: 5890 },
  { id: 6, title: "প্রাইমারি শিক্ষক নিয়োগ", questions: 80, duration: "80 মিনিট", attempts: 7340 },
  { id: 7, title: "NTRCA শিক্ষক নিবন্ধন", questions: 100, duration: "60 মিনিট", attempts: 4150 },
  { id: 8, title: "BCS মডেল টেস্ট - ১", questions: 200, duration: "120 মিনিট", attempts: 10670 },
  { id: 9, title: "বিগত বছরের প্রশ্ন - ৪৫তম BCS", questions: 200, duration: "120 মিনিট", attempts: 12890 },
];

const JobExams = () => {
  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                চাকরি পরীক্ষা
              </h1>
              <p className="text-muted-foreground">BCS, Bank, Primary সহ সব চাকরি</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">৩০০+</p>
              <p className="text-sm text-muted-foreground">মোট এক্সাম</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">২৫০০০+</p>
              <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">৭৫%</p>
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

export default JobExams;

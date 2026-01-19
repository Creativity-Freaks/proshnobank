import { Link } from "react-router-dom";
import { GraduationCap, Stethoscope, Cog, Building2, Briefcase, BookOpen } from "lucide-react";

const categories = [
  {
    icon: GraduationCap,
    title: "SSC পরীক্ষা",
    description: "এসএসসি বোর্ড পরীক্ষার প্রস্তুতি",
    color: "from-blue-500 to-cyan-500",
    exams: "১২০+ এক্সাম",
    link: "/category/ssc",
  },
  {
    icon: GraduationCap,
    title: "HSC পরীক্ষা",
    description: "এইচএসসি বোর্ড পরীক্ষার প্রস্তুতি",
    color: "from-purple-500 to-pink-500",
    exams: "১৫০+ এক্সাম",
    link: "/category/hsc",
  },
  {
    icon: Stethoscope,
    title: "মেডিকেল ভর্তি",
    description: "MBBS ভর্তি পরীক্ষার প্রস্তুতি",
    color: "from-emerald-500 to-teal-500",
    exams: "২০০+ এক্সাম",
    link: "/category/medical",
  },
  {
    icon: Cog,
    title: "ইঞ্জিনিয়ারিং ভর্তি",
    description: "BUET, CUET, KUET ভর্তি প্রস্তুতি",
    color: "from-orange-500 to-amber-500",
    exams: "১৮০+ এক্সাম",
    link: "/category/engineering",
  },
  {
    icon: Building2,
    title: "বিশ্ববিদ্যালয় ভর্তি",
    description: "ঢাবি, জাবি, রাবি ভর্তি প্রস্তুতি",
    color: "from-rose-500 to-red-500",
    exams: "২৫০+ এক্সাম",
    link: "/category/university",
  },
  {
    icon: Briefcase,
    title: "চাকরি পরীক্ষা",
    description: "BCS, Bank, Primary সহ সব চাকরি",
    color: "from-indigo-500 to-violet-500",
    exams: "৩০০+ এক্সাম",
    link: "/category/job",
  },
];

const ExamCategories = () => {
  return (
    <section id="batches" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-bengali text-foreground mb-4">
            তোমার লক্ষ্য অনুযায়ী <span className="text-primary">এক্সাম বেছে নাও</span>
          </h2>
          <p className="text-muted-foreground font-bengali max-w-2xl mx-auto">
            SSC থেকে শুরু করে BCS পর্যন্ত সব ধরনের পরীক্ষার প্রস্তুতি নিতে পারবে আমাদের প্ল্যাটফর্মে
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.link}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-border"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold font-bengali text-card-foreground mb-2">
                {category.title}
              </h3>
              <p className="text-muted-foreground font-bengali text-sm mb-4">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary font-bengali">
                  {category.exams}
                </span>
                <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExamCategories;

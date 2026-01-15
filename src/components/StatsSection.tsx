import { BookOpen, Users, FileQuestion, Trophy } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "১০ লাখ+",
    label: "শিক্ষার্থী",
  },
  {
    icon: FileQuestion,
    value: "৫ লাখ+",
    label: "প্রশ্ন",
  },
  {
    icon: BookOpen,
    value: "৫০০+",
    label: "এক্সাম ব্যাচ",
  },
  {
    icon: Trophy,
    value: "৫০০০+",
    label: "সফল ভর্তি",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-primary-foreground/70 font-bengali">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

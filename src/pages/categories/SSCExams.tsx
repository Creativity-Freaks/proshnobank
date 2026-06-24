import { GraduationCap } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const subjects = [
  { id: "ssc_bangla_1", name: "বাংলা ১ম পত্র" },
  { id: "ssc_bangla_2", name: "বাংলা ২য় পত্র" },
  { id: "ssc_english_1", name: "ইংরেজি ১ম পত্র" },
  { id: "ssc_english_2", name: "ইংরেজি ২য় পত্র" },
  { id: "ssc_math", name: "গণিত" },
  { id: "ssc_physics", name: "পদার্থবিজ্ঞান" },
  { id: "ssc_chemistry", name: "রসায়ন" },
  { id: "ssc_biology", name: "জীববিজ্ঞান" },
  { id: "ssc_higher_math", name: "উচ্চতর গণিত" },
  { id: "ssc_bd_world", name: "বাংলাদেশ ও বিশ্বপরিচয়" },
  { id: "ssc_religion", name: "ধর্ম ও নৈতিক শিক্ষা" },
  { id: "ssc_ict", name: "ICT" },
  { id: "ssc_history", name: "ইতিহাস" },
  { id: "ssc_geography", name: "ভূগোল" },
  { id: "ssc_economics", name: "অর্থনীতি" },
  { id: "ssc_civics", name: "পৌরনীতি" },
  { id: "ssc_accounting", name: "হিসাববিজ্ঞান" },
  { id: "ssc_business", name: "ব্যবসায় উদ্যোগ" },
];

const SSCExams = () => (
  <CategoryExamsPage
    config={{
      category: "ssc",
      title: "SSC পরীক্ষা",
      subtitle: "এসএসসি বোর্ড পরীক্ষার প্রস্তুতি",
      icon: GraduationCap,
      gradient: "from-blue-500 to-cyan-500",
      heroGradient: "from-blue-500/10 to-cyan-500/10",
      subjects,
      stats: { successRate: "৯২%" },
    }}
  />
);

export default SSCExams;

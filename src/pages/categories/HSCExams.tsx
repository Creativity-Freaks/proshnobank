import { GraduationCap } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const subjects = [
  { id: "hsc_bangla", name: "বাংলা" },
  { id: "hsc_english", name: "ইংরেজি" },
  { id: "hsc_physics", name: "পদার্থবিজ্ঞান" },
  { id: "hsc_chemistry", name: "রসায়ন" },
  { id: "hsc_biology", name: "জীববিজ্ঞান" },
  { id: "hsc_higher_math", name: "উচ্চতর গণিত" },
  { id: "hsc_statistics", name: "পরিসংখ্যান" },
  { id: "hsc_ict", name: "ICT" },
  { id: "hsc_accounting", name: "হিসাববিজ্ঞান" },
  { id: "hsc_finance", name: "ফিন্যান্স" },
  { id: "hsc_management", name: "ব্যবস্থাপনা" },
  { id: "hsc_history", name: "ইতিহাস" },
  { id: "hsc_islamic_studies", name: "ইসলামিক স্টাডিজ" },
  { id: "hsc_social_science", name: "সমাজবিজ্ঞান" },
  { id: "hsc_economics", name: "অর্থনীতি" },
];

const HSCExams = () => (
  <CategoryExamsPage
    config={{
      category: "hsc",
      title: "HSC পরীক্ষা",
      subtitle: "এইচএসসি বোর্ড পরীক্ষার প্রস্তুতি",
      icon: GraduationCap,
      gradient: "from-purple-500 to-pink-500",
      heroGradient: "from-purple-500/10 to-pink-500/10",
      subjects,
      stats: { successRate: "৯০%" },
    }}
  />
);

export default HSCExams;

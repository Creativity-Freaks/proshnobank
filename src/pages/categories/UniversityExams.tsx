import { Building2 } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const subjects = [
  { id: "du", name: "ঢাকা বিশ্ববিদ্যালয়" },
  { id: "ju", name: "জাহাঙ্গীরনগর" },
  { id: "ru", name: "রাজশাহী" },
  { id: "cu", name: "চট্টগ্রাম" },
  { id: "unit-a", name: "ক ইউনিট" },
  { id: "unit-b", name: "খ ইউনিট" },
  { id: "model", name: "মডেল টেস্ট" },
];

const UniversityExams = () => (
  <CategoryExamsPage
    config={{
      category: "university",
      title: "বিশ্ববিদ্যালয় ভর্তি",
      subtitle: "ঢাবি, জাবি, রাবি ভর্তি প্রস্তুতি",
      icon: Building2,
      gradient: "from-rose-500 to-red-500",
      heroGradient: "from-rose-500/10 to-red-500/10",
      subjects,
      stats: { successRate: "৮৭%" },
    }}
  />
);

export default UniversityExams;

import { Cog } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const subjects = [
  { id: "engineering_higher_math", name: "উচ্চতর গণিত" },
  { id: "engineering_physics", name: "পদার্থবিজ্ঞান" },
  { id: "engineering_chemistry", name: "রসায়ন" },
  { id: "engineering_english", name: "ইংরেজি" },
];

const EngineeringExams = () => (
  <CategoryExamsPage
    config={{
      category: "engineering",
      title: "ইঞ্জিনিয়ারিং ভর্তি",
      subtitle: "BUET, CUET, KUET ভর্তি প্রস্তুতি",
      icon: Cog,
      gradient: "from-orange-500 to-amber-500",
      heroGradient: "from-orange-500/10 to-amber-500/10",
      subjects,
      stats: { successRate: "৮৮%" },
    }}
  />
);

export default EngineeringExams;

import { Stethoscope } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const subjects = [
  { id: "medical_physics", name: "পদার্থবিজ্ঞান" },
  { id: "medical_chemistry", name: "রসায়ন" },
  { id: "medical_biology", name: "জীববিজ্ঞান" },
  { id: "medical_english", name: "ইংরেজি" },
  { id: "medical_gk", name: "সাধারণ জ্ঞান" },
];

const MedicalExams = () => (
  <CategoryExamsPage
    config={{
      category: "medical",
      title: "মেডিকেল ভর্তি",
      subtitle: "MBBS ভর্তি পরীক্ষার প্রস্তুতি",
      icon: Stethoscope,
      gradient: "from-emerald-500 to-teal-500",
      heroGradient: "from-emerald-500/10 to-teal-500/10",
      subjects,
      stats: { successRate: "৮৫%" },
    }}
  />
);

export default MedicalExams;

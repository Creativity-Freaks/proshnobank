import { Briefcase } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const subjects = [
  { id: "job_bangla", name: "বাংলা" },
  { id: "job_english", name: "ইংরেজি" },
  { id: "job_math", name: "গণিত" },
  { id: "job_gk", name: "সাধারণ জ্ঞান" },
  { id: "job_ict", name: "ICT" },
  { id: "job_mental_ability", name: "মানসিক দক্ষতা" },
  { id: "job_logical", name: "Logical Reasoning" },
];

const JobExams = () => (
  <CategoryExamsPage
    config={{
      category: "job",
      title: "চাকরি পরীক্ষা",
      subtitle: "BCS, Bank, Primary সহ সব চাকরি",
      icon: Briefcase,
      gradient: "from-indigo-500 to-violet-500",
      heroGradient: "from-indigo-500/10 to-violet-500/10",
      subjects,
      stats: { successRate: "৮৬%" },
    }}
  />
);

export default JobExams;

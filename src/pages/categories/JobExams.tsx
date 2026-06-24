import { Briefcase } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const JobExams = () => (
  <CategoryExamsPage
    config={{
      slug: "job",
      title: "চাকরি পরীক্ষা",
      subtitle: "BCS, Bank, Primary সহ সব চাকরি",
      Icon: Briefcase,
      gradient: "from-indigo-500 to-violet-500",
      heroGradient: "from-indigo-500/10 to-violet-500/10",
      examCount: "৩০০+",
      studentCount: "২৫০০০+",
      successRate: "৭৫%",
    }}
  />
);

export default JobExams;

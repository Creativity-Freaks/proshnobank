import { usePageMeta } from "@/hooks/usePageMeta";

export default function AboutUs() {
  usePageMeta({
    title: "About Us",
    description: "প্রশ্নব্যাংক সম্পর্কে জানুন।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Us</h1>
          <p className="text-muted-foreground leading-relaxed">
            প্রশ্নব্যাংক একটি বাংলা-ফার্স্ট অনলাইন পরীক্ষা প্ল্যাটফর্ম—যেখানে শিক্ষার্থী অনুশীলন করতে পারে,
            লাইভ এক্সামে অংশ নিতে পারে, এবং শিক্ষকরা প্রশ্ন তৈরি/পরীক্ষা শিডিউল করতে পারেন।
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-2">আমাদের লক্ষ্য</h2>
            <p className="text-muted-foreground">
              সবার জন্য সহজ, দ্রুত এবং নির্ভরযোগ্য অনলাইন পরীক্ষা অভিজ্ঞতা তৈরি করা—যেখানে শেখা, চর্চা ও মূল্যায়ন
              একসাথে করা যায়।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

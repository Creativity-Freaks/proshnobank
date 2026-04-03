import { usePageMeta } from "@/hooks/usePageMeta";

export default function PrivacyPolicy() {
  usePageMeta({
    title: "Privacy Policy",
    description: "প্রশ্নব্যাংকের প্রাইভেসি পলিসি।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground leading-relaxed">
            আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষাকে গুরুত্ব দিই। এই পেইজে আমরা কী তথ্য সংগ্রহ করি, কেন সংগ্রহ করি এবং
            কীভাবে তা ব্যবহার করি—সেটার সারসংক্ষেপ দেওয়া হলো।
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">তথ্য সংগ্রহ</h2>
              <p className="text-muted-foreground">
                অ্যাকাউন্ট তৈরি, লগইন, এক্সামে অংশ নেওয়া এবং সার্ভিস উন্নত করার জন্য প্রয়োজনীয় তথ্য সংগ্রহ হতে পারে।
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">তথ্য ব্যবহার</h2>
              <p className="text-muted-foreground">
                আপনার অভিজ্ঞতা উন্নত করা, নিরাপত্তা বজায় রাখা এবং প্রাসঙ্গিক নোটিফিকেশন দিতে তথ্য ব্যবহার করা হতে পারে।
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">যোগাযোগ</h2>
              <p className="text-muted-foreground">
                প্রাইভেসি সম্পর্কিত কোনো প্রশ্ন থাকলে আমাদের ইমেইলে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

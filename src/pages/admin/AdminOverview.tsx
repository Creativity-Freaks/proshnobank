import { useNavigate } from "react-router-dom";
import { BookOpen, Users, FileText, Layers, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";

export default function AdminOverview() {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: "ক্যাটেগরি ব্যবস্থাপনা",
      description: "সব পরীক্ষার ক্যাটেগরি যোগ করুন এবং পরিচালনা করুন",
      icon: Layers,
      path: "/admin/categories",
    },
    {
      title: "বিষয় ব্যবস্থাপনা",
      description: "বিষয় এবং অধ্যায় যোগ করুন ও সম্পাদনা করুন",
      icon: BookOpen,
      path: "/admin/subjects",
    },
    {
      title: "প্রশ্ন ব্যবস্থাপনা",
      description: "পরীক্ষার প্রশ্ন যোগ করুন এবং পরিবর্তন করুন",
      icon: FileText,
      path: "/admin/questions",
    },
    {
      title: "ব্যবহারকারী ব্যবস্থাপনা",
      description: "ব্যবহারকারী অ্যাকাউন্ট এবং অনুমতি পরিচালনা করুন",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "পরিসংখ্যান",
      description: "পরীক্ষা এবং ফলাফলের পরিসংখ্যান দেখুন",
      icon: BarChart3,
      path: "/admin/statistics",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">আডমিন ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">প্রশ্নব্যাংক সিস্টেম পরিচালনা করুন এবং কন্টেন্ট আপডেট করুন</p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.path}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(section.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{section.description}</CardDescription>
                    </div>
                    <div className="ml-4 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(section.path);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    খুলুন
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">মোট ক্যাটেগরি</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">8</div>
              <p className="text-xs text-muted-foreground mt-2">সিস্টেমে নিবন্ধিত</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">মোট প্রশ্ন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,250</div>
              <p className="text-xs text-muted-foreground mt-2">সব ক্যাটেগরিতে</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">সক্রিয় ব্যবহারকারী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">342</div>
              <p className="text-xs text-muted-foreground mt-2">এই মাসে</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

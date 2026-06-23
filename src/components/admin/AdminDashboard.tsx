import { useState } from "react";
import {
  BookOpen,
  Package,
  FileText,
  Users,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { examCatalog } from "@/lib/exam-catalog";

type TabType = "categories" | "subjects" | "chapters" | "questions" | "users" | "analytics";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("categories");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">প্রশ্নব্যাংক অ্যাডমিন প্যানেল</h1>
              <p className="text-sm md:text-base text-muted-foreground">সম্পূর্ণ পরীক্ষা ব্যবস্থাপনা</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="categories" className="text-xs md:text-sm">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">ক্যাটেগরি</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="text-xs md:text-sm">
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">বিষয়</span>
            </TabsTrigger>
            <TabsTrigger value="chapters" className="text-xs md:text-sm">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">অধ্যায়</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">প্রশ্ন</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">ব্যবহারকারী</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">বিশ্লেষণ</span>
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <CategoriesManagement />
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <SubjectsManagement />
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-4">
            <ChaptersManagement />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <QuestionsManagement searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <UsersManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Categories Management Component
const CategoriesManagement = () => {
  const categories = examCatalog.categories;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ক্যাটেগরি ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন ক্যাটেগরি
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ক্যাটেগরি নাম</TableHead>
                  <TableHead className="text-center">বিষয়ের সংখ্যা</TableHead>
                  <TableHead className="text-center">অধ্যায়ের সংখ্যা</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-center">{category.subjects.length}</TableCell>
                    <TableCell className="text-center">
                      {category.subjects.reduce((sum, subj) => sum + (subj.chapters?.length || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Edit2 className="w-3 h-3" />
                          সম্পাদনা
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1">
                          <Trash2 className="w-3 h-3" />
                          মুছুন
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Subjects Management Component
const SubjectsManagement = () => {
  const allSubjects = examCatalog.categories.flatMap((cat) => cat.subjects);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">বিষয় ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন বিষয়
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>বিষয় নাম</TableHead>
                  <TableHead className="text-center">টপিকের সংখ্যা</TableHead>
                  <TableHead className="text-center">প্রশ্নের সংখ্যা</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSubjects.slice(0, 10).map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell className="text-center">{subject.topics?.length || 0}</TableCell>
                    <TableCell className="text-center">0</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Chapters Management Component
const ChaptersManagement = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">অধ্যায় ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন অধ্যায়
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">সব অধ্যায়</CardTitle>
          <CardDescription>বিভিন্ন বিষয়ের অধ্যায় এবং টপিক সম্পাদনা করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { chapter: "অধ্যায়-০১", name: "গদ্য", subject: "বাংলা ১ম পত্র", topics: 3 },
              { chapter: "অধ্যায়-०२", name: "কবিতা", subject: "বাংলা ১ম পত্র", topics: 2 },
              { chapter: "অধ্যায়-०३", name: "নাটক", subject: "বাংলা ১ম পত্র", topics: 2 },
            ].map((item) => (
              <div
                key={item.chapter}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <div>
                  <p className="font-semibold">{item.chapter} - {item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.subject} • {item.topics} টপিক</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Questions Management Component
const QuestionsManagement = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">প্রশ্ন ব্যবস্থাপনা</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="প্রশ্ন খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            নতুন প্রশ্ন
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>এখানে প্রশ্ন যুক্ত করুন এবং পরিচালনা করুন</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Users Management Component
const UsersManagement = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ব্যবহারকারী ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন ব্যবহারকারী
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">গত মাসে +234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">সক্রিয় ছাত্র</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">892</div>
            <p className="text-xs text-muted-foreground mt-1">গত সপ্তাহে সক্রিয়</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">শিক্ষক এবং প্রশাসক</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">সম্পূর্ণ অ্যাক্সেস সহ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>ইমেইল</TableHead>
                  <TableHead>ভূমিকা</TableHead>
                  <TableHead className="text-center">অবস্থা</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "আহমেদ", email: "ahmed@mail.com", role: "ছাত্র", status: "সক্রিয়" },
                  { name: "ফাতিমা", email: "fatima@mail.com", role: "শিক্ষক", status: "সক্রিয়" },
                  { name: "করিম", email: "karim@mail.com", role: "অ্যাডমিন", status: "সক্রিয়" },
                ].map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        সম্পাদনা
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Overview Component
const AnalyticsOverview = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">সিস্টেম বিশ্লেষণ</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">মোট প্রশ্ন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5,678</div>
            <p className="text-xs text-muted-foreground mt-1">সব ক্যাটেগরিতে</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">মোট পরীক্ষা</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">234</div>
            <p className="text-xs text-muted-foreground mt-1">সক্রিয় এবং সম্পন্ন</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">মোট প্রচেষ্টা</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,456</div>
            <p className="text-xs text-muted-foreground mt-1">সব সময়ে</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">গড় স্কোর</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground mt-1">সব ছাত্রদের জন্য</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
          <CardDescription>গত ৭ দিনের সিস্টেম কার্যকলাপ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "নতুন ছাত্র নিবন্ধন", count: 45, time: "আজ" },
              { action: "পরীক্ষা সম্পন্ন", count: 234, time: "গত ৭ দিন" },
              { action: "প্রশ্ন যোগ করা", count: 12, time: "আজ" },
              { action: "শিক্ষক যোগ করা", count: 5, time: "এই সপ্তাহে" },
            ].map((item) => (
              <div key={item.action} className="flex justify-between items-center p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

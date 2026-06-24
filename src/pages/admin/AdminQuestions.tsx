import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";

export default function AdminQuestions() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">প্রশ্ন ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সব প্রশ্ন যোগ করুন, সম্পাদনা করুন এবং পরিচালনা করুন</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
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
            নতুন প্রশ্ন যোগ করুন
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              প্রশ্নের তালিকা (0)
            </CardTitle>
            <CardDescription>সব বিষয় এবং অধ্যায় থেকে প্রশ্ন</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">এখনো কোনো প্রশ্ন নেই</p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                প্রথম প্রশ্ন যোগ করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { buildOmrSheetHtml, openPrintWindow, readInstitutionProfile } from "@/lib/teacherPaper";

export default function OmrSheetPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState("50");
  const [optionCount, setOptionCount] = useState("4");
  const [columns, setColumns] = useState("2");

  const handlePrint = () => {
    const count = Math.min(Math.max(Number(questionCount) || 0, 1), 200);
    const html = buildOmrSheetHtml({
      title: title.trim(),
      questionCount: count,
      optionCount: Number(optionCount) || 4,
      columns: Number(columns) || 2,
      institution: readInstitutionProfile(user?.user_metadata),
    });
    if (!openPrintWindow(html)) {
      toast({
        title: "ত্রুটি",
        description: "পপ-আপ ব্লকড। Pop-up allow করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>OMR শিট তৈরী</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            কাস্টমাইজড OMR উত্তরপত্র তৈরি করে প্রিন্ট করুন। প্রতিষ্ঠানের নাম হেডারে অটোমেটিক আসবে।
          </p>
          <div>
            <Label>টাইটেল</Label>
            <Input className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: সাপ্তাহিক মডেল টেস্ট" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>প্রশ্ন সংখ্যা</Label>
              <Input
                className="mt-2"
                type="number"
                min={1}
                max={200}
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              />
            </div>
            <div>
              <Label>অপশন</Label>
              <Select value={optionCount} onValueChange={setOptionCount}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">২ (A-B)</SelectItem>
                  <SelectItem value="3">৩ (A-C)</SelectItem>
                  <SelectItem value="4">৪ (A-D)</SelectItem>
                  <SelectItem value="5">৫ (A-E)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>কলাম</Label>
              <Select value={columns} onValueChange={setColumns}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">১</SelectItem>
                  <SelectItem value="2">২</SelectItem>
                  <SelectItem value="3">৩</SelectItem>
                  <SelectItem value="4">৪</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> প্রিন্ট / PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OMR সম্পর্কে</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• ১০-২০০ প্রশ্নের কাস্টম OMR শিট তৈরি করা যাবে।</p>
          <p>• A-E পর্যন্ত অপশন এবং একাধিক কলাম সাপোর্ট করে।</p>
          <p>• শিট প্রিন্ট করে পরীক্ষা নিন, তারপর "OMR মূল্যায়ন" ট্যাব থেকে রেজাল্ট বের করুন।</p>
        </CardContent>
      </Card>
    </div>
  );
}

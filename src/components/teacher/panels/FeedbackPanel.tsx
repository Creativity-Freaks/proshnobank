import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const SUPPORT_EMAIL = "info.proshnobank@gmail.com";

export default function FeedbackPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState("feature");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      toast({ title: "ত্রুটি", description: "আপনার মতামত লিখুন।", variant: "destructive" });
      return;
    }
    const subject = `ProshnoBank Feedback (${category})`;
    const body = [
      `Category: ${category}`,
      `From: ${user?.email ?? "teacher"}`,
      "",
      message.trim(),
    ].join("\n");
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    toast({ title: "ধন্যবাদ!", description: "আপনার মেইল ক্লায়েন্টে মতামত প্রস্তুত করা হয়েছে।" });
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>মতামত জানান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            প্রশ্ন তৈরী, OMR মূল্যায়ন বা অনলাইন পরীক্ষার যেকোনো উন্নতিতে আপনার মতামতই আমাদের কাছে সবচেয়ে গুরুত্বপূর্ণ।
          </p>
          <div>
            <Label>ধরন</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">নতুন ফিচার অনুরোধ</SelectItem>
                <SelectItem value="bug">সমস্যা/বাগ রিপোর্ট</SelectItem>
                <SelectItem value="improvement">উন্নতির পরামর্শ</SelectItem>
                <SelectItem value="other">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>আপনার মতামত</Label>
            <Textarea
              className="mt-2"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="এখানে লিখুন..."
            />
          </div>
          <Button onClick={handleSend}>
            <Send className="mr-2 h-4 w-4" /> পাঠান
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>কেন মতামত দেবেন?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✅ আপনার পরামর্শ অনুযায়ী নতুন ফিচার যুক্ত হয়।</p>
          <p>✅ সমস্যা দ্রুত সমাধান করা হয়।</p>
          <p>✅ শিক্ষকদের চাহিদা অনুযায়ী প্ল্যাটফর্ম উন্নত হয়।</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">ব্যবহারকারী ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">ছাত্র, শিক্ষক এবং অ্যাডমিন পরিচালনা করুন</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">মোট ব্যবহারকারী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">সক্রিয় ছাত্র</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">892</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">শিক্ষক</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">45</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            নতুন ব্যবহারকারী যোগ করুন
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              সব ব্যবহারকারী
            </CardTitle>
            <CardDescription>সিস্টেমের সব ব্যবহারকারী</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">কোনো ব্যবহারকারী নেই</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

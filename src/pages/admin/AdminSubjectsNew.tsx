import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/BackButton";
import { examCatalog } from "@/lib/exam-catalog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminSubjectsNew() {
  const [selectedCategory, setSelectedCategory] = useState<string>(examCatalog.categories[0]?.id || "");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", id: "" });

  const category = examCatalog.categories.find((cat) => cat.id === selectedCategory);
  const subjects = category?.subjects || [];

  const handleAddSubject = () => {
    if (formData.name.trim()) {
      // In real app, this would update database
      console.log("Adding subject:", formData);
      setFormData({ name: "", id: "" });
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">বিষয় ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সব পরীক্ষার বিষয় এবং টপিক পরিচালনা করুন</p>
        </div>

        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">ক্যাটেগরি নির্বাচন করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="ক্যাটেগরি বেছে নিন" />
              </SelectTrigger>
              <SelectContent>
                {examCatalog.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.subjects.length} বিষয়)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Add Subject Button */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                নতুন বিষয় যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>নতুন বিষয় যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject-name">বিষয় নাম *</Label>
                  <Input
                    id="subject-name"
                    placeholder="যেমন: বাংলা ১ম পত্র"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject-id">বিষয় ID (ঐচ্ছিক)</Label>
                  <Input
                    id="subject-id"
                    placeholder="যেমন: bangla_1"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddSubject} className="w-full">
                  বিষয় যোগ করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {category?.name} - বিষয়সমূহ ({subjects.length})
            </CardTitle>
            <CardDescription>এই ক্যাটেগরির সব বিষয় এবং টপিক</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>বিষয় নাম</TableHead>
                    <TableHead className="text-center">ID</TableHead>
                    <TableHead className="text-center">টপিক সংখ্যা</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {subject.id}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-800">{subject.topics?.length || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit2 className="w-3 h-3" />
                            সম্পাদনা
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-2">
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

            {subjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">এই ক্যাটেগরিতে কোনো বিষয় নেই</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Plus, Edit2, Trash2, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/BackButton";
import { examCatalog } from "@/lib/exam-catalog";
import { Badge } from "@/components/ui/badge";
import { getChaptersForSubject } from "@/lib/curriculum-chapters";

export default function AdminChaptersNew() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    description: "",
    topics: "",
  });

  const allSubjects = examCatalog.categories.flatMap((cat) => cat.subjects);
  const selectedSubjectData = allSubjects.find((s) => s.id === selectedSubject);
  const chapters = selectedSubject ? getChaptersForSubject(selectedSubject) : [];

  const handleAddChapter = () => {
    if (formData.name.trim() && formData.number.trim()) {
      console.log("Adding chapter:", formData);
      setFormData({ number: "", name: "", description: "", topics: "" });
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">অধ্যায় ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">বিষয়ের অধ্যায় এবং টপিক যোগ করুন ও সম্পাদনা করুন</p>
        </div>

        {/* Subject Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">বিষয় নির্বাচন করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="বিষয় বেছে নিন" />
              </SelectTrigger>
              <SelectContent>
                {allSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedSubject && (
          <>
            {/* Add Chapter Button */}
            <div className="mb-6">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    নতুন অধ্যায় যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>নতুন অধ্যায় যোগ করুন ({selectedSubjectData?.name})</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="chapter-number">অধ্যায় নম্বর *</Label>
                      <Input
                        id="chapter-number"
                        type="number"
                        placeholder="যেমন: 1"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chapter-name">অধ্যায় নাম *</Label>
                      <Input
                        id="chapter-name"
                        placeholder="যেমন: গদ্য"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chapter-desc">বর্ণনা (ঐচ্ছিক)</Label>
                      <Textarea
                        id="chapter-desc"
                        placeholder="এই অধ্যায় সম্পর্কে বর্ণনা..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chapter-topics">টপিকসমূহ (কমা দিয়ে আলাদা করুন)</Label>
                      <Textarea
                        id="chapter-topics"
                        placeholder="টপিক ১, টপিক ২, টপিক ३"
                        value={formData.topics}
                        onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddChapter} className="w-full">
                      অধ্যায় যোগ করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Chapters List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedSubjectData?.name} - অধ্যায়সমূহ ({chapters.length})
                </CardTitle>
                <CardDescription>সব অধ্যায় এবং তাদের টপিক দেখুন এবং পরিচালনা করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      {/* Chapter Header */}
                      <button
                        onClick={() =>
                          setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedChapter === chapter.id ? "rotate-180" : ""
                            }`}
                          />
                          <div>
                            <p className="font-semibold">
                              অধ্যায়-{String(chapter.number).padStart(2, "0")} {chapter.name}
                            </p>
                            <p className="text-xs text-muted-foreground">ID: {chapter.id}</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{chapter.topics.length} টপিক</Badge>
                      </button>

                      {/* Chapter Content (Expanded) */}
                      {expandedChapter === chapter.id && (
                        <div className="px-4 pb-4 pt-2 bg-muted/20 border-t border-border space-y-3">
                          {/* Topics */}
                          <div>
                            <p className="text-sm font-medium mb-2">টপিকসমূহ:</p>
                            <div className="space-y-1">
                              {chapter.topics.map((topic) => (
                                <div
                                  key={topic}
                                  className="flex items-center justify-between p-2 bg-background rounded border border-border/50"
                                >
                                  <span className="text-sm">{topic}</span>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Chapter Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 gap-2">
                              <Edit2 className="w-3 h-3" />
                              অধ্যায় সম্পাদনা
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1 gap-2">
                              <Trash2 className="w-3 h-3" />
                              অধ্যায় মুছুন
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {chapters.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">এই বিষয়ে কোনো অধ্যায় নেই</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedSubject && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">অধ্যায় দেখতে একটি বিষয় নির্বাচন করুন</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

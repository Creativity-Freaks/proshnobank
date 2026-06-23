import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { doubtApi } from "@/lib/doubt-api";
import {
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Clock,
  User,
  Search,
  Filter,
} from "lucide-react";

interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic?: string;
  priority: string;
  status: string;
  views: number;
  helpful_count: number;
  created_at: string;
  student_id: string;
}

export default function DoubtForum() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDoubt, setNewDoubt] = useState({
    title: "",
    description: "",
    subject: "",
    priority: "medium" as const,
  });

  useEffect(() => {
    loadDoubts();
  }, []);

  const loadDoubts = async () => {
    try {
      setLoading(true);
      const { data } = await doubtApi.getOpenDoubts();
      setDoubts(data || []);
    } catch (error) {
      console.error("[v0] Error loading doubts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await doubtApi.createDoubt(newDoubt);
      setNewDoubt({ title: "", description: "", subject: "", priority: "medium" });
      setShowCreateForm(false);
      await loadDoubts();
    } catch (error) {
      console.error("[v0] Error creating doubt:", error);
    }
  };

  const filteredDoubts = doubts.filter((doubt) => {
    const matchesSearch =
      doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || doubt.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-50 border-green-200";
      case "answered":
        return "bg-blue-50 border-blue-200";
      case "open":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">প্রশ্ন ও সমাধান</h1>
          </div>
          <p className="text-gray-600">
            যেকোনো প্রশ্ন জিজ্ঞাসা করুন এবং শিক্ষক ও সমবয়সীদের সাহায্য পান
          </p>
        </div>

        {/* Create New Doubt Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            নতুন প্রশ্ন জিজ্ঞাসা করুন
          </Button>
        </div>

        {/* Create Doubt Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8 border-2 border-blue-200">
            <form onSubmit={handleCreateDoubt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বিষয়
                </label>
                <Input
                  type="text"
                  placeholder="যেমন: গণিত, বিজ্ঞান, ইংরেজি"
                  value={newDoubt.subject}
                  onChange={(e) =>
                    setNewDoubt({ ...newDoubt, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রশ্নের শিরোনাম
                </label>
                <Input
                  type="text"
                  placeholder="সংক্ষিপ্ত ও পরিষ্কার শিরোনাম লিখুন"
                  value={newDoubt.title}
                  onChange={(e) =>
                    setNewDoubt({ ...newDoubt, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বিস্তারিত বর্ণনা
                </label>
                <Textarea
                  placeholder="আপনার প্রশ্নের বিস্তারিত বর্ণনা লিখুন"
                  value={newDoubt.description}
                  onChange={(e) =>
                    setNewDoubt({ ...newDoubt, description: e.target.value })
                  }
                  required
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  অগ্রাধিকার
                </label>
                <select
                  value={newDoubt.priority}
                  onChange={(e) =>
                    setNewDoubt({
                      ...newDoubt,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">কম (Low)</option>
                  <option value="medium">মাঝারি (Medium)</option>
                  <option value="high">বেশি (High)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  প্রশ্ন জমা দিন
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  বাতিল করুন
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="প্রশ্ন খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex gap-2">
            <Filter className="w-4 h-4" />
            ফিল্টার
          </Button>
        </div>

        {/* Doubts List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">লোড করা হচ্ছে...</p>
            </Card>
          ) : filteredDoubts.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">কোনো প্রশ্ন পাওয়া যায়নি</p>
            </Card>
          ) : (
            filteredDoubts.map((doubt) => (
              <Card
                key={doubt.id}
                className={`p-4 cursor-pointer hover:shadow-md transition border-l-4 ${getStatusColor(doubt.status)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {doubt.title}
                    </h3>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{doubt.subject}</Badge>
                      {doubt.topic && (
                        <Badge variant="outline">{doubt.topic}</Badge>
                      )}
                      <Badge className={getPriorityColor(doubt.priority)}>
                        {doubt.priority}
                      </Badge>
                      <Badge
                        variant={
                          doubt.status === "resolved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {doubt.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doubt.description}
                </p>

                <div className="flex gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(doubt.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>সমাধান</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{doubt.helpful_count} সহায়ক</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{doubt.views} দেখা হয়েছে</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle,
  FileText,
  ChevronRight,
  Star,
  BarChart3
} from "lucide-react";

const examDetails = {
  id: 1,
  title: "BCS প্রিলিমিনারি মডেল টেস্ট - ০১",
  category: "BCS",
  description: "৪৭তম BCS প্রিলিমিনারি পরীক্ষার প্রস্তুতির জন্য সেরা মডেল টেস্ট। বিগত বছরের প্রশ্ন প্যাটার্ন অনুযায়ী তৈরি।",
  questions: 200,
  duration: "২ ঘণ্টা ৩০ মিনিট",
  marks: 200,
  negative: 0.5,
  attempts: 5620,
  rating: 4.8,
  difficulty: "মধ্যম",
  subjects: [
    { name: "বাংলা", questions: 35, marks: 35 },
    { name: "ইংরেজি", questions: 35, marks: 35 },
    { name: "গণিত", questions: 15, marks: 15 },
    { name: "সাধারণ বিজ্ঞান", questions: 15, marks: 15 },
    { name: "কম্পিউটার ও তথ্যপ্রযুক্তি", questions: 15, marks: 15 },
    { name: "বাংলাদেশ বিষয়াবলী", questions: 30, marks: 30 },
    { name: "আন্তর্জাতিক বিষয়াবলী", questions: 20, marks: 20 },
    { name: "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা", questions: 10, marks: 10 },
    { name: "নৈতিকতা, মূল্যবোধ ও সুশাসন", questions: 10, marks: 10 },
    { name: "মানসিক দক্ষতা", questions: 15, marks: 15 },
  ],
  features: [
    "বিগত বছরের প্রশ্ন প্যাটার্ন অনুযায়ী",
    "বিস্তারিত সমাধান সহ",
    "টপার্সদের টিপস",
    "পারফরম্যান্স অ্যানালাইসিস",
  ],
};

const ExamDetails = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="secondary">{examDetails.category}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                    {examDetails.rating}
                  </Badge>
                  <Badge variant="outline">{examDetails.difficulty}</Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {examDetails.title}
                </h1>

                <p className="text-muted-foreground mb-6">{examDetails.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{examDetails.questions}</p>
                    <p className="text-sm text-muted-foreground">প্রশ্ন</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{examDetails.duration}</p>
                    <p className="text-sm text-muted-foreground">সময়</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{examDetails.marks}</p>
                    <p className="text-sm text-muted-foreground">মার্কস</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{examDetails.attempts.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">অংশগ্রহণ</p>
                  </div>
                </div>

                {/* Subject Breakdown */}
                <h2 className="text-xl font-bold text-foreground mb-4">বিষয়ভিত্তিক প্রশ্ন বণ্টন</h2>
                <div className="space-y-3 mb-8">
                  {examDetails.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{subject.questions} প্রশ্ন</span>
                        <span className="font-medium text-primary">{subject.marks} মার্কস</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <h2 className="text-xl font-bold text-foreground mb-4">এক্সামের বৈশিষ্ট্য</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {examDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-primary mb-1">বিনামূল্যে</p>
                  <p className="text-muted-foreground text-sm">এখনই শুরু করো</p>
                </div>

                <Link to={`/exam/${id}/take`}>
                  <Button variant="hero" className="w-full mb-4" size="lg">
                    পরীক্ষা শুরু করো
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      মোট প্রশ্ন
                    </span>
                    <span className="font-medium text-foreground">{examDetails.questions}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      সময়
                    </span>
                    <span className="font-medium text-foreground">{examDetails.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      মোট মার্কস
                    </span>
                    <span className="font-medium text-foreground">{examDetails.marks}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      নেগেটিভ মার্কিং
                    </span>
                    <span className="font-medium text-foreground">-{examDetails.negative}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      অংশগ্রহণ
                    </span>
                    <span className="font-medium text-foreground">{examDetails.attempts.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>টিপস:</strong> পরীক্ষা শুরু করার আগে সব প্রশ্ন পড়ে নাও এবং সহজ প্রশ্ন আগে উত্তর দাও।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExamDetails;

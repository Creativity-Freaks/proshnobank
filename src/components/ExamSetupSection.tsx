import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { getChaptersForSubject } from "@/lib/curriculum-chapters";

interface Subject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

interface ExamSetupSectionProps {
  subjects: Subject[];
  title?: string;
  showChapters?: boolean;
  onSelectionChange?: (selectedSubjects: string[], selectedTopics: Record<string, string[]>, selectedChapters: Record<string, string[]>) => void;
}

export function ExamSetupSection({
  subjects,
  title = "বিষয় ও টপিক নির্বাচন",
  showChapters = true,
  onSelectionChange,
}: ExamSetupSectionProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string[]>>({});
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const handleSubjectToggle = (subjectId: string) => {
    const newSelected = selectedSubjects.includes(subjectId)
      ? selectedSubjects.filter((s) => s !== subjectId)
      : [...selectedSubjects, subjectId];
    setSelectedSubjects(newSelected);
    onSelectionChange?.(newSelected, selectedTopics, selectedChapters);
  };

  const handleTopicToggle = (subjectId: string, topicId: string) => {
    const currentTopics = selectedTopics[subjectId] || [];
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter((t) => t !== topicId)
      : [...currentTopics, topicId];
    
    const updated = { ...selectedTopics, [subjectId]: newTopics };
    setSelectedTopics(updated);
    onSelectionChange?.(selectedSubjects, updated, selectedChapters);
  };

  const handleChapterToggle = (subjectId: string, chapterId: string) => {
    const currentChapters = selectedChapters[subjectId] || [];
    const newChapters = currentChapters.includes(chapterId)
      ? currentChapters.filter((c) => c !== chapterId)
      : [...currentChapters, chapterId];
    
    const updated = { ...selectedChapters, [subjectId]: newChapters };
    setSelectedChapters(updated);
    onSelectionChange?.(selectedSubjects, selectedTopics, updated);
  };

  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      
      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="border border-border rounded-lg overflow-hidden">
            {/* Subject Header */}
            <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={selectedSubjects.includes(subject.id)}
                onCheckedChange={() => handleSubjectToggle(subject.id)}
              />
              <span className="font-medium flex-1">{subject.name}</span>
            </div>

            {/* Chapters & Topics */}
            {selectedSubjects.includes(subject.id) && (
              <div className="px-3 pb-3 pt-2 bg-muted/20 border-t border-border space-y-3">
                {/* Chapters Section */}
                {showChapters && getChaptersForSubject(subject.id).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>অধ্যায় নির্বাচন</span>
                    </div>
                    <div className="space-y-2">
                      {getChaptersForSubject(subject.id).map((chapter) => (
                        <div key={chapter.id} className="border border-border rounded bg-background">
                          <button
                            onClick={() => toggleChapterExpand(chapter.id)}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={(selectedChapters[subject.id] || []).includes(chapter.id)}
                                onCheckedChange={() => handleChapterToggle(subject.id, chapter.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm">অধ্যায়-{String(chapter.number).padStart(2, '0')} {chapter.name}</span>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                expandedChapters[chapter.id] ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {expandedChapters[chapter.id] && (
                            <div className="px-2 pb-2 pt-1 bg-muted/20 space-y-1 border-t border-border">
                              {chapter.topics.map((topic) => (
                                <label
                                  key={topic}
                                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 p-1 rounded"
                                >
                                  <Checkbox
                                    checked={(selectedTopics[subject.id] || []).includes(topic)}
                                    onCheckedChange={() => handleTopicToggle(subject.id, topic)}
                                  />
                                  <span>{topic}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics Section */}
                {subject.topics && subject.topics.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Layers className="w-4 h-4" />
                      <span>টপিক নির্বাচন</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subject.topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicToggle(subject.id, topic.id)}
                          className={`px-3 py-1 rounded-lg text-xs transition-all ${
                            (selectedTopics[subject.id] || []).includes(topic.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {topic.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

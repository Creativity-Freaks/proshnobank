import { useState, useCallback } from "react";

export interface ExamSetupConfig {
  selectedSubjects: string[];
  selectedTopics: Record<string, string[]>;
  selectedChapters: Record<string, string[]>;
  questionCount: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarkingEnabled: boolean;
  negativeMarkValue: string;
  difficulty: string;
}

export function useExamSetup(initialConfig?: Partial<ExamSetupConfig>) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialConfig?.selectedSubjects || []
  );
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string[]>>(
    initialConfig?.selectedTopics || {}
  );
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>(
    initialConfig?.selectedChapters || {}
  );
  const [questionCount, setQuestionCount] = useState(initialConfig?.questionCount || 25);
  const [duration, setDuration] = useState(initialConfig?.duration || 30);
  const [marksPerQuestion, setMarksPerQuestion] = useState(initialConfig?.marksPerQuestion || 1);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(
    initialConfig?.negativeMarkingEnabled || false
  );
  const [negativeMarkValue, setNegativeMarkValue] = useState(initialConfig?.negativeMarkValue || "0.25");
  const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || "all");

  const handleSubjectToggle = useCallback((subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  }, []);

  const handleTopicToggle = useCallback((subjectId: string, topicId: string) => {
    setSelectedTopics((prev) => {
      const currentTopics = prev[subjectId] || [];
      return {
        ...prev,
        [subjectId]: currentTopics.includes(topicId)
          ? currentTopics.filter((t) => t !== topicId)
          : [...currentTopics, topicId],
      };
    });
  }, []);

  const handleChapterToggle = useCallback((subjectId: string, chapterId: string) => {
    setSelectedChapters((prev) => {
      const currentChapters = prev[subjectId] || [];
      return {
        ...prev,
        [subjectId]: currentChapters.includes(chapterId)
          ? currentChapters.filter((c) => c !== chapterId)
          : [...currentChapters, chapterId],
      };
    });
  }, []);

  const getConfig = useCallback((): ExamSetupConfig => {
    return {
      selectedSubjects,
      selectedTopics,
      selectedChapters,
      questionCount,
      duration,
      marksPerQuestion,
      negativeMarkingEnabled,
      negativeMarkValue,
      difficulty,
    };
  }, [
    selectedSubjects,
    selectedTopics,
    selectedChapters,
    questionCount,
    duration,
    marksPerQuestion,
    negativeMarkingEnabled,
    negativeMarkValue,
    difficulty,
  ]);

  const reset = useCallback(() => {
    setSelectedSubjects([]);
    setSelectedTopics({});
    setSelectedChapters({});
    setQuestionCount(25);
    setDuration(30);
    setMarksPerQuestion(1);
    setNegativeMarkingEnabled(false);
    setNegativeMarkValue("0.25");
    setDifficulty("all");
  }, []);

  return {
    selectedSubjects,
    setSelectedSubjects,
    selectedTopics,
    setSelectedTopics,
    selectedChapters,
    setSelectedChapters,
    questionCount,
    setQuestionCount,
    duration,
    setDuration,
    marksPerQuestion,
    setMarksPerQuestion,
    negativeMarkingEnabled,
    setNegativeMarkingEnabled,
    negativeMarkValue,
    setNegativeMarkValue,
    difficulty,
    setDifficulty,
    handleSubjectToggle,
    handleTopicToggle,
    handleChapterToggle,
    getConfig,
    reset,
  };
}

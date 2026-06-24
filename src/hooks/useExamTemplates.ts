import { useQuery } from "@tanstack/react-query";
import { listExamTemplates, type ExamTemplateSummary } from "@/lib/exam-templates";

/**
 * Fetch exam templates for a category slug. Returns React Query state so
 * pages can show loading / empty / error UI consistently.
 */
export function useExamTemplates(category?: string) {
  return useQuery<ExamTemplateSummary[]>({
    queryKey: ["exam-templates", category ?? "all"],
    queryFn: () => listExamTemplates(category),
    staleTime: 1000 * 60 * 5,
  });
}

export type LiveStatus = "upcoming" | "starting-soon" | "live";

export type ExamConfig = {
  category: string;
  subjects: string[];
  topics: Record<string, string[]>;
  questionCount: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarking: number;
  difficulty: string;
};

export type LiveExamItem = {
  id: string;
  eventId: string | null;
  title: string;
  category: string;
  startTime: Date;
  durationLabel: string;
  questions: number;
  participants: number;
  prize: string | null;
  status: LiveStatus;
  config: ExamConfig;
};

export function formatMinutesBn(minutes: number) {
  const total = Math.max(0, Math.trunc(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h.toLocaleString("bn-BD")} ঘণ্টা ${m.toLocaleString("bn-BD")} মিনিট`;
  if (h > 0) return `${h.toLocaleString("bn-BD")} ঘণ্টা`;
  return `${m.toLocaleString("bn-BD")} মিনিট`;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function toTopicsRecord(value: unknown): Record<string, string[]> {
  // If the API returns topics as a flat array ["বীজগণিত", "গতি"], wrap it
  if (Array.isArray(value)) {
    const topics = value.filter((x): x is string => typeof x === "string");
    return topics.length > 0 ? { general: topics } : {};
  }
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const out: Record<string, string[]> = {};
  Object.entries(v).forEach(([k, val]) => {
    out[k] = toStringArray(val);
  });
  return out;
}

export function mapLiveExamRow(value: unknown): LiveExamItem | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  const id = typeof v.id === "string" ? v.id : null;
  const title = typeof v.title === "string" ? v.title : null;
  const category = typeof v.category === "string" ? v.category : null;
  const start = typeof v.start_time === "string" ? new Date(v.start_time) : null;
  const eventId = typeof v.event_id === "string" ? v.event_id : null;
  const status =
    v.status === "upcoming" || v.status === "starting-soon" || v.status === "live"
      ? (v.status as LiveStatus)
      : "upcoming";

  const participants = typeof v.participants === "number" ? v.participants : 0;
  const prize = typeof v.prize === "string" ? v.prize : null;
  const questionCount = typeof v.question_count === "number" ? v.question_count : 10;
  const durationMinutes = typeof v.duration_minutes === "number" ? v.duration_minutes : 30;
  const marksPerQuestion =
    typeof v.marks_per_question === "number" || typeof v.marks_per_question === "string"
      ? Number(v.marks_per_question)
      : 1;
  const negativeMarks =
    typeof v.negative_marks === "number" || typeof v.negative_marks === "string"
      ? Number(v.negative_marks)
      : 0;
  const difficulty = typeof v.difficulty === "string" ? v.difficulty : "all";
  const subjects = toStringArray(v.subjects);
  const topics = toTopicsRecord(v.topics);

  if (!id || !title || !category || !start || Number.isNaN(start.getTime())) return null;

  return {
    id,
    eventId,
    title,
    category,
    startTime: start,
    durationLabel: formatMinutesBn(durationMinutes),
    questions: questionCount,
    participants,
    prize,
    status,
    config: {
      category,
      subjects,
      topics,
      questionCount,
      duration: durationMinutes,
      marksPerQuestion,
      negativeMarking: negativeMarks,
      difficulty,
    },
  };
}

export function getTimeRemainingLabel(startTime: Date) {
  const diff = startTime.getTime() - Date.now();
  if (diff <= 0) return "শুরু হয়েছে";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} দিন বাকি`;
  }

  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

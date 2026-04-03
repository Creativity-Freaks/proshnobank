import * as React from "react";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  Contact,
  FileUp,
  Home,
  ListChecks,
  MessagesSquare,
  School,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type TeacherView =
  | "overview"
  | "questions"
  | "builder"
  | "schedule"
  | "upload"
  | "ready_questions"
  | "reports"
  | "share"
  | "students"
  | "institution"
  | "subscription"
  | "omr_evaluator"
  | "omr_create"
  | "omr_token"
  | "omr_grade"
  | "contact"
  | "feedback";

type NavItem = {
  key: TeacherView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "সার্বিক চিত্র",
    items: [{ key: "overview", label: "ড্যাশবোর্ড", icon: Home }],
  },
  {
    title: "কাজ শুরু",
    items: [
      { key: "questions", label: "১ ক্লিক প্রশ্ন তৈরী", icon: Sparkles, badge: "NEW" },
      { key: "builder", label: "প্রশ্নপত্র/টেমপ্লেট", icon: ListChecks },
      { key: "upload", label: "প্রশ্নপত্র আপলোড", icon: FileUp },
    ],
  },
  {
    title: "প্যাকেজ",
    items: [
      { key: "ready_questions", label: "রেডি প্রশ্ন/সাজেশন", icon: BookOpen },
      { key: "reports", label: "বিস্তারিত রিপোর্ট", icon: ClipboardList },
    ],
  },
  {
    title: "ব্যবস্থাপনা",
    items: [
      { key: "schedule", label: "অনলাইন পরীক্ষা", icon: CalendarClock },
      { key: "students", label: "শিক্ষার্থী", icon: Users },
      { key: "share", label: "সহজে শেয়ার", icon: Share2 },
    ],
  },
  {
    title: "প্রতিষ্ঠান সংক্রান্ত",
    items: [
      { key: "institution", label: "আমার প্রতিষ্ঠান", icon: School },
      { key: "subscription", label: "আমার সাবস্ক্রিপশন", icon: MessagesSquare },
    ],
  },
  {
    title: "OMR সাপোর্ট",
    items: [
      { key: "omr_evaluator", label: "OMR Evaluator", icon: ClipboardList },
      { key: "omr_create", label: "OMR তৈরী", icon: ListChecks },
      { key: "omr_token", label: "OMR টোকেন", icon: MessagesSquare },
      { key: "omr_grade", label: "OMR মূল্যায়ন", icon: ClipboardList },
    ],
  },
  {
    title: "হেল্প লাইন",
    items: [
      { key: "contact", label: "যোগাযোগ", icon: Contact },
      { key: "feedback", label: "মতামত", icon: MessagesSquare },
    ],
  },
];

export function TeacherSidebar({
  activeView,
  onChangeView,
}: {
  activeView: TeacherView;
  onChangeView: (view: TeacherView) => void;
}) {
  return (
    <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-sm font-semibold">PB</span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">ProshnoBank</div>
          <div className="text-xs text-muted-foreground">Teacher Panel</div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-4 last:mb-0">
            <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground">{section.title}</div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <Button
                    key={item.key}
                    type="button"
                    variant="ghost"
                    onClick={() => onChangeView(item.key)}
                    className={cn(
                      "w-full justify-start gap-3 rounded-xl px-3 py-2",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border",
                        isActive
                          ? "border-primary-foreground/20 bg-primary-foreground/10"
                          : "border-border bg-background"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary-foreground" : "text-primary"
                        )}
                      />
                    </span>
                    <span className={cn("text-sm", isActive ? "text-primary-foreground" : "text-foreground")}>
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

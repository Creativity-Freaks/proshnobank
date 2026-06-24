# Reusable Components Usage Guide

এই গাইড দেখায় কিভাবে admin, database, এবং user site জুড়ে consistent components ব্যবহার করতে হয়।

## 1. BackButton Component

সব pages এ navigation back button এর জন্য।

### ব্যবহার:

```tsx
import { BackButton } from "@/components/BackButton";

export function MyPage() {
  return (
    <div>
      <BackButton />
      {/* Rest of page */}
    </div>
  );
}
```

### Props:

- `label?: string` - Button text (default: "ফিরে যান")
- `className?: string` - Additional CSS classes

---

## 2. PageHeader Component

Consistent page headers সব pages এ।

### ব্যবহার:

```tsx
import { PageHeader } from "@/components/PageHeader";
import { Settings } from "lucide-react";

export function MyPage() {
  return (
    <div>
      <PageHeader
        title="কাস্টম এক্সাম সেটআপ"
        subtitle="নিজের পছন্দমতো এক্সাম তৈরি করো"
        icon={<Settings className="w-5 h-5" />}
        showBack={true}
      />
      {/* Rest of page */}
    </div>
  );
}
```

### Props:

- `title: string` - Page title
- `subtitle?: string` - Optional subtitle
- `icon?: ReactNode` - Optional icon
- `showBack?: boolean` - Show back button (default: true)
- `className?: string` - Container classes
- `children?: ReactNode` - Additional content

---

## 3. ExamSetupSection Component

Reusable subject/chapter/topic selection - admin dashboard এ এবং user exam setup পেজে উভয়েই।

### ব্যবহার:

```tsx
import { ExamSetupSection } from "@/components/ExamSetupSection";

export function AdminExamManager() {
  const subjects = [...]; // From database
  const [selections, setSelections] = useState({});

  const handleSelectionChange = (subjects, topics, chapters) => {
    setSelections({ subjects, topics, chapters });
  };

  return (
    <ExamSetupSection
      subjects={subjects}
      title="বিষয় নির্বাচন"
      showChapters={true}
      onSelectionChange={handleSelectionChange}
    />
  );
}
```

### Props:

- `subjects: Subject[]` - Array of subjects with topics
- `title?: string` - Section title
- `showChapters?: boolean` - Show chapter dropdowns (default: true)
- `onSelectionChange?: (subjects, topics, chapters) => void` - Callback for changes

### Feature:

- ✅ Bangladesh curriculum chapters automatically loaded from `curriculum-chapters.ts`
- ✅ Expandable chapter dropdowns
- ✅ Topic selection within chapters
- ✅ Mobile-responsive design

---

## 4. useExamSetup Hook

State management সব exam setup সম্পর্কিত logic এর জন্য।

### ব্যবহার:

```tsx
import { useExamSetup } from "@/hooks/useExamSetup";

export function CustomExamPage() {
  const {
    selectedSubjects,
    selectedTopics,
    selectedChapters,
    questionCount,
    duration,
    difficulty,
    handleSubjectToggle,
    handleTopicToggle,
    handleChapterToggle,
    getConfig,
    reset,
  } = useExamSetup({
    questionCount: 50,
    duration: 45,
  });

  const config = getConfig();

  return (
    <div>
      {/* Use state and handlers */}
    </div>
  );
}
```

### Returned Values:

- `selectedSubjects: string[]`
- `selectedTopics: Record<string, string[]>`
- `selectedChapters: Record<string, string[]>`
- `questionCount: number`
- `duration: number`
- `marksPerQuestion: number`
- `negativeMarkingEnabled: boolean`
- `negativeMarkValue: string`
- `difficulty: string`

### Handlers:

- `handleSubjectToggle(subjectId: string)` - Toggle subject selection
- `handleTopicToggle(subjectId, topicId)` - Toggle topic
- `handleChapterToggle(subjectId, chapterId)` - Toggle chapter

### Methods:

- `getConfig()` - Get current configuration object
- `reset()` - Reset all values to defaults

---

## 5. Curriculum Chapters

Bangladesh official curriculum structure for all subjects.

### Available in:

`src/lib/curriculum-chapters.ts`

### Usage:

```tsx
import { getChaptersForSubject } from "@/lib/curriculum-chapters";

const chapters = getChaptersForSubject("ssc_bangla_1");
// Returns:
// [
//   { id: "ssc_bangla_1_ch_01", number: 1, name: "গদ্য", topics: [...] },
//   { id: "ssc_bangla_1_ch_02", number: 2, name: "কবিতা", topics: [...] }
// ]
```

### Supported Subjects:

**SSC:**
- ssc_bangla_1, ssc_bangla_2
- ssc_english_1, ssc_english_2
- ssc_math, ssc_higher_math
- ssc_physics, ssc_chemistry, ssc_biology
- ssc_bd_world, ssc_religion, ssc_ict
- ssc_history, ssc_geography, ssc_economics, ssc_civics
- ssc_accounting, ssc_business

**HSC:**
- hsc_bangla, hsc_english
- hsc_higher_math, hsc_statistics
- hsc_physics, hsc_chemistry, hsc_biology
- hsc_history, hsc_economics
- hsc_accounting, hsc_finance, hsc_management
- hsc_islamic_studies, hsc_social_science

---

## Architecture Benefits

### ✅ No Code Duplication

Same components used everywhere:
- Admin dashboard exam management
- User exam setup pages
- Database queries for chapters
- All category pages (SSC, HSC, Medical, Engineering, Job)

### ✅ Consistent UX

- Same back button style everywhere
- Same chapter dropdown UI
- Same subject selection logic
- Same Bangladesh curriculum data

### ✅ Easy Maintenance

- Change curriculum once, updates everywhere
- Fix a component, benefits admin + user site
- Update hook logic, all pages automatically updated

### ✅ Mobile Friendly

All components are responsive:
- Grid breakpoints: `md:` for tablet+
- Sticky sidebar: only on `md:` screens
- Text sizing: `text-sm md:text-base`
- Spacing: responsive padding/gaps

---

## Example: Adding Back Button to a New Page

```tsx
import { BackButton } from "@/components/BackButton";

export function NewPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          {/* Your content */}
        </div>
      </main>
    </div>
  );
}
```

---

## Example: Creating Admin Exam Manager

```tsx
import { PageHeader } from "@/components/PageHeader";
import { ExamSetupSection } from "@/components/ExamSetupSection";
import { BookOpen } from "lucide-react";

export function AdminExamManager() {
  const subjects = useQuery(...); // Fetch from DB
  const [selections, setSelections] = useState();

  return (
    <div>
      <PageHeader
        title="পরীক্ষা পরিচালনা"
        subtitle="নতুন পরীক্ষা তৈরি করুন এবং বিষয় নির্ধারণ করুন"
        icon={<BookOpen />}
      />

      <ExamSetupSection
        subjects={subjects.data}
        onSelectionChange={setSelections}
      />
    </div>
  );
}
```

---

**Last Updated:** June 2026
**Consistency Level:** 100% - All pages use same components and curriculum data

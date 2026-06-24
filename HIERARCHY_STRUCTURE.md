# Hierarchical Structure - সম্পূর্ণ গাইড

## 📊 The 4-Level Hierarchy

```
Level 1: বেস ক্যাটেগরি (Base Categories - 6 main types)
│
├── SSC
├── HSC
├── Medical (MBBS)
├── Engineering (BUET, CUET, KUET)
├── University
└── Job Exam

    ↓

Level 2: পরীক্ষা ক্যাটেগরি (Exam Categories - Exam Types)
│
├── SSC
│   ├── Regular Board
│   ├── English Medium
│   └── Madrasa
├── HSC
│   ├── Regular Board
│   ├── English Medium
│   └── Vocational
└── ... (etc.)

    ↓

Level 3: বিষয় (Subjects)
│
├── Bangla
├── English
├── Math
├── Science
│   ├── Physics
│   ├── Chemistry
│   └── Biology
└── ... (etc.)

    ↓

Level 4: অধ্যায় (Chapters/Topics)
│
├── Chapter 1: Introduction
├── Chapter 2: First Lesson
├── Chapter 3: Advanced Topics
└── ... (etc.)

    ↓

Questions (প্রশ্ন)
└── Individual exam questions
```

## Admin Panel - Management Structure

### Tab 1: বেস ক্যাটেগরি (Base Categories)
- **Purpose:** Create and manage the 6 main exam categories
- **What you manage:** SSC, HSC, Medical, Engineering, University, Job
- **Example:** Add "SSC" as a new base category

### Tab 2: পরীক্ষা ক্যাটেগরি (Exam Categories)
- **Purpose:** Create exam types under each base category
- **What you manage:** Different board types, medium variations
- **Example:** Under "SSC" → Add "SSC Regular Board", "SSC English Medium"

### Tab 3: বিষয় (Subjects)
- **Purpose:** Create subjects under exam categories
- **What you manage:** Subject names and descriptions
- **Example:** Under "SSC Regular Board" → Add "Bangla", "English", "Math"

### Tab 4: অধ্যায় (Chapters)
- **Purpose:** Create chapters/topics under subjects
- **What you manage:** Chapter numbers and topics
- **Example:** Under "Math" → Add "Chapter 1", "Chapter 2", etc.

### Tab 5: প্রশ্ন (Questions)
- **Purpose:** Link questions to chapters
- **What you manage:** Which chapter each question belongs to
- **Example:** Link question to "Math - Chapter 1"

## Database Tables

| Table | Level | Purpose |
|-------|-------|---------|
| `exam_categories` | Level 1 | Base categories (SSC, HSC, etc.) |
| `category_subcategories` | Level 2 | Exam types (SSC Regular, SSC English, etc.) |
| `subjects` | Level 3 | Subject names (Bangla, English, Math) |
| `chapters` | Level 4 | Chapters under subjects |
| `question_bank` | Level 5 | Questions linked to chapters |

## Terminology Reference

| Bengali | English | Example |
|---------|---------|---------|
| বেস ক্যাটেগরি | Base Category | SSC, HSC |
| পরীক্ষা ক্যাটেগরি | Exam Category | SSC Regular Board |
| বিষয় | Subject | Bangla, Math |
| অধ্যায় | Chapter/Topic | Chapter 1, Chapter 2 |
| প্রশ্ন | Question | Individual exam questions |

## Step-by-Step Setup Example

### Step 1: Create Base Category
1. Go to **বেস ক্যাটেগরি** tab
2. Click **নতুন বেস ক্যাটেগরি**
3. Enter: Name = "SSC", Description = "Secondary School Certificate"
4. Save ✓

### Step 2: Create Exam Category
1. Go to **পরীক্ষা ক্যাটেগরি** tab
2. Select Base Category = "SSC"
3. Click **নতুন পরীক্ষা ক্যাটেগরি**
4. Enter: Name = "Regular Board", Description = "SSC Regular Board Exam"
5. Save ✓

### Step 3: Create Subject
1. Go to **বিষয়** tab
2. Select Category = "SSC" → Subcategory = "Regular Board"
3. Click **নতুন বিষয়**
4. Enter: Name = "Bangla", Description = "Bengali Subject"
5. Save ✓

### Step 4: Create Chapter
1. Go to **অধ্যায়** tab
2. Select Subject = "Bangla"
3. Click **নতুন অধ্যায়**
4. Enter: Name = "Chapter 1", Title = "First Poem"
5. Save ✓

### Step 5: Add Questions
1. Go to **প্রশ্ন** tab
2. Select: Subject = "Bangla" → Chapter = "Chapter 1"
3. Add questions linked to this chapter
4. Save ✓

## Important Notes

1. **Hierarchy is Sequential:** You must create levels in order (Base → Exam Category → Subject → Chapter)
2. **One-to-Many Relationship:** Each base category can have multiple exam categories
3. **Navigation:** Admin panel has clear filtering at each level
4. **SQL Setup:** Already in `/supabase/migrations/` - just needs to be run once
5. **All UI:** Fully in Bengali for user-friendly management

---

**সম্পূর্ণভাবে প্রস্তুত! এখন শুধু Supabase এ SQL রান করুন এবং শুরু করুন।**

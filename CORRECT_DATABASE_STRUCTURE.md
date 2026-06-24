# Correct Database Structure

## ⚠️ Important: NO Separate "categories" Table

The database uses **only ONE table**: `exam_categories` with a `parent_id` column for hierarchy.

---

## Structure

```
┌─ exam_categories (parent_id = NULL)
│  ├─ id, name, slug, description, is_active, parent_id, sort_order
│  └─ Base Categories: SSC, HSC, Medical, Engineering, University, Job
│
├─ exam_categories (parent_id = base_category_id) 
│  └─ Subcategories: SSC 2026, SSC বিজ্ঞান, HSC বিজ্ঞান, etc.
│
├─ subjects
│  ├─ id, name, code, slug, description, is_active
│  └─ Subjects: Bangla, English, Math, Physics, etc.
│
├─ chapters
│  ├─ id, subject_id, chapter_number, chapter_name_bn, chapter_name_en
│  └─ Chapters: Chapter 1, Chapter 2, Chapter 3, etc.
│
├─ chapter_topics
│  ├─ id, chapter_id, topic_name_bn, topic_name_en
│  └─ Topics within chapters
│
└─ question_bank
   ├─ id, subject, question_text, options, correct_answer
   └─ Individual questions (optionally linked to chapter_id)
```

---

## What's Already Set Up ✅

All these tables already exist in your Supabase project:
- ✅ `exam_categories` (with parent_id for hierarchy)
- ✅ `subjects`
- ✅ `chapters`
- ✅ `chapter_topics`
- ✅ `question_bank`

No additional SQL needed unless you want to add the optional `chapter_id` column to `question_bank`.

---

## Admin Panel Tabs (Already Working)

| Tab | Table | Function |
|-----|-------|----------|
| **বেস ক্যাটেগরি** | exam_categories | Shows only parent_id = NULL |
| **পরীক্ষা ক্যাটেগরি** | exam_categories | Shows only parent_id != NULL |
| **বিষয়** | subjects | All subjects |
| **অধ্যায়** | chapters | All chapters |
| **প্রশ্ন** | question_bank | All questions |

---

## Key Points

1. **No separate categories table exists**
   - `exam_categories` is the ONLY table used
   - `parent_id` determines if it's base or subcategory

2. **Base Categories (6 total)**
   ```sql
   SELECT * FROM exam_categories WHERE parent_id IS NULL;
   -- Returns: SSC, HSC, Medical, Engineering, University, Job
   ```

3. **Exam Subcategories**
   ```sql
   SELECT * FROM exam_categories 
   WHERE parent_id IS NOT NULL 
   AND parent_id = 'ssc-id';
   -- Returns: SSC 2026, SSC বিজ্ঞান, SSC ব্যবসা, etc.
   ```

4. **Hierarchy in Code**
   - `AdminCategoriesTab`: Queries `parent_id IS NULL`
   - `AdminSubcategoriesTab`: Queries `parent_id IS NOT NULL` and filters by parent
   - Both use the same `exam_categories` table

---

## To Use the Admin Panel

1. Navigate to Admin Dashboard
2. Click on **বেস ক্যাটেগরি** to manage main categories
3. Click on **পরীক্ষা ক্যাটেগরি** to manage subcategories under each base category
4. Click on **বিষয়** to manage subjects under subcategories
5. Click on **অধ্যায়** to manage chapters under subjects
6. Click on **প্রশ্ন** to manage questions

Done! ✅

---

## Optional: Link Questions to Chapters

If you want questions directly linked to chapters:

```sql
-- Add chapter_id column to question_bank
ALTER TABLE question_bank
ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_question_bank_chapter_id 
ON question_bank(chapter_id);
```

Then in the question form, you can select a chapter.

---

## Summary

- **Tables Used**: `exam_categories`, `subjects`, `chapters`, `chapter_topics`, `question_bank`
- **Hierarchy**: Done with `parent_id` in `exam_categories`
- **Admin Tabs**: 5 tabs for managing the full hierarchy
- **Status**: 100% Ready ✅

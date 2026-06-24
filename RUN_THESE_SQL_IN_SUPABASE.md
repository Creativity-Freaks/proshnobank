# SQL Files to Run in Supabase

All SQL files are in `/supabase/migrations/` folder. Copy and paste them directly into Supabase SQL Editor.

## Step 1: Verify Setup (Required - Run First)

**File:** `supabase/migrations/20260624000000_verify_hierarchy_setup.sql`

**What it does:**
- Checks if all tables exist
- Shows current data structure
- Displays the hierarchy (Base → Exam Category → Subject → Chapter)

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy entire content of `verify_hierarchy_setup.sql`
5. Paste it in SQL Editor
6. Click "Run"
7. Check results - should show all ✓

---

## Step 2: Add Sample Data (Optional - Run if you want test data)

**File:** `supabase/migrations/20260624000100_sample_hierarchy_data.sql`

**What it does:**
- Adds 6 Base Categories (SSC, HSC, Medical, Engineering, University, Job)
- Adds exam subcategories (SSC 2026 বিজ্ঞান, HSC 2026, etc.)
- Adds subjects (Bangla, English, Math, Physics, Chemistry, Biology)
- Adds chapters for each subject
- Safe - won't add duplicates

**How to run:**
1. Copy entire content of `sample_hierarchy_data.sql`
2. Paste in new SQL Editor
3. Click "Run"
4. At the end you'll see summary:
   - Base Categories: 6
   - Exam Categories: 9+
   - Subjects: 6+
   - Chapters: 3+

---

## Quick Reference: What Each File Does

| File | Purpose | Must Run? |
|------|---------|-----------|
| `verify_hierarchy_setup.sql` | Check structure and data | ✅ YES - Run first |
| `sample_hierarchy_data.sql` | Add test data | ⏳ OPTIONAL - Only if testing |

---

## Database Structure (No separate categories table!)

```
exam_categories (with parent_id)
├─ parent_id = NULL → Base Categories
└─ parent_id = base_id → Exam Subcategories

subjects → Subjects
chapters → Chapters/Topics
question_bank → Questions
```

---

## What to Do After Running SQL

1. ✅ Run `verify_hierarchy_setup.sql` to confirm everything exists
2. ✅ (Optional) Run `sample_hierarchy_data.sql` to add test data
3. ✅ Go to Admin Panel → Use the 10 tabs to manage data
4. ✅ You're done!

---

## Common Questions

**Q: Do I need both SQL files?**
A: No. Run `verify_hierarchy_setup.sql` first. Only run `sample_hierarchy_data.sql` if you want test data.

**Q: Where is the "categories" table?**
A: There is no separate categories table. It's `exam_categories` with `parent_id` for hierarchy.

**Q: Can I run these multiple times?**
A: Yes! They use `IF NOT EXISTS` so they won't create duplicates.

**Q: What if SQL shows errors?**
A: That's normal - it means the data already exists. Just check the query results.

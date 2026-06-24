# Admin Panel - Quick Reference Guide

## Tab Navigation (Admin Sidebar)

```
📊 ড্যাশবোর্ড (Dashboard)
   ↓ Statistics & Overview

📈 বিশ্লেষণ (Analytics)
   ↓ System Performance Data

❓ প্রশ্ন (Questions)
   ↓ View, Search, Filter Questions by Subject & Chapter

🎓 বেস ক্যাটেগরি (Base Categories)
   ↓ Create: SSC, HSC, Medical, Engineering, University, Job

🎯 পরীক্ষা ক্যাটেগরি (Exam Categories)
   ↓ Create: Regular Board, English Medium, etc.
   ↓ (Under each Base Category)

📚 বিষয় (Subjects)
   ↓ Create: Bangla, English, Math, etc.
   ↓ (Under each Exam Category)

📖 অধ্যায় (Chapters)
   ↓ Create: Chapter 1, 2, 3, etc.
   ↓ (Under each Subject)

👥 ব্যবহারকারী (Users)
   ↓ Manage Users, View Profile

📋 টেমপ্লেট (Templates)
   ↓ Manage Exam Templates

📡 লাইভ ইভেন্ট (Live Events)
   ↓ Manage Live Exam Events
```

## What Needs SQL Setup (Supabase)

### Already Exists (✓ Done)
- `exam_categories` table
- `subjects` table
- `question_bank` table
- `chapters` table
- Base hierarchy structure

### May Need (Optional - Check if exists)
- `category_subcategories` table (for Exam Categories)

**Check in Supabase:**
Go to Database → Tables → Look for `category_subcategories`

If it doesn't exist, copy SQL from `SUPABASE_SQL_COMMANDS.md` and run it.

## User Tasks

| Task | Go To | Steps |
|------|-------|-------|
| Add SSC Category | বেস ক্যাটেগরি | New → Fill Name/Description → Save |
| Add SSC Regular Board | পরীক্ষা ক্যাটেগরি | Select SSC → New → Fill → Save |
| Add Subjects | বিষয় | Select Category → New → Add Bangla, English, Math |
| Add Chapters | অধ্যায় | Select Subject → New → Add Chapter 1, 2, 3 |
| Add Questions | প্রশ্ন | Select Subject & Chapter → Add Question → Save |
| View Stats | ড্যাশবোর্ড | See all numbers at a glance |

## Key Terms Translation

| English | Bengali | Meaning |
|---------|---------|---------|
| Base Category | বেস ক্যাটেগরি | Main exam type (SSC, HSC) |
| Exam Category | পরীক্ষা ক্যাটেগরি | Variation under base (Regular, English Medium) |
| Subject | বিষয় | Subject like Bangla, Math |
| Chapter | অধ্যায় | Topic within subject |
| Question | প্রশ্ন | Individual exam question |

## Common Workflow

```
1. Start with বেস ক্যাটেগরি
   "Create SSC category"
   
2. Move to পরীক্ষা ক্যাটেগরি
   "Add SSC Regular Board under SSC"
   
3. Go to বিষয়
   "Add Bangla, English, Math subjects"
   
4. Use অধ্যায়
   "Create chapters 1, 2, 3 for each subject"
   
5. Manage প্রশ্ন
   "Add specific exam questions to chapters"
```

## Sidebar Features

- **Collapse/Expand:** Click chevron icon (< >) to toggle sidebar
- **Search:** Each tab has search & filter options
- **CRUD Operations:** All tabs support Create, Read, Update, Delete
- **Responsive:** Works on mobile (collapsed sidebar)
- **Logout:** Bottom of sidebar

## Filter Hierarchy

When managing items, you'll see cascading filters:

```
বেস ক্যাটেগরি Select
  ↓ (Select one)
পরীক্ষা ক্যাটেগরি Filter appears
  ↓ (Select one)
বিষয় becomes available
  ↓ (Select one)
অধ্যায় becomes available
```

Each level depends on the previous selection.

---

**Need help?** Check `HIERARCHY_STRUCTURE.md` for detailed setup instructions.

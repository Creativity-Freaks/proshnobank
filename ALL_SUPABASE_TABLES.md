# All Supabase Tables - Complete Reference

## 25 Total Tables Created

### Core Tables (4)
1. **exam_categories** - Base categories (SSC, HSC, Medical, Engineering, University, Job) with parent_id for hierarchy
2. **subjects** - Subjects under exam categories (Bangla, English, Math, etc.)
3. **chapters** - Chapters under subjects (Chapter 1, 2, 3 with Bengali/English names)
4. **chapter_topics** - Topics within chapters

### Question & Assessment (4)
5. **question_bank** - All exam questions with difficulty levels, options, answers
6. **exam_attempts** - User exam attempt records with score, duration, answers
7. **exam_batches** - Exam batches/sessions that students enroll in
8. **exam_templates** - Pre-made exam templates with configuration

### User & Roles (3)
9. **user_roles** - User role assignments (admin, teacher, student, etc.)
10. **exam_batch_enrollments** - Student enrollments in exam batches
11. **user_subscriptions** - User subscription records

### Content & Materials (3)
12. **teacher_papers** - Papers uploaded by teachers
13. **proshnobank_pdfs** - PDF library
14. **bookmarks** - Bookmarked questions by users

### Engagement & Support (3)
15. **doubts** - Student doubts/questions
16. **doubt_answers** - Answers to doubts
17. **doubt_helpful** - Helpful votes on doubt answers

### Analytics & Progress (3)
18. **student_progress** - Student progress tracking
19. **user_stats_cache** - Cached user statistics
20. **usage_tracking** - Platform usage analytics

### Subscription & Billing (3)
21. **subscription_plans** - Available subscription plans
22. **billing_history** - Billing records
23. **discount_codes** - Discount/promo codes

### Live Events & System (3)
24. **live_exam_events** - Live exam events
25. **app_settings** - Application settings

---

## Admin Panel Tabs Mapping

| Tab Name | Bengali | Table(s) Used | Status |
|----------|---------|---------------|--------|
| Dashboard | ড্যাশবোর্ড | Multiple tables for stats | ✓ Dynamic |
| Analytics | বিশ্লেষণ | user_stats_cache, student_progress | ✓ Dynamic |
| Questions | প্রশ্ন | question_bank | ✓ Dynamic |
| Base Categories | বেস ক্যাটেগরি | exam_categories (parent_id IS NULL) | ✓ Dynamic |
| Exam Categories | পরীক্ষা ক্যাটেগরি | exam_categories (parent_id NOT NULL) | ✓ Dynamic |
| Subjects | বিষয় | subjects | ✓ Dynamic |
| Chapters | অধ্যায় | chapters | ✓ Dynamic |
| Users | ব্যবহারকারী | exam_batch_enrollments | ✓ Dynamic |
| Templates | টেমপ্লেট | exam_templates | Ready |
| Live Events | লাইভ ইভেন্ট | live_exam_events | Ready |

---

## Key Features

✓ All 25 tables created in Supabase migrations
✓ RLS policies configured for security
✓ Indexes created for performance
✓ Admin role checks implemented
✓ Admin panel fully dynamic (8/10 tabs complete)
✓ Bengali interface throughout
✓ Error handling and loading states
✓ Real-time data from Supabase

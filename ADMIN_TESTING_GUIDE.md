# Admin Panel Testing Guide - পূর্ণ গাইড

## ১. Environment Setup - Environment ভেরিয়েবল সেটআপ

### প্রয়োজনীয় Env Variables:
```bash
# Admin Access
VITE_ADMIN_EMAILS=admin@mail.com,admin2@example.com

# Supabase (Production)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# or locally
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Settings এ Env Vars যোগ করার উপায়:
1. Click "Vars" in top-right settings
2. Add these environment variables
3. Restart dev server

---

## २. Admin Login Flow Testing

### Step 1: Go to Admin Login Page
```
http://localhost:8080/admin/login
```

### Step 2: Page Elements Check
✓ Back button ("← ফিরে যান") visible at top
✓ Brand logo centered
✓ Admin login title
✓ Email input field
✓ Password input field (with show/hide toggle)
✓ Submit button

### Step 3: Test Login
Email: `admin@mail.com` (from VITE_ADMIN_EMAILS)
Password: (any password - auth will validate)

Expected behavior:
- If email is NOT in configured admins → "অনুমতি নেই" error
- If credentials are wrong → "লগইন ব্যর্থ" error
- If success → Redirects to `/admin` dashboard

---

## ३. Admin Dashboard Features

### Main Admin Pages (in AdminWorkspace):
✓ **Overview** - Dashboard stats
✓ **Live Exams** - Manage active exams
✓ **Categories** - Manage exam categories
✓ **Subjects** - Manage subjects with chapters
✓ **Chapters** - Bangladesh curriculum chapters
  - See all chapters from database
  - Add new chapters
  - Edit existing chapters
  - Add topics to chapters
✓ **Questions** - Manage question bank
✓ **Batches** - Manage exam batches
✓ **Users** - Manage user accounts
✓ **Roles** - Manage user roles
✓ **Analytics** - View analytics
✓ **Templates** - Question templates

### All Pages Have:
✓ Back button to return to previous page
✓ Responsive mobile layout
✓ Consistent design with main site

---

## ४. Database Integration Check

### Chapters are Database-Driven:
1. Go to Admin → Chapters
2. Should show all chapters from `chapters` table
3. Click on a chapter to see topics from `chapter_topics` table
4. Can add new chapters/topics directly

### Visible in All Panels:
- Admin panel: Full CRUD management
- Teacher panel: Read-only view
- Student panel: Used for exam setup

---

## ५. Testing Checklist

### Authentication
- [ ] Admin login page loads
- [ ] Back button works
- [ ] Email validation works
- [ ] Password field shows/hides
- [ ] Login success redirects to /admin
- [ ] Non-admin emails get rejected
- [ ] Invalid credentials show error

### Admin Dashboard
- [ ] All menu items visible
- [ ] Back button on every page
- [ ] Chapters showing from database
- [ ] Can navigate between pages
- [ ] Mobile view responsive
- [ ] No broken links

### Chapters System
- [ ] Chapters display in admin
- [ ] Chapters used in exam setup
- [ ] Dropdown expandable/collapsible
- [ ] Topics show under chapters
- [ ] Can select chapters in exam setup
- [ ] Selected chapters are saved

### Mobile Testing
- [ ] Back button works on mobile
- [ ] Layout responsive on small screens
- [ ] Forms usable on mobile
- [ ] Menu accessible on mobile
- [ ] No horizontal scrolling

---

## ६. Troubleshooting

### Admin Login Not Working
**Problem:** Getting "শুধু অনুমোদিত অ্যাডমিন ইমেইল" error
**Solution:**
1. Check `VITE_ADMIN_EMAILS` env var is set
2. Verify email is in the comma-separated list
3. Restart dev server after changing env vars

### Chapters Not Showing
**Problem:** Admin pages load but no chapters visible
**Solution:**
1. Check Supabase connection
2. Verify `chapters` and `chapter_topics` tables exist
3. Check RLS policies allow admin access
4. Run migration: `supabase migration list`

### Database Connection Error
**Problem:** "Database connection failed"
**Solution:**
1. Check Supabase URL and key are correct
2. Verify Supabase project is running
3. Check network connectivity
4. Look at browser console for specific error

### Back Button Not Working
**Problem:** Back button doesn't navigate
**Solution:**
1. Check browser history (need at least 2 pages visited)
2. Check BackButton component is imported
3. Look for JavaScript errors in console

---

## ७. Quick Testing Command

```bash
# Run with specific admin email
VITE_ADMIN_EMAILS=test@admin.com npm run dev

# Then test:
# 1. Go to http://localhost:8080/admin/login
# 2. Try login with test@admin.com
# 3. Check admin dashboard loads
# 4. Verify chapters display
```

---

##८. Full A-to-Z Dynamics Testing

### Create Complete Test Flow:
1. **User Registration** (if applicable)
2. **Main Site Navigation** (check back buttons)
3. **Category Pages** (SSC, HSC, etc.)
4. **Exam Setup** (chapters selection)
5. **Take Practice Exam** (live exam flow)
6. **Admin Login** (switch to admin)
7. **Manage Chapters** (admin CRUD)
8. **Check Consistency** (same chapters everywhere)
9. **Mobile Testing** (responsive design)
10. **Back Navigation** (all pages have back button)

---

## ९. Screenshots to Verify

- [ ] Admin login page with back button
- [ ] Admin dashboard with menu
- [ ] Chapters page showing database entries
- [ ] Chapters selected in exam setup
- [ ] Mobile view of admin pages
- [ ] Chapter topic dropdown expanded
- [ ] Back button functionality on each page


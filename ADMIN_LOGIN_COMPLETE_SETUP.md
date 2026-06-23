# Admin Login - Complete Setup Guide

## Status: READY TO LOGIN ✓

Your admin account credentials are configured:
- Email: `info.proshnobank@gmail.com`
- Password: `admin123`
- Environment Variable: `VITE_ADMIN_EMAILS=info.proshnobank@gmail.com` ✓ SET

---

## Complete A-to-Z Setup Steps

### STEP 1: Verify Environment Variables ✓

Check that admin email is configured:

```bash
# Check in Settings > Vars
VITE_ADMIN_EMAILS = info.proshnobank@gmail.com
```

**Status:** ✓ Already configured

---

### STEP 2: Create Admin User in Supabase

Choose ONE of these 3 methods:

#### **METHOD A: Supabase Dashboard (EASIEST - Recommended)**

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Authentication** (left sidebar)
4. Click **Users**
5. Click **"Add user"** button (top right)
6. Fill in:
   - Email: `info.proshnobank@gmail.com`
   - Password: `admin123`
   - **CHECK:** "Auto send invite"
7. Click **"Save"**
8. If email confirmation popup appears, click confirmation link

**Result:** User created and ready to login ✓

---

#### **METHOD B: Node.js Script (AUTOMATED)**

We provide an automated script:

```bash
# Install dependencies if not already installed
npm install

# Run the script (make sure Supabase env vars are set)
node scripts/create-admin-user.mjs info.proshnobank@gmail.com admin123
```

**Output:**
```
✓ Admin user created successfully!

User Details:
  ID: xxx-xxx-xxx
  Email: info.proshnobank@gmail.com
  Created: 2026-04-24...

Next steps:
1. Verify VITE_ADMIN_EMAILS includes: info.proshnobank@gmail.com
2. Restart dev server: npm run dev
3. Login at: http://localhost:8080/admin/login
```

---

#### **METHOD C: SQL Query (ADVANCED)**

For direct database access:

1. Go to Supabase Dashboard > SQL Editor
2. Click "New query"
3. Paste this SQL:

```sql
-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  phone_confirmed_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'info.proshnobank@gmail.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"role":"admin"}',
  now(),
  now(),
  now(),
  null
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password;

-- Verify user created
SELECT id, email, created_at FROM auth.users 
WHERE email = 'info.proshnobank@gmail.com';
```

4. Click **"Run"**
5. Check output shows user created

---

### STEP 3: Test Admin Login

#### Start Dev Server:
```bash
npm run dev
```

#### Open Admin Login:
1. Navigate to: `http://localhost:8080/admin/login`
2. You should see:
   - Logo at top (প্রশ্নব্যাংক)
   - Shield icon
   - "অ্যাডমিন লগইন" heading
   - Email field
   - Password field
   - Blue submit button
   - Back button (← ফিরে যান)

#### Enter Credentials:
- Email: `info.proshnobank@gmail.com`
- Password: `admin123`
- Click "অ্যাডমিন লগইন" button

#### Expected Result:
✓ Redirected to `/admin` dashboard
✓ See admin panels and controls

---

### STEP 4: Verify Admin Features Work

After login, you should see:

#### Dashboard Stats:
- Total questions
- Total attempts
- Total users
- Average accuracy

#### Admin Sections:
1. **Chapters Management**
   - View all subjects and chapters
   - Add/edit/delete chapters
   - Manage topics

2. **Exam Templates**
   - Create custom exam templates
   - Configure difficulty, duration, marks
   - Select subjects and chapters

3. **Live Exams**
   - Schedule live exams
   - Monitor participants
   - Set prizes/rewards

4. **User Management**
   - View all users
   - Manage roles
   - Suspend/restrict users

5. **Statistics**
   - Subject breakdown
   - User statistics
   - Performance metrics

---

## Troubleshooting

### ❌ Error: "এই ইমেইল অ্যাডমিন হিসেবে কনফিগার করা নেই"
**Translation:** "This email is not configured as admin"

**Solution:**
1. Check Settings > Vars > VITE_ADMIN_EMAILS = info.proshnobank@gmail.com
2. Restart dev server: Stop and run `npm run dev` again
3. Try again

---

### ❌ Error: "অ্যাডমিন লগইন তথ্য ভুল হয়েছে"
**Translation:** "Admin login credentials are wrong"

**Solution:**
1. Verify user exists in Supabase (Authentication > Users)
2. Check email is exactly: `info.proshnobank@gmail.com`
3. Check password is exactly: `admin123`
4. Try resetting password in Supabase Dashboard:
   - Find user > Click "..." menu > "Reset password"

---

### ❌ Error: "এই অ্যাকাউন্ট অ্যাডমিন প্যানেলে প্রবেশ করতে পারবে না"
**Translation:** "This account cannot access admin panel"

**Solution:**
1. This means user authenticated but email not in whitelist
2. Double-check VITE_ADMIN_EMAILS spelling
3. Email must match EXACTLY (case-insensitive but spelling must match)
4. Restart dev server after changing

---

### ❌ Error: "Something went wrong"
**Solution:**
1. Open browser DevTools (F12)
2. Check Console for specific error
3. Check .env files are properly set
4. Restart dev server completely: Stop and `npm run dev`

---

## Adding More Admin Users

Edit environment variable:

**From:**
```
VITE_ADMIN_EMAILS=info.proshnobank@gmail.com
```

**To:**
```
VITE_ADMIN_EMAILS=info.proshnobank@gmail.com,admin2@mail.com,admin3@mail.com
```

Then create each user in Supabase using same process.

---

## Security Best Practices

1. **Change Default Password**
   - After first login, go to Settings
   - Change password from `admin123` to something secure
   - Use strong password (mix of uppercase, lowercase, numbers, symbols)

2. **Email Verification**
   - Supabase should send verification email
   - Verify email before using admin features
   - Ask users to confirm email in Supabase dashboard

3. **Session Security**
   - Admin sessions auto-expire after inactivity
   - Logout before leaving
   - Don't share admin credentials

4. **Audit Trail**
   - Admin actions are logged
   - Check audit logs regularly in admin panel

---

## Development Environment Setup

### .env.development.local (Required)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_EMAILS=info.proshnobank@gmail.com
```

### .env.production (For Deployed App)

Set same variables in Vercel project settings:
1. Go to Vercel Dashboard
2. Project Settings > Environment Variables
3. Add each variable

---

## Testing Checklist

After successful login, verify:

- [ ] Login at `/admin/login` works
- [ ] Redirected to `/admin` dashboard
- [ ] Dashboard stats display correctly
- [ ] Can navigate to Chapters page
- [ ] Can view subjects and chapters
- [ ] Can view exam templates
- [ ] Can view live exams
- [ ] Can view users
- [ ] Back button works on all admin pages
- [ ] Sidebar navigation works
- [ ] Can logout successfully
- [ ] After logout, redirected to home

---

## Quick Reference

| Item | Value |
|------|-------|
| Login URL | `http://localhost:8080/admin/login` |
| Dashboard URL | `http://localhost:8080/admin` |
| Admin Email | `info.proshnobank@gmail.com` |
| Admin Password | `admin123` |
| Env Variable | `VITE_ADMIN_EMAILS` |
| Status | ✓ Ready to Login |

---

## Next Steps After Login

### MUST DO:
1. ✓ Change password to something secure
2. ✓ Verify email in Supabase
3. ✓ Add other admin users if needed

### SHOULD DO:
1. Explore admin features
2. Create test exam templates
3. Add test chapters/topics
4. Test live exam creation
5. Review user management tools

### OPTIONAL:
1. Customize exam templates for different categories
2. Set up recurring live exams
3. Create seasonal exams
4. Set prize schedules
5. Configure notifications

---

## Support & Help

If you get stuck:

1. **Check logs:**
   - Browser Console (F12 > Console)
   - Server logs in terminal

2. **Verify setup:**
   - Supabase user exists (Dashboard > Users)
   - VITE_ADMIN_EMAILS is set correctly
   - Dev server restarted

3. **Read documentation:**
   - ADMIN_ACCOUNT_SETUP.md (detailed setup)
   - ADMIN_TESTING_GUIDE.md (testing guide)
   - IMPLEMENTATION_SUMMARY.md (complete system overview)

4. **Debug:**
   - Try incognito mode
   - Clear browser cache
   - Check email spelling
   - Try resetting password

---

**Admin Panel is READY TO USE! 🎉**

Proceed to STEP 2 to create your Supabase user account, then login and enjoy!

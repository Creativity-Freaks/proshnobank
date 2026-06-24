# Admin Account Setup Guide

## Quick Setup (What You Did)

You have:
- Email: `info.proshnobank@gmail.com`
- Password: `admin123`
- VITE_ADMIN_EMAILS: `info.proshnobank@gmail.com` (already configured)

## Step 1: Create User in Supabase Auth

### Option A: Using Supabase Dashboard (Recommended for First Time)

1. Go to [Supabase Dashboard](https://supabase.com)
2. Login to your project
3. Navigate to **Authentication > Users**
4. Click **"Add user"** or **"Invite"**
5. Enter:
   - Email: `info.proshnobank@gmail.com`
   - Password: `admin123`
6. Click **"Send invite"** or **"Create user"**
7. If email confirmation required, click the confirmation link

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Create the admin user
supabase auth admin create-user \
  --email info.proshnobank@gmail.com \
  --password admin123
```

### Option C: Direct SQL (Advanced)

```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  phone_confirmed_at,
  phone
)
VALUES (
  'info.proshnobank@gmail.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{}',
  now(),
  now(),
  null,
  null
)
ON CONFLICT (email) DO UPDATE
SET encrypted_password = EXCLUDED.encrypted_password;
```

## Step 2: Login to Admin Panel

1. Open: `http://localhost:8080/admin/login`
2. Email: `info.proshnobank@gmail.com`
3. Password: `admin123`
4. Click **"অ্যাডমিন লগইন"** (Admin Login)

## Expected Result

✓ Redirected to `/admin` dashboard
✓ See admin controls for:
  - Chapters management
  - Exam templates
  - Live exams
  - User management
  - Statistics

## Troubleshooting

### Error: "এই ইমেইল অ্যাডমিন হিসেবে কনফিগার করা নেই"
**Translation:** "This email is not configured as admin"

**Solution:** 
- Check VITE_ADMIN_EMAILS environment variable is set
- Verify email matches exactly: `info.proshnobank@gmail.com`
- Restart dev server after changing env var

### Error: "অ্যাডমিন লগইন তথ্য ভুল হয়েছে"
**Translation:** "Admin login credentials are wrong"

**Solution:**
- Verify user exists in Supabase Auth
- Check password is correct
- Try resetting password in Supabase Dashboard
- Ensure email is confirmed in Supabase

### Error: "এই অ্যাকাউন্ট অ্যাডমিন প্যানেলে প্রবেশ করতে পারবে না"
**Translation:** "This account cannot access the admin panel"

**Solution:**
- Double-check VITE_ADMIN_EMAILS configuration
- Email must match exactly (case-insensitive but spelling must match)
- Restart dev server

## Environment Variables Required

```bash
# For Admin Login (Already Set)
VITE_ADMIN_EMAILS=info.proshnobank@gmail.com

# For Supabase (Setup via Supabase Integration)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing Admin Features

### After Login, You Can:

1. **Manage Chapters**
   - View all subject chapters
   - Add new chapters
   - Edit chapter names/topics
   - Delete chapters

2. **Create Exam Templates**
   - Configure difficulty levels
   - Select subjects and chapters
   - Set question count, duration, marks

3. **Manage Live Exams**
   - Schedule live exams
   - Monitor participants
   - Track statistics

4. **User Management**
   - View all users
   - Manage roles (student, teacher, admin)
   - Suspend/restrict users

5. **View Statistics**
   - Total questions
   - Total attempts
   - Subject breakdown
   - User statistics

## Additional Admin Features

### Adding More Admin Users

Edit `.env.local` or project settings:

```bash
VITE_ADMIN_EMAILS=info.proshnobank@gmail.com,admin2@mail.com,admin3@mail.com
```

Then create their Supabase accounts with same process.

### Resetting Admin Password

1. Go to Supabase Dashboard
2. Users > Find `info.proshnobank@gmail.com`
3. Click "..." menu
4. Select "Reset password"
5. Provide new password

### Removing Admin Access

Remove email from VITE_ADMIN_EMAILS:

```bash
# Instead of: info.proshnobank@gmail.com,other@mail.com
# Use: other@mail.com
VITE_ADMIN_EMAILS=other@mail.com
```

## Development vs Production

### Local Development
- Env vars stored in `.env.development.local`
- Restart dev server when changing env vars
- Use Supabase local testing setup

### Production (Vercel)
- Set env vars in Vercel project settings
- Changes apply immediately (no restart needed)
- Production Supabase project

## Next Steps

1. Create the admin user in Supabase (using Option A, B, or C above)
2. Test login at `/admin/login`
3. Verify all admin features work
4. Add more admin users if needed (by adding to VITE_ADMIN_EMAILS)

## Support

If stuck:
1. Check Supabase project is connected
2. Verify email in VITE_ADMIN_EMAILS matches Supabase user email
3. Check console for specific error messages
4. Restart dev server
5. Try incognito/private browser mode

---

**Status:** Ready to login with `info.proshnobank@gmail.com` / `admin123` once Supabase user is created!

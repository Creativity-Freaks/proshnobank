# Admin Login - Quick Start (5 Minutes)

## Your Admin Credentials

```
Email:    info.proshnobank@gmail.com
Password: admin123
```

**Status:** ✓ Email already configured, ready to create account

---

## Do This NOW (Choose 1):

### Option 1: Easy - Supabase Dashboard (Recommended)

1. Open: https://app.supabase.com
2. Select your project
3. **Authentication** → **Users** → **Add user**
4. Email: `info.proshnobank@gmail.com`
5. Password: `admin123`
6. Click **Save** ✓

### Option 2: Automated - Node Script

```bash
node scripts/create-admin-user.mjs info.proshnobank@gmail.com admin123
```

### Option 3: SQL - Direct Database

Copy this into Supabase SQL Editor and run:

```sql
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, last_sign_in_at, phone_confirmed_at)
VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'info.proshnobank@gmail.com', crypt('admin123', gen_salt('bf')), now(), '{"role":"admin"}', now(), now(), now(), null)
ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

SELECT id, email, created_at FROM auth.users WHERE email = 'info.proshnobank@gmail.com';
```

---

## Then Login

1. Start: `npm run dev`
2. Open: `http://localhost:8080/admin/login`
3. Email: `info.proshnobank@gmail.com`
4. Password: `admin123`
5. Click "অ্যাডমিন লগইন" ✓

---

## You're In!

Access admin dashboard to:
- Manage chapters by subject
- Create exam templates
- Schedule live exams
- Manage users and roles
- View statistics

---

## Issues?

| Problem | Solution |
|---------|----------|
| "Email not configured" | Restart dev server |
| "Wrong credentials" | Verify user in Supabase |
| "Can't access panel" | Check VITE_ADMIN_EMAILS exact spelling |
| Other issues | Check browser console (F12) for errors |

---

**Done! You're ready to use admin panel.** 🎉

See `ADMIN_LOGIN_COMPLETE_SETUP.md` for detailed help.

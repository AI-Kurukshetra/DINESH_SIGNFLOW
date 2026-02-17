# Supabase Complete Setup Reference

## 📋 Quick Index

1. **Initial Credentials Setup** (5 min)
2. **Database Schema Creation** (2 min)  
3. **Seed Test Data** (1 min)
4. **Frontend Integration** (15 min)
5. **Testing & Verification** (10 min)

---

## 🚀 Complete Setup in 30 Minutes

### 1️⃣ Create Supabase Project (5 minutes)

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Select your organization
4. **Project Name:** `SIGNFLOW` (or your choice)
5. **Database Password:** Create strong password (save it!)
6. **Region:** Choose closest to your users
7. Click **Create New Project**
8. Wait 2-3 minutes for initialization

### 2️⃣ Get Your Credentials (2 minutes)

1. Once project is ready, click it to open
2. Go to **Settings** → **API**
3. Copy and save:
   - **Project URL**
   - **Anon Key** (public)
   - **Service Role Key** (keep secret!)

### 3️⃣ Create Database Tables (2 minutes)

1. Open **SQL Editor** tab
2. Click **New Query**
3. Open [supabase-database-setup.sql](supabase-database-setup.sql)
4. Copy ALL content
5. Paste into SQL Editor
6. Click **Run**
7. Watch for completion message

### 4️⃣ Seed Test Data (1 minute)

1. Click **New Query** again
2. Open [supabase-seed-data.sql](supabase-seed-data.sql)
3. Copy ALL content
4. Paste into SQL Editor
5. Click **Run**
6. Verify completion

### 5️⃣ Update Config Files (2 minutes)

Edit `js/supabase-config.js`:

```javascript
const SupabaseConfig = {
    supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',  // ← PASTE PROJECT URL HERE
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',           // ← PASTE ANON KEY HERE
    tables: {
        users: 'users',
        documents: 'documents',
        signatures: 'signatures',
        auditLog: 'audit_log'
    },
    storage: {
        documents: 'documents',
        signatures: 'signatures'
    }
};
```

### 6️⃣ Update All HTML Files (5 minutes)

Add to `<head>` section of EVERY HTML file:

```html
<!-- Supabase Setup (Add these 3 lines to every HTML file) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/supabase-user-module.js"></script>
```

**Files to update:**
- `index.html`
- `login.html`
- `register.html`
- `dashboard.html`
- `profile.html`
- `admin.html`
- `editor.html`
- `send.html`
- `upload.html`
- `sign.html`
- `viewer.html`
- `settings.html`

### 7️⃣ Initialize on Page Load (2 minutes)

Add to `js/main.js`:

```javascript
// Initialize Supabase on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing Supabase...');
    await initSupabase();
    console.log('✓ Supabase ready!');
});
```

### 8️⃣ Test Connection (5 minutes)

1. Open any HTML file in browser
2. Press `F12` to open Developer Console
3. Paste this command:

```javascript
const client = await initSupabase();
console.log('Connection Status:', client ? '✓ Connected' : '✗ Failed');
```

4. Should show: `Connection Status: ✓ Connected`

### 9️⃣ Test Login (5 minutes)

1. Go to `login.html`
2. Try logging in with test credentials:
   - **Email:** `admin@signflow.com`
   - **Password:** `admin123`

---

## 📁 All Files Provided

### Database Setup Files
- `supabase-database-setup.sql` - Database schema
- `supabase-seed-data.sql` - Test data

### JavaScript Module Files
- `js/supabase-config.js` - Configuration
- `js/supabase-user-module.js` - User operations
- Existing: `js/userManager.js`, `js/auth.js`

### Documentation Files
- `SUPABASE_SETUP.md` - Initial setup guide
- `SUPABASE_USER_SETUP.md` - User module setup
- `SUPABASE_INTEGRATION_GUIDE.md` - Integration steps
- `SUPABASE_SEEDING_GUIDE.md` - Seeding documentation
- This file: `SUPABASE_COMPLETE_REFERENCE.md`

---

## 🔑 Test Accounts

All test passwords: `admin123`

```
Admin Account:
  Email: admin@signflow.com
  Password: admin123
  Role: Admin
  Permissions: All

Test User 1:
  Email: john@example.com
  Password: admin123
  Role: User
  Company: Acme Corporation

Test User 2:
  Email: jane@example.com
  Password: admin123
  Role: User
  Company: Tech Innovations LLC

Test User 3:
  Email: bob@example.com
  Password: admin123
  Role: User
  Company: Global Services
```

---

## 📊 Database Schema Overview

### 7 Main Tables

```
users
├── id (UUID)
├── email (UNIQUE)
├── name
├── password_hash
├── role (admin/user/moderator)
└── status (active/inactive/suspended)

user_metadata
├── user_id (FK → users)
├── company
├── position
├── phone_number
└── preferences (JSON)

documents
├── id (UUID)
├── user_id (FK → users)
├── title
├── status (draft/pending/signed/archived)
└── file_path

signatures
├── id (UUID)
├── document_id (FK → documents)
├── user_id (FK → users)
├── signature_data
└── signed_at

audit_log
├── id (UUID)
├── user_id (FK → users)
├── action
├── table_name
└── created_at

sessions
├── id (UUID)
├── user_id (FK → users)
├── token
├── expires_at
└── ip_address

verification_codes
├── id (UUID)
├── user_id (FK → users)
├── code
├── type (email/2fa/password_reset)
└── expires_at
```

---

## 💻 JavaScript Function Reference

### Initialize Supabase
```javascript
await initSupabase()
```

### User Operations
```javascript
// Create user
await SupabaseUserModule.createUser(userData)

// Get user by ID
await SupabaseUserModule.getUserById(userId)

// Get user by email
await SupabaseUserModule.getUserByEmail(email)

// Update user
await SupabaseUserModule.updateUser(userId, updates)

// Get audit log
await SupabaseUserModule.getUserAuditLog(userId)
```

### Document Operations
```javascript
// Upload document (via SupabaseUserModule)
await SupabaseUserModule.uploadDocument(bucket, path, file)

// Get public URL
await SupabaseUserModule.getPublicUrl(bucket, path)
```

### Session Operations
```javascript
// Create session
await SupabaseUserModule.createSession(userId, token, expiresAt)

// Get session by token
await SupabaseUserModule.getSessionByToken(token)

// Delete session
await SupabaseUserModule.deleteSession(sessionId)
```

---

## 🔐 Security Checklist

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Test accounts will be deleted before production
- [ ] Passwords are hashed (bcrypt)
- [ ] Service Role Key is kept secret
- [ ] CORS is configured for your domain
- [ ] HTTPS is enforced for all connections
- [ ] Backup schedule is set up
- [ ] Audit logging is enabled

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "supabase is not defined" | Add Supabase script to `<head>` |
| 404 errors on API calls | Check Project URL in config |
| Unauthorized errors | Check Anon Key in config |
| CORS errors in browser | Add domain to CORS in Supabase settings |
| Tables don't exist | Run supabase-database-setup.sql |
| No test data visible | Run supabase-seed-data.sql |
| Can't login with test account | Verify Email and Password are correct |
| Row Level Security blocking | Check RLS policies are set correctly |

---

## 📈 Performance Tips

1. **Add Database Indexes** (already done in setup.sql)
2. **Use Connection Pooling** (by default in Supabase)
3. **Cache Frequently Accessed Data** (in localStorage)
4. **Paginate Large Result Sets**
5. **Use Real-time Subscriptions** (for live updates)

---

## 🚀 Deployment Steps

### Before Going Live

1. Run this query to show statistics:
   ```sql
   SELECT 'All OK' as status;
   ```

2. Delete test accounts:
   ```sql
   DELETE FROM users WHERE email LIKE '%example.com' OR email = 'admin@signflow.com';
   ```

3. Enable additional security:
   - Enable backups in Settings
   - Set up monitoring alerts
   - Review RLS policies one more time

4. Update environment variables:
   - Store credentials in `.env` file
   - Never commit `.env` to git
   - Use process.env in backend code

### Monitoring in Production

1. Regular backups (automatic)
2. Monitor query performance in Logs section
3. Check RLS policy violations
4. Review audit logs for suspicious activity
5. Set up email alerts for issues

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **SQL Reference:** https://www.postgresql.org/docs/
- **JavaScript Client:** https://supabase.com/docs/reference/javascript
- **Community:** https://github.com/supabase/supabase/discussions

---

## ✅ Final Checklist

- [ ] Supabase project created
- [ ] Database schema loaded
- [ ] Test data seeded
- [ ] Configuration file updated  
- [ ] Scripts added to all HTML files
- [ ] Initialization code added to main.js
- [ ] Browser console shows successful connection
- [ ] Login works with test account
- [ ] User profile loads correctly
- [ ] Audit logs are being recorded
- [ ] RLS policies are working
- [ ] Ready for feature development!

---

**Status:** ✅ Database is ready! All files are on GitHub at https://github.com/AI-Kurukshetra/DINESH_SIGNFLOW

**Next Steps:** 
1. Update HTML files with Supabase scripts
2. Test user authentication
3. Implement document upload
4. Test signature functionality
5. Monitor audit logs

Good luck! 🚀

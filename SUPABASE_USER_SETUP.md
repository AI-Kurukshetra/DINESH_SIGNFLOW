# Supabase User Module Database Setup Guide

## 📋 Overview

This guide will help you set up the Supabase database to handle the SignFlow user management system. The setup includes:

- **Users Table** - User profiles with authentication data
- **User Metadata Table** - Extended user information and preferences
- **Documents Table** - Digital documents for signing
- **Signatures Table** - Signature records
- **Audit Log Table** - Complete audit trail
- **Sessions Table** - Token management
- **Verification Codes Table** - Email and 2FA verification

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [Supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Wait for it to initialize (2-3 minutes)

### Step 2: Access SQL Editor

1. Open your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 3: Run Database Setup SQL

1. Copy all SQL from [supabase-database-setup.sql](supabase-database-setup.sql)
2. Paste it into the SQL Editor
3. Click **Run**
4. Wait for completion (you should see "Success" message)

### Step 4: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (public API key)
   - **Service Role Key** (for admin operations - optional)

### Step 5: Update Configuration Files

Edit `js/supabase-config.js`:

```javascript
const SupabaseConfig = {
    supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co', // ← Replace this
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY', // ← Replace this
    // ... rest of config
};
```

### Step 6: Update HTML Files

Add these scripts to the `<head>` section of **all** your HTML files:

```html
<!-- Supabase Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Supabase Configuration -->
<script src="js/supabase-config.js"></script>

<!-- Supabase User Module -->
<script src="js/supabase-user-module.js"></script>
```

**Files to update:**
- `index.html`
- `login.html`
- `register.html`
- `dashboard.html`
- `profile.html`
- `admin.html`
- All other HTML files

### Step 7: Initialize on Page Load

Add this to your JavaScript (in `main.js` or the starting JS file):

```javascript
// Initialize Supabase on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Supabase...');
    await initSupabase();
    console.log('Supabase initialized successfully');
});
```

---

## 📊 Database Schema Overview

### Users Table
Stores user account information:
- `id` - Unique user identifier (UUID)
- `email` - User email (unique)
- `name` - User's full name
- `password_hash` - Bcrypt hashed password (never plain text!)
- `picture` - Profile picture URL
- `provider` - Auth provider (email, google, github, etc.)
- `verified` - Email verification status
- `role` - User role (user, admin, moderator)
- `status` - Account status (active, inactive, suspended)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp

### User Metadata Table
Extended user information:
- `user_id` - Foreign key to users
- `last_ip_address` - Last login IP address
- `login_attempts` - Failed login attempts counter
- `two_factor_enabled` - 2FA status
- `phone_number` - User's phone
- `company` - Company name
- `position` - Job position
- `timezone` - User's timezone
- `language` - Preferred language
- `preferences` - JSON field for custom preferences

---

## 💻 Usage Examples

### Register a New User

```javascript
// 1. In your register handler
const userData = {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: 'hashed_password_here', // Use bcrypt!
    provider: 'email',
    metadata: {
        company: 'Acme Corp',
        position: 'Manager',
        timezone: 'UTC'
    }
};

// 2. Create user in Supabase
const newUser = await SupabaseUserModule.createUser(userData);

if (newUser) {
    console.log('User created:', newUser.id);
    // Redirect to login or dashboard
} else {
    console.error('Failed to create user');
}
```

### Log In a User

```javascript
// 1. Get user by email
const user = await SupabaseUserModule.getUserByEmail(email);

if (user && verifyPassword(password, user.password_hash)) {
    // 2. Update last login
    await SupabaseUserModule.updateUserLastLogin(user.id);
    
    // 3. Create session
    const token = generateToken(user.id);
    await SupabaseUserModule.createSession(
        user.id,
        token,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    );
    
    console.log('User logged in successfully');
}
```

### Update User Profile

```javascript
const updatedUser = await SupabaseUserModule.updateUser(userId, {
    name: 'New Name',
    picture: 'https://example.com/profile.jpg'
});
```

### Update User Metadata

```javascript
await SupabaseUserModule.updateUserMetadata(userId, {
    company: 'New Company',
    position: 'Senior Manager',
    twoFactorEnabled: true,
    timezone: 'America/New_York'
});
```

### Get Audit Log

```javascript
const auditLog = await SupabaseUserModule.getUserAuditLog(userId, 50);
console.log('Recent user actions:', auditLog);
```

### Change Password

```javascript
const newPasswordHash = bcrypt.hashSync(newPassword, 10);
await SupabaseUserModule.updateUserPassword(userId, newPasswordHash);
```

---

## 🔐 Security Best Practices

### 1. Never Store Passwords

```javascript
// ❌ WRONG - Never do this!
const user = { email, password: plainTextPassword };
await SupabaseUserModule.createUser(user);

// ✅ CORRECT - Always hash passwords
const bcrypt = require('bcrypt');
const passwordHash = await bcrypt.hash(plainTextPassword, 10);
const user = { email, passwordHash };
await SupabaseUserModule.createUser(user);
```

### 2. Use Row Level Security (RLS)

All tables have RLS enabled. Users can only see/modify their own data:

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Users can only see their own documents
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);
```

### 3. Protect Sensitive Credentials

```javascript
// ❌ DON'T expose service role key in frontend
console.log(SupabaseConfig.supabaseServiceKey); // Never do this!

// ✅ DO use anon key in frontend, service key only in backend
// Frontend: Use SupabaseConfig.supabaseAnonKey
// Backend: Use environment variable for service key
```

### 4. Validate All Inputs

```javascript
// ✅ Validate email format before database operations
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (!isValidEmail(userData.email)) {
    throw new Error('Invalid email format');
}
```

### 5. Enable HTTPS Only

All Supabase connections are HTTPS by default. Never disable SSL in production.

---

## 🧪 Testing the Setup

### Test 1: Verify Database Connection

```javascript
// In your browser console
const client = await initSupabase();
if (client) {
    console.log('✓ Connected to Supabase');
} else {
    console.log('✗ Failed to connect to Supabase');
}
```

### Test 2: Create Test User

```javascript
const testUser = await SupabaseUserModule.createUser({
    email: 'test@signflow.com',
    name: 'Test User',
    passwordHash: 'test_hash_123',
    provider: 'email'
});
console.log('✓ Test user created:', testUser?.id);
```

### Test 3: Fetch User

```javascript
const user = await SupabaseUserModule.getUserByEmail('test@signflow.com');
console.log('✓ User fetched:', user?.name);
```

### Test 4: Check Audit Log

```javascript
const logs = await SupabaseUserModule.getUserAuditLog(testUser.id);
console.log('✓ Audit log entries:', logs.length);
```

---

## 🚨 Troubleshooting

### Issue: "supabase is not defined"
**Solution:** Make sure Supabase library is loaded before your scripts:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Issue: 404 errors on Supabase operations
**Solution:** Verify your Project URL is correct (check Settings → API)

### Issue: "Unauthorized" errors
**Solution:** Make sure Row Level Security policies are properly configured

### Issue: "CORS error" in browser console
**Solution:** 
1. Go to Supabase Dashboard
2. Settings → API → CORS Settings
3. Add your domain to allowed origins

### Issue: Database tables not created
**Solution:** Run the SQL setup script again in SQL Editor

---

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Real-time Database](https://supabase.com/docs/guides/realtime)

---

## ✅ Setup Verification Checklist

- [ ] Supabase project created
- [ ] SQL setup script executed successfully
- [ ] All tables visible in Supabase dashboard
- [ ] Credentials copied to `js/supabase-config.js`
- [ ] Supabase scripts added to HTML files
- [ ] `initSupabase()` runs on page load
- [ ] Test user created successfully
- [ ] Audit log shows user actions
- [ ] RLS policies are enabled
- [ ] CORS settings configured (if needed)

---

## 🎯 Next Steps

1. Update all HTML files with Supabase scripts
2. Modify your authentication code to use `SupabaseUserModule`
3. Replace localStorage with database calls gradually
4. Test all user operations
5. Enable advanced features (2FA, email verification, etc.)
6. Deploy to production with proper environment variables

---

**Need Help?** Check the Supabase Dashboard Logs:
- Click **Logs** in the left sidebar
- Look for error details
- Common issues are usually related to CORS or RLS policies

**Support:** https://supabase.com/support

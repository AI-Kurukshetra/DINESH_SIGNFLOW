# Supabase + UserManager Integration Guide

## 🔗 How UserManager + Supabase Work Together

The SignFlow application uses a **hybrid approach**:

- **Frontend:** UserManager (localStorage) - for fast, offline access
- **Backend:** Supabase Database - for persistent, secure storage

This dual approach provides:
- ✅ Fast user experience (localStorage reads are instant)
- ✅ Data persistence (Supabase is always in sync)
- ✅ Real-time collaboration (via Supabase subscriptions)
- ✅ Security and backups (Supabase handles infrastructure)

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│          User Interactions (HTML UI)                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│         UserManager (localStorage)                   │
│  ├─ Fast reads/writes                               │
│  ├─ Offline support                                  │
│  └─ Session data                                     │
└────────────────┬─────────────────┬──────────────────┘
                 │                 │
              (sync)           (fallback)
                 │                 │
                 ▼                 ▼
┌─────────────────────────────────────────────────────┐
│      SupabaseUserModule (Database Bridge)            │
│  ├─ User CRUD operations                             │
│  ├─ Audit logging                                    │
│  └─ Session management                              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│           Supabase PostgreSQL Database               │
│  ├─ users table                                      │
│  ├─ user_metadata table                              │
│  ├─ documents table                                  │
│  ├─ signatures table                                 │
│  ├─ audit_log table                                  │
│  ├─ sessions table                                   │
│  └─ verification_codes table                         │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Files You Need

### 1. Configuration Files
- **`js/supabase-config.js`** - Supabase client initialization
- **`js/supabase-user-module.js`** - User operations for database
- **`supabase-database-setup.sql`** - Database schema (run once in Supabase)

### 2. Documentation
- **`SUPABASE_SETUP.md`** - Initial Supabase setup guide
- **`SUPABASE_USER_SETUP.md`** - User module database setup
- **`SUPABASE_INTEGRATION_GUIDE.md`** - This file

### 3. Existing Files (Already Present)
- `js/userManager.js` - Local user management
- `js/auth.js` - Authentication logic
- All HTML files

---

## 🛠️ Implementation Checklist

### Phase 1: Database Setup (15 minutes)
- [ ] Create Supabase project
- [ ] Run SQL setup script
- [ ] Copy credentials to config

### Phase 2: Frontend Integration (30 minutes)
- [ ] Add Supabase scripts to all HTML files
- [ ] Update `main.js` to initialize Supabase
- [ ] Test database connection

### Phase 3: User Operations (1-2 hours)
- [ ] Update registration to use `SupabaseUserModule.createUser()`
- [ ] Update login to sync with database
- [ ] Update profile update forms

### Phase 4: Audit & Security (1 hour)
- [ ] Enable Row Level Security
- [ ] Test with multiple users
- [ ] Verify audit logs are recorded

### Phase 5: Advanced Features (Optional)
- [ ] Real-time subscriptions
- [ ] Email verification
- [ ] 2FA setup
- [ ] Password reset flow

---

## 🚀 Step-by-Step Implementation

### Step 1: Setup Supabase Database

1. Follow [SUPABASE_USER_SETUP.md](SUPABASE_USER_SETUP.md) - Quick Setup section
2. Run the SQL from `supabase-database-setup.sql`
3. Verify all tables are created

### Step 2: Configure Your Project

Edit `js/supabase-config.js`:

```javascript
const SupabaseConfig = {
    supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',  // ← GET FROM SUPABASE
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',           // ← GET FROM SUPABASE
    // ... rest stays the same
};
```

### Step 3: Update HTML Files

Add to `<head>` of all HTML files:

```html
<!-- Load these in order -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/supabase-user-module.js"></script>
```

### Step 4: Initialize Supabase

In `js/main.js`, add:

```javascript
// Initialize Supabase connection
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing application...');
    
    // Initialize UserManager
    UserManager.init();
    
    // Initialize Supabase
    await initSupabase();
    console.log('✓ Supabase initialized');
    
    // Check if user is logged in
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
        console.log('✓ User logged in:', currentUser.email);
        // Sync with database
        const dbUser = await SupabaseUserModule.getUserById(currentUser.id);
        if (dbUser) {
            console.log('✓ Database user verified');
        }
    }
});
```

### Step 5: Update Registration

Modify your registration handler:

```javascript
async function handleRegisterSubmit(email, name, password) {
    try {
        // 1. Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // 2. Create in Supabase
        const newUser = await SupabaseUserModule.createUser({
            email: email,
            name: name,
            passwordHash: passwordHash,
            provider: 'email',
            verified: false,
            metadata: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            }
        });
        
        if (!newUser) {
            throw new Error('Failed to create user in database');
        }
        
        // 3. Also store locally
        UserManager.createUser({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            passwordHash: passwordHash,
            provider: 'email'
        });
        
        console.log('✓ User registered:', email);
        // Redirect to login
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        showError(error.message);
    }
}
```

### Step 6: Update Login

Modify your login handler:

```javascript
async function handleLoginSubmit(email, password) {
    try {
        // 1. Get user from database
        const user = await SupabaseUserModule.getUserByEmail(email);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // 2. Verify password
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            throw new Error('Invalid password');
        }
        
        // 3. Update last login in database
        await SupabaseUserModule.updateUserLastLogin(user.id);
        
        // 4. Create session
        const token = generateAuthToken(user.id);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await SupabaseUserModule.createSession(user.id, token, expiresAt);
        
        // 5. Store locally
        localStorage.setItem('signflow_auth_token', token);
        localStorage.setItem('signflow_current_user', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }));
        
        console.log('✓ User logged in:', email);
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('❌ Login error:', error.message);
        showError(error.message);
    }
}
```

### Step 7: Update Profile Page

```javascript
async function loadUserProfile(userId) {
    try {
        // 1. Get from database
        const user = await SupabaseUserModule.getUserById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // 2. Display user data
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRole').textContent = user.role;
        
        // 3. Display metadata
        if (user.user_metadata) {
            document.getElementById('company').value = user.user_metadata.company || '';
            document.getElementById('position').value = user.user_metadata.position || '';
            document.getElementById('phone').value = user.user_metadata.phone_number || '';
        }
        
        console.log('✓ Profile loaded');
        
    } catch (error) {
        console.error('❌ Error loading profile:', error.message);
    }
}

async function saveUserProfile(userId, updates) {
    try {
        // 1. Update user data
        await SupabaseUserModule.updateUser(userId, {
            name: updates.name,
            picture: updates.picture
        });
        
        // 2. Update metadata
        await SupabaseUserModule.updateUserMetadata(userId, {
            company: updates.company,
            position: updates.position,
            phoneNumber: updates.phone,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        
        console.log('✓ Profile saved');
        showSuccess('Profile updated successfully');
        
    } catch (error) {
        console.error('❌ Error saving profile:', error.message);
        showError('Failed to save profile');
    }
}
```

---

## 🔄 Real-time Sync Strategy

### Option 1: Periodic Sync (Recommended for simplicity)
```javascript
// Sync every 5 minutes
setInterval(async () => {
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
        const dbUser = await SupabaseUserModule.getUserById(currentUser.id);
        if (dbUser) {
            UserManager.updateUser(currentUser.id, dbUser);
        }
    }
}, 5 * 60 * 1000);
```

### Option 2: Real-time Subscriptions (Advanced)
```javascript
// Real-time updates when user profile changes
const subscription = SupabaseUserModule.subscribeToChanges(
    'users',
    (payload) => {
        if (payload.new.id === currentUser.id) {
            console.log('User profile updated:', payload.new);
            UserManager.updateUser(payload.new.id, payload.new);
        }
    }
);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    subscription?.unsubscribe();
});
```

---

## 🧪 Testing Checklist

```javascript
// Test database connection
console.log('Test 1: Connection');
const client = await initSupabase();
console.assert(client !== null, 'Supabase client not initialized');

// Test user creation
console.log('Test 2: Create User');
const newUser = await SupabaseUserModule.createUser({
    email: `test${Date.now()}@example.com`,
    name: 'Test User',
    passwordHash: 'test_hash'
});
console.assert(newUser?.id !== undefined, 'User creation failed');

// Test user retrieval
console.log('Test 3: Get User');
const fetchedUser = await SupabaseUserModule.getUserById(newUser.id);
console.assert(fetchedUser?.email === newUser.email, 'User retrieval failed');

// Test audit log
console.log('Test 4: Audit Log');
const logs = await SupabaseUserModule.getUserAuditLog(newUser.id);
console.assert(logs?.length > 0, 'Audit log empty');

console.log('✓ All tests passed!');
```

---

## 📊 Monitoring & Debugging

### View Database Activity
1. Open Supabase Dashboard
2. Click **Logs** → **Query Performance**
3. Check for slow queries or errors

### View Audit Trail
```javascript
// Get all actions for a user
const auditLog = await SupabaseUserModule.getUserAuditLog(userId);
auditLog.forEach(log => {
    console.log(`${log.action} - ${log.table_name} at ${log.created_at}`);
});
```

### Check Database Storage
```
Supabase Dashboard → Storage → 
View size and file count
```

---

## 🚀 Deployment Checklist

- [ ] Test all user operations locally
- [ ] Run security tests
- [ ] Enable RLS policies
- [ ] Set up automated backups
- [ ] Configure CORS for your domain
- [ ] Use environment variables for credentials
- [ ] Remove test/dummy data
- [ ] Update API documentation
- [ ] Create user documentation
- [ ] Set up monitoring alerts

---

## 📚 Additional Resources

- [Supabase Tutorial: Complete User Management](https://supabase.com/docs/guides/auth)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Token Guide](https://jwt.io/)
- [Row Level Security Deep Dive](https://supabase.com/docs/guides/auth/row-level-security)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)

---

**Questions?** Check the [SUPABASE_USER_SETUP.md](SUPABASE_USER_SETUP.md) troubleshooting section or Supabase documentation.

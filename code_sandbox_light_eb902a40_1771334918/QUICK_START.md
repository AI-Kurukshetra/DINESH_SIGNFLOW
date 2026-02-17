# SignFlow User Maintenance Module - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Google OAuth Client ID
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → Create **OAuth 2.0 Web Application**
5. Add authorized redirect URI: `http://localhost:8000`
6. Copy your **Client ID**

### Step 2: Update Client ID in Code
Replace `YOUR_GOOGLE_CLIENT_ID` in these files:

**`login.html`** (line ~54):
```html
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```

**`js/auth.js`** (line ~10):
```javascript
googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```

### Step 3: Test the Application
Application is already running on `http://localhost:8000`

## 🎯 Key Features

### For Users:
- ✅ **Sign in with Google** - One-click authentication
- ✅ **Email/Password Registration** - Traditional signup
- ✅ **Profile Management** - Update personal info
- ✅ **Security Settings** - Change password, manage sessions
- ✅ **User Preferences** - Notifications, theme, language

### For Admins:
- ✅ **Admin Dashboard** - User statistics and management
- ✅ **User Search** - Find users by name or email
- ✅ **Role Management** - Assign admin/user roles
- ✅ **User Actions** - Suspend, edit, view users
- ✅ **User Statistics** - Active users, authentication methods

## 📋 Navigation Map

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/index.html` | Landing page |
| Login | `/login.html` | User authentication |
| Register | `/register.html` | New account creation |
| Profile | `/profile.html` | User settings & info |
| Admin | `/admin.html` | Admin user management (requires admin role) |
| Dashboard | `/dashboard.html` | Main application |

## 🔐 Test Accounts

After setup, you can:

### Test 1: Google Sign-In
1. Go to `login.html`
2. Click "Sign in with Google"
3. Use your Google account

### Test 2: Email/Password Registration
1. Go to `register.html`
2. Fill in details:
   - Name: John Doe
   - Email: john@example.com
   - Password: TestPass123! (min 8 chars)
3. Auto-redirects to dashboard

### Test 3: Admin Features
1. After login, manually promote to admin:
```javascript
// Open browser console (F12 → Console tab)
const user = UserManager.getCurrentUser();
UserManager.updateUserRole(user.id, 'admin');
```
2. Visit `/admin.html` for admin features
3. Manage users, view statistics, change roles

## 🎨 Available Pages & Files

```
New Files Created:
├── login.html                 (User login)
├── register.html             (User registration)
├── profile.html              (User profile & settings)
├── admin.html                (Admin dashboard)
├── js/auth.js                (Authentication logic)
├── js/userManager.js         (User CRUD operations)
├── css/auth.css              (Authentication styling)
├── USER_MAINTENANCE_GUIDE.md (Full documentation)
└── QUICK_START.md            (This file)

Updated Files:
├── index.html                (Added login/logout nav)
├── js/main.js                (Added auth initialization)
└── js/storage.js             (Added user-related methods)
```

## 💡 Common Use Cases

### Use Case 1: Let users register
```javascript
// Navigate to register.html
// Users fill in email, name, password
// Auto-creates account and logs them in
```

### Use Case 2: Protect a page
```html
<script>
    document.addEventListener('DOMContentLoaded', function() {
        requireAuth(); // Redirects to login if not authenticated
    });
</script>
```

### Use Case 3: Get current user data
```javascript
const user = UserManager.getCurrentUser();
// Returns: {id, email, name, picture, role, status, ...}
```

### Use Case 4: Create user programmatically
```javascript
const newUser = UserManager.createUser({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'SecurePassword123'
});
```

### Use Case 5: Update user profile
```javascript
UserManager.updateUser(userId, {
    name: 'Jane Doe',
    metadata: {
        company: 'Acme Inc'
    }
});
```

## 🔄 Authentication Flow Diagram

```
User Visits Website
        ↓
  Authenticated?
    ↙         ↘
   NO         YES
   ↓           ↓
 Login    Dashboard
  Page     (Protected)
   ↓
   ├─→ Google Sign-In → Session Created
   │
   └─→ Email/Password → Validate → Session Created
   
Session Created
   ↓
Auto-renew every 24h (or 7d if "Remember Me")
   ↓
Inactivity Timeout (30 min)
   ↓
Session Expires → Redirect to Login
```

## 🛠️ Development Tips

### Debug User Data
```javascript
// View all users
console.log(UserManager.getAllUsers());

// View current user
console.log(UserManager.getCurrentUser());

// View user statistics
console.log(UserManager.getUserStatistics());
```

### Monitor Authentication Events
```javascript
// Listen to login
AuthModule.on('login', (e) => {
    console.log('User logged in:', e.detail.user);
});

// Listen to logout
AuthModule.on('logout', () => {
    console.log('User logged out');
});

// Listen to user creation
UserManager.on('created', (e) => {
    console.log('New user:', e.detail.user);
});
```

### View Session Info
```javascript
// Check if authenticated
console.log(AuthModule.isAuthenticated());

// Get auth token
console.log(AuthModule.getToken());

// Check session expiry
const expiry = localStorage.getItem('signflow_session_expiry');
console.log('Session expires in:', new Date(parseInt(expiry)));
```

## ⚠️ Important Notes

### Browser Storage
- Passwords are hashed before storage
- Session tokens stored in localStorage
- **Note**: In production, use secure HttpOnly cookies

### Password Security
- Current: Base64 encoding (demo only)
- **Production**: Use bcrypt or Argon2

### Data Persistence
- All user data stored in browser localStorage
- **Production**: Use secure backend database

## 🚀 Next Steps

1. ✅ Set up Google OAuth Client ID (Step 2)
2. ✅ Test login and registration
3. ✅ Customize styling in `css/auth.css`
4. ✅ Add backend integration for production
5. ✅ Implement email verification
6. ✅ Set up real 2FA (Two-Factor Authentication)
7. ✅ Move to secure backend authentication

## 📞 Troubleshooting

### Google Sign-In Not Working?
```
❌ Client ID not set
   → Update in auth.js line 10
   
❌ Redirect URI not authorized
   → Add http://localhost:8000 to Google Cloud Console
   
❌ Google+ API not enabled
   → Enable in Google Cloud Console
```

### Can't Login After Registration?
```
❌ User not created
   → Check browser console for errors
   → Check localStorage for "signflow_users"
   
❌ Password incorrect
   → Ensure password matches exactly
   → Minimum 8 characters required
```

### Session Keeps Expiring?
```
❌ 24-hour default expiry
   → Check "Remember Me" for 7-day session
   
❌ Inactivity logout (30 min)
   → Any page activity resets timer
```

## 📚 Additional Resources

- [Google Sign-In Docs](https://developers.google.com/identity/sign-in)
- [OAuth 2.0 Explained](https://oauth.net/2/)
- [Web Security Best Practices](https://owasp.org/www-project-top-ten/)
- [localStorage Reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Version**: 1.0.0  
**Updated**: February 2025  
**Status**: ✅ Ready for Testing

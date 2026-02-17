# Supabase Integration Guide

## 📋 Prerequisites

1. Create a free account at [Supabase.com](https://supabase.com)
2. Create a new project in Supabase dashboard
3. Get your credentials from Project Settings → API

## 🔧 Setup Steps

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Key** (public key)
   - **Service Role Key** (optional, for server operations)

### Step 2: Update Configuration

Edit [js/supabase-config.js](js/supabase-config.js) and replace:

```javascript
supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co'
supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
```

### Step 3: Add Supabase Script to HTML

Add this to the `<head>` section of your HTML files:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
```

### Step 4: Create Database Tables

In Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Signatures Table
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id),
  user_id UUID REFERENCES users(id),
  signature_data TEXT,
  signed_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Audit Log Table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  details TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Step 5: Create Storage Buckets

In Supabase dashboard, go to **Storage**:

1. Create bucket: `documents` (public or private as needed)
2. Create bucket: `signatures` (public or private as needed)

### Step 6: Set Row Level Security (RLS)

Enable RLS for security policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create basic policies (customize as needed)
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT USING (auth.uid() = user_id);
```

## 💻 Usage Examples

### Initialize Supabase in JavaScript

```javascript
// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await initSupabase();
});
```

### Insert a User

```javascript
const newUser = await SupabaseModule.insertUser({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user'
});
```

### Upload a Document

```javascript
const file = document.getElementById('fileInput').files[0];
const result = await SupabaseModule.uploadDocument(
    'documents',
    `user123/${file.name}`,
    file
);
```

### Get User Data

```javascript
const user = await SupabaseModule.getUserById('user-id-here');
console.log(user);
```

### Record Audit Log

```javascript
const auditEntry = await SupabaseModule.insertSignature({
    document_id: 'doc-123',
    user_id: 'user-123',
    signature_data: 'canvas-data-string'
});
```

### Real-time Subscriptions

```javascript
const subscription = SupabaseModule.subscribeToChanges(
    'documents',
    (payload) => {
        console.log('Document changed:', payload);
    }
);

// Unsubscribe when done
// subscription.unsubscribe();
```

## 🔐 Security Best Practices

1. **Never expose Service Role Key** in frontend code
2. **Use Row Level Security (RLS)** policies for data access control
3. **Enable SSL** for all database connections
4. **Rotate keys regularly** in production
5. **Use environment variables** for sensitive data in deployment
6. **Validate all inputs** before database operations

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Database Security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Credentials copied to `js/supabase-config.js`
- [ ] Supabase script added to HTML files
- [ ] Database tables created
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Test connection with browser console

---

**Need Help?** Check the Supabase dashboard logs or browser console for detailed error messages.

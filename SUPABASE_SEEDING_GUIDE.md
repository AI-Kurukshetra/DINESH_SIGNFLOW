# Supabase Seeding Guide

## 📚 Overview

This guide explains how to seed your Supabase database with test data for development and testing purposes.

---

## 🗂️ Files Reference

### 1. **supabase-database-setup.sql**
- Creates all database tables
- Sets up Row Level Security (RLS)
- Configures triggers and functions
- **Run FIRST**

### 2. **supabase-seed-data.sql**
- Inserts test users, documents, signatures
- Creates sample audit logs and sessions
- **Run SECOND** (after schema setup)

---

## 🚀 One-Step Setup Process

### Step 1: Run Schema Setup

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy all content from `supabase-database-setup.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Wait for completion ✓

### Step 2: Run Seed Data

1. Click **New Query** in SQL Editor
2. Copy all content from `supabase-seed-data.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Wait for completion ✓

### Step 3: Verify Setup

Run this verification query:

```sql
SELECT 
    COUNT(*) as users,
    (SELECT COUNT(*) FROM documents) as documents,
    (SELECT COUNT(*) FROM signatures) as signatures,
    (SELECT COUNT(*) FROM audit_log) as audit_logs
FROM users;
```

Expected result:
```
users | documents | signatures | audit_logs
  4   |     5     |     2      |     7
```

---

## 📊 Test Data Created

### Users

| Email | Name | Password | Role | Status |
|-------|------|----------|------|--------|
| admin@signflow.com | Admin User | admin123 | admin | active |
| john@example.com | John Doe | admin123 | user | active |
| jane@example.com | Jane Smith | admin123 | user | active |
| bob@example.com | Bob Wilson | admin123 | user | active |

**Password for all test users:** `admin123`

### Documents

| Title | Owner | Status | File Size |
|-------|-------|--------|-----------|
| Contract Agreement 2026 | John Doe | pending | 2 MB |
| Vendor Agreement | John Doe | signed | 1.5 MB |
| Project Proposal | Jane Smith | pending | 3 MB |
| Service Agreement | Jane Smith | signed | 1 MB |
| Legal Review Document | Bob Wilson | draft | 2.5 MB |

### Signatures

| Document | Signed By | Date |
|----------|-----------|------|
| Vendor Agreement | John Doe | 2 days ago |
| Service Agreement | Jane Smith | 1 day ago |

### Audit Trail

- 7 audit entries tracking user actions
- Includes login, registration, document creation, signature, and email verification events

### Sessions

- 3 active sessions for each test user
- Valid for 24 hours

### Verification Codes

- Email verification code (used)
- 2FA code (pending)
- Password reset code (pending)

---

## 🧪 Testing with Test Accounts

### Login as Admin

```bash
Email: admin@signflow.com
Password: admin123
```

Can view:
- All users
- All documents
- Admin dashboard
- Audit logs

### Login as Regular User

```bash
Email: john@example.com
Password: admin123
```

Can view:
- Own profile
- Own documents (2 documents)
- Own signatures
- Own audit log

---

## 🔐 Security Consideration

> **⚠️ IMPORTANT:** These test credentials are **FOR DEVELOPMENT ONLY**
>
> Before deploying to production:
> 1. Delete all test users
> 2. Create real user accounts
> 3. Use secure, unique passwords
> 4. Enable 2FA for all accounts
> 5. Implement proper access controls

---

## 🎯 What Can You Test Now?

### User Management
- ✅ Login with different accounts
- ✅ View user profiles
- ✅ Update user preferences
- ✅ Check metadata

### Document Operations
- ✅ View own documents
- ✅ Upload new documents
- ✅ Change document status
- ✅ Delete documents

### Signature Workflow
- ✅ Add signatures
- ✅ View signatures
- ✅ Track signature history
- ✅ Check signature metadata

### Audit Trail
- ✅ View user actions
- ✅ Track document changes
- ✅ Monitor login history
- ✅ Review audit logs

### Session Management
- ✅ Test session creation
- ✅ Verify token expiration
- ✅ Test session deletion
- ✅ Handle multiple sessions

---

## 🛠️ Advanced Testing

### Verify RLS Policies

```sql
-- Test: John should only see his own data
SET LOCAL "app.current_user_id" = '22222222-2222-2222-2222-222222222222'::uuid;
SELECT * FROM documents;  -- Should only see John's 2 documents
```

### Check Audit Logging

```sql
-- View all actions by a specific user
SELECT action, table_name, created_at 
FROM audit_log 
WHERE user_id = '22222222-2222-2222-2222-222222222222'::uuid
ORDER BY created_at DESC;
```

### Verify Signature Chain

```sql
-- Check all signatures for a document
SELECT u.name, s.signed_at, s.ipv4_address
FROM signatures s
JOIN users u ON s.user_id = u.id
WHERE s.document_id = 'a2222222-2222-2222-2222-222222222222'::uuid
ORDER BY s.signed_at DESC;
```

---

## 📝 Custom Seeding

### Add Your Own Test User

```sql
INSERT INTO users (email, name, password_hash, picture, provider, verified, role, status)
VALUES (
    'newuser@example.com',
    'New Test User',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OzeIKUVctW0Jy2R7OWMXky8KyW2gf.9qFm',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=newuser',
    'email',
    true,
    'user',
    'active'
);

-- Also add metadata
INSERT INTO user_metadata (user_id, company, position, timezone)
VALUES (
    (SELECT id FROM users WHERE email = 'newuser@example.com'),
    'Your Company',
    'Your Position',
    'America/New_York'
);
```

### Add Test Document

```sql
INSERT INTO documents (user_id, title, description, file_path, file_size, mime_type, status)
VALUES (
    (SELECT id FROM users WHERE email = 'john@example.com'),
    'Test Document',
    'This is a test document',
    'documents/john/test.pdf',
    1024000,
    'application/pdf',
    'pending'
);
```

### Add Test Signature

```sql
INSERT INTO signatures (document_id, user_id, signature_data, signed_at)
VALUES (
    (SELECT id FROM documents WHERE title = 'Test Document' LIMIT 1),
    (SELECT id FROM users WHERE email = 'john@example.com'),
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    NOW()
);
```

---

## 🧹 Cleaning Up Test Data

### Delete All Test Data (WARNING: DESTRUCTIVE)

```sql
-- This will delete everything (including production data!)
-- Use with CAUTION!

DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users);
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users);
DELETE FROM signatures;
DELETE FROM audit_log;
DELETE FROM documents;
DELETE FROM user_metadata;
DELETE FROM users;
```

### Delete Only Test Users

```sql
DELETE FROM users WHERE email IN (
    'test@signflow.com',
    'admin@signflow.com',
    'john@example.com',
    'jane@example.com',
    'bob@example.com'
);
```

### Delete Specific Documents

```sql
DELETE FROM documents WHERE title = 'Contract Agreement 2026';
```

---

## 🐛 Troubleshooting

### Issue: "Duplicate key value violates unique constraint"

**Cause:** You're running the seed script twice

**Solution:** 
```sql
-- Delete existing data first
DELETE FROM verification_codes;
DELETE FROM sessions;
DELETE FROM signatures;
DELETE FROM audit_log;
DELETE FROM documents;
DELETE FROM user_metadata;
DELETE FROM users;

-- Then run seed script again
```

### Issue: "relation does not exist"

**Cause:** Schema setup (supabase-database-setup.sql) hasn't been run

**Solution:** Run the schema setup SQL first

### Issue: RLS Policy Blocking Queries

**Cause:** User doesn't have permission to access data

**Solution:** Check RLS policies or set current user context:
```sql
SET LOCAL "app.current_user_id" = 'user_id_here'::uuid;
```

---

## 📊 Database Statistics After Seeding

```sql
-- Get comprehensive statistics
SELECT 
    'Users' as table_name,
    COUNT(*) as record_count,
    pg_size_pretty(pg_total_relation_size('users')) as size
FROM users
UNION ALL
SELECT 'Documents', COUNT(*), pg_size_pretty(pg_total_relation_size('documents'))
FROM documents
UNION ALL
SELECT 'Signatures', COUNT(*), pg_size_pretty(pg_total_relation_size('signatures'))
FROM signatures
UNION ALL
SELECT 'Audit Log', COUNT(*), pg_size_pretty(pg_total_relation_size('audit_log'))
FROM audit_log
UNION ALL
SELECT 'Sessions', COUNT(*), pg_size_pretty(pg_total_relation_size('sessions'))
FROM sessions;
```

---

## 🔑 Quick Reference

### Test Account UUIDs

```
Admin:    11111111-1111-1111-1111-111111111111
John:     22222222-2222-2222-2222-222222222222
Jane:     33333333-3333-3333-3333-333333333333
Bob:      44444444-4444-4444-4444-444444444444
```

### Test Document UUIDs

```
Contract:     a1111111-1111-1111-1111-111111111111
Vendor:       a2222222-2222-2222-2222-222222222222
Proposal:     a3333333-3333-3333-3333-333333333333
Service:      a4444444-4444-4444-4444-444444444444
Legal:        a5555555-5555-5555-5555-555555555555
```

### Common Passwords

```
All test accounts: admin123
```

---

## ✅ Post-Seeding Checklist

- [ ] Database schema created successfully
- [ ] Seed data inserted without errors
- [ ] Verified row count matches expectations
- [ ] Tested login with admin account
- [ ] Tested login with regular user
- [ ] Verified RLS policies work
- [ ] Checked audit trail is recording actions
- [ ] Confirmed sessions are working
- [ ] Tested document access restrictions

---

## 📚 Next Steps

1. **Test Frontend Integration:** Login using test credentials
2. **Test API Endpoints:** Query the database from your app
3. **Add More Data:** Create additional test scenarios
4. **Performance Testing:** Load test with larger datasets
5. **Security Audit:** Review RLS policies and access controls
6. **Production Prep:** Replace test data before deployment

---

**Need Help?** Refer to the main setup guides or Supabase documentation: https://supabase.com/docs

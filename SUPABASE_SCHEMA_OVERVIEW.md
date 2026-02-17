# Supabase Schema & Seeding Overview

## 🗂️ Complete Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNFLOW DATABASE                         │
│                  (PostgreSQL via Supabase)                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│     USERS TABLE      │      │      SESSIONS TABLE   │
├──────────────────────┤      ├──────────────────────┤
│ id (UUID) Primary    │◄────►│ id (UUID)            │
│ email VARCHAR        │      │ user_id (FK)         │
│ name VARCHAR         │      │ token VARCHAR        │
│ password_hash        │      │ refresh_token        │
│ picture TEXT         │      │ expires_at           │
│ provider VARCHAR     │      │ created_at           │
│ verified BOOLEAN     │      └──────────────────────┘
│ role VARCHAR         │
│ status VARCHAR       │      ┌──────────────────────┐
│ created_at TIMESTAMP │      │ VERIFICATION_CODES   │
│ updated_at TIMESTAMP │      ├──────────────────────┤
│ last_login TIMESTAMP │◄────►│ id (UUID)            │
└──────────────────────┘      │ user_id (FK)         │
         │                     │ code VARCHAR         │
         │                     │ type VARCHAR         │
         │                     │ expires_at           │
         │                     │ used BOOLEAN         │
         │                     └──────────────────────┘
         │
         │      ┌──────────────────────┐
         └─────►│  USER_METADATA TABLE │
                ├──────────────────────┤
                │ id (UUID)            │
                │ user_id (FK)         │
                │ last_ip_address      │
                │ login_attempts       │
                │ two_factor_enabled   │
                │ phone_number         │
                │ company VARCHAR      │
                │ position VARCHAR     │
                │ timezone VARCHAR     │
                │ language VARCHAR     │
                │ preferences JSONB    │
                │ created_at           │
                │ updated_at           │
                └──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│   DOCUMENTS TABLE    │      │   SIGNATURES TABLE   │
├──────────────────────┤      ├──────────────────────┤
│ id (UUID) Primary    │◄────►│ id (UUID)            │
│ user_id (FK)         │      │ document_id (FK)     │
│ title VARCHAR        │      │ user_id (FK)         │
│ description TEXT     │      │ signature_data TEXT  │
│ file_path VARCHAR    │      │ signed_at TIMESTAMP  │
│ file_size INTEGER    │      │ ipv4_address         │
│ mime_type VARCHAR    │      │ user_agent TEXT      │
│ status VARCHAR       │      │ created_at           │
│ created_at TIMESTAMP │      └──────────────────────┘
│ updated_at TIMESTAMP │
└──────────────────────┘

┌──────────────────────────────────────────────┐
│        AUDIT_LOG TABLE (Append-only)         │
├──────────────────────────────────────────────┤
│ id (UUID)                                    │
│ user_id (FK) ────┐                           │
│ action VARCHAR   │                           │
│ table_name       │ Tracks all user actions   │
│ record_id (FK)   │ - logins                  │
│ old_values JSONB │ - registrations           │
│ new_values JSONB │ - document uploads        │
│ details TEXT     │ - signatures              │
│ created_at       │ - profile updates         │
└──────────────────┬───────────────────────────┘
                   │
                   └──► Used for compliance &
                        security audits
```

---

## 📊 Seeded Test Data Overview

### Users Test Set

```
┌─────────────────────────────────────────────┐
│         ADMIN ACCOUNT (Full Access)          │
├─────────────────────────────────────────────┤
│ Email:    admin@signflow.com               │
│ Name:     Admin User                       │
│ Password: admin123                         │
│ Role:     admin                            │
│ Status:   active                           │
│ Company:  SignFlow Inc                     │
│ 2FA:      Disabled                         │
│ Created:  System initialization            │
└─────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│       REGULAR USERS (Limited Access)         │
├──────────────────────────────────────────────┤
│ 1. john@example.com (John Doe)              │
│    Company: Acme Corporation                │
│    Position: Manager                        │
│    Documents: 2 (1 pending, 1 signed)       │
│    Signatures: 1                            │
│                                              │
│ 2. jane@example.com (Jane Smith)            │
│    Company: Tech Innovations LLC            │
│    Position: Senior Manager                 │
│    Documents: 2                             │
│    Signatures: 1                            │
│    2FA: Enabled                             │
│                                              │
│ 3. bob@example.com (Bob Wilson)             │
│    Company: Global Services                 │
│    Position: Consultant                     │
│    Provider: Google OAuth                   │
│    Documents: 1 (draft)                     │
│    Signatures: 0                            │
└──────────────────────────────────────────────┘
```

### Documents & Signatures Flow

```
DOCUMENTS WORKFLOW
┌────────────────────────────────────────────────┐
│  Contract Agreement 2026 (John's)              │
│  Status: PENDING → Waiting for signature       │
│  Size: 2 MB                                    │
│  Created: Now - 0 days                         │
│  Signers: 0/1                                  │
└────────────────────┬─────────────────────────────┘
                     │ Awaiting signature...

┌────────────────────────────────────────────────┐
│  Vendor Agreement (John's)                     │
│  Status: SIGNED ✓ Complete                     │
│  Size: 1.5 MB                                  │
│  Created: Now - 3 days                         │
│  Signers: 1/1                                  │
│  Signed by: John Doe on 2 days ago            │
└─────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  Project Proposal (Jane's)                     │
│  Status: PENDING → Waiting for signature       │
│  Size: 3 MB                                    │
│  Created: Now - 1 day                          │
│  Signers: 0/1                                  │
└────────────────────┬─────────────────────────────┘
                     │ Awaiting signature...

┌────────────────────────────────────────────────┐
│  Service Agreement (Jane's)                    │
│  Status: SIGNED ✓ Complete                     │
│  Size: 1 MB                                    │
│  Created: Now - 5 days                         │
│  Signers: 1/1                                  │
│  Signed by: Jane Smith on 1 day ago           │
└─────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  Legal Review Document (Bob's)                 │
│  Status: DRAFT → Work in progress              │
│  Size: 2.5 MB                                  │
│  Created: Now - 0 days                         │
│  Signers: 0/0 (Not yet ready)                 │
└─────────────────────────────────────────────────┘
```

### Audit Trail Sample

```
AUDIT_LOG SHOWING USER ACTIVITIES
─────────────────────────────────────────────────

[Admin User] 11:00 AM
  ✓ login → users
    Status: Active session established

[John Doe] 10:55 AM
  ✓ register → users
    Status: New account created

[John Doe] 10:50 AM
  ✓ create → documents
    Record: Contract Agreement 2026

[John Doe] 10:45 AM
  ✓ sign → signatures
    Document: Vendor Agreement

[Jane Smith] 10:40 AM
  ✓ verify_email → users
    Status: Email verified

[Jane Smith] 10:35 AM
  ✓ update → user_metadata
    Change: 2FA enabled
```

---

## 🔄 Data Relationships

```
┌─────────────┐
│   Users (4) │
└──────┬──────┘
       │
       ├──► user_metadata (4 records)
       │
       ├──► documents (5 records)
       │    ├──► signatures (2)
       │    └──► audit_log (triggered)
       │
       ├──► sessions (3 active)
       │
       ├──► verification_codes (3)
       │
       └──► audit_log (7 entries)
            └── tracks all actions
```

---

## 📈 Database Statistics After Seeding

| Entity | Count | Size | Purpose |
|--------|-------|------|---------|
| Users | 4 | - | Authentication |
| User Metadata | 4 | - | Preferences & Settings |
| Documents | 5 | 11.2 MB total | Documents to sign |
| Signatures | 2 | - | Signature records |
| Sessions | 3 | - | Active sessions |
| Verification Codes | 3 | - | Email/2FA |
| Audit Log Entries | 7 | - | Activity tracking |

---

## 🔐 Security Model

```
ROW LEVEL SECURITY (RLS) STRUCTURE
─────────────────────────────────────

┌─ PUBLIC (Anyone, if RLS disabled)
├─ AUTHENTICATED (Logged in users)
│  ├─ Can view own profile
│  ├─ Can view own documents
│  ├─ Can view own signatures
│  ├─ Can view own audit log
│  └─ Cannot see other users' data
│
└─ ADMIN (Full permissions)
   ├─ Can view all users
   ├─ Can view all documents
   ├─ Can view all signatures
   ├─ Can view audit logs
   └─ Can modify system settings
```

---

## 🧪 Test Scenarios Enabled

### Scenario 1: Multi-User Workflow
```
✓ John uploads document → Jane reviews → Signs
✓ Tracks all actions in audit log
✓ Records signature with timestamp & IP
```

### Scenario 2: Document Lifecycle
```
✓ Create → Draft → Pending → Signed → Archive
✓ Each state tracked separately
✓ Multiple documents per user
```

### Scenario 3: Session Management
```
✓ Multiple concurrent sessions
✓ Token expiration after 24 hours
✓ Refresh token support
```

### Scenario 4: 2FA Testing
```
✓ User (Jane) has 2FA enabled
✓ Verification codes ready
✓ Time-limited codes
```

### Scenario 5: Audit Compliance
```
✓ Every action logged with user ID
✓ Timestamps preserved
✓ Before/after values tracked
✓ IP address recorded
```

---

## 📚 Quick Navigation

| Document | Purpose |
|----------|---------|
| [supabase-database-setup.sql](supabase-database-setup.sql) | Schema creation |
| [supabase-seed-data.sql](supabase-seed-data.sql) | Test data |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Initial setup |
| [SUPABASE_USER_SETUP.md](SUPABASE_USER_SETUP.md) | User module |
| [SUPABASE_INTEGRATION_GUIDE.md](SUPABASE_INTEGRATION_GUIDE.md) | Integration |
| [SUPABASE_SEEDING_GUIDE.md](SUPABASE_SEEDING_GUIDE.md) | Seeding help |
| [SUPABASE_COMPLETE_REFERENCE.md](SUPABASE_COMPLETE_REFERENCE.md) | Quick ref |

---

## ✅ Verification Steps

After seeding, verify with these queries:

```sql
-- Check total records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM documents) as documents,
  (SELECT COUNT(*) FROM signatures) as signatures;
-- Expected: 4 | 5 | 2

-- Test RLS policy
SELECT * FROM documents WHERE user_id = '22222222-2222-2222-2222-222222222222'::uuid;
-- Expected: 2 documents owned by John

-- Check audit trail
SELECT action, COUNT(*) FROM audit_log GROUP BY action;
-- Shows distribution of action types
```

---

**All files ready in GitHub!** 🚀

Ready to start development with fully seeded test database.

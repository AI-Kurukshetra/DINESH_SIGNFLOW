-- ============================================
-- SUPABASE SEEDING SCRIPT
-- ============================================
-- This file contains test data to seed the database
-- Run this AFTER running supabase-database-setup.sql
-- 
-- WARNING: This will populate your database with test data
-- For production, modify or remove this before deploying

-- ============================================
-- SEED USERS TABLE
-- ============================================

-- Test Admin User
INSERT INTO users (id, email, name, password_hash, picture, provider, verified, role, status, last_login)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'admin@signflow.com',
    'Admin User',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OzeIKUVctW0Jy2R7OWMXky8KyW2gf.9qFm', -- password: 'admin123'
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    'email',
    true,
    'admin',
    'active',
    NOW()
);

-- Test Regular Users
INSERT INTO users (id, email, name, password_hash, picture, provider, verified, role, status)
VALUES 
    (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'john@example.com',
        'John Doe',
        '$2a$10$EixZaYVK1fsbw1ZfbX3OzeIKUVctW0Jy2R7OWMXky8KyW2gf.9qFm', -- password: 'admin123'
        'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        'email',
        true,
        'user',
        'active'
    ),
    (
        '33333333-3333-3333-3333-333333333333'::uuid,
        'jane@example.com',
        'Jane Smith',
        '$2a$10$EixZaYVK1fsbw1ZfbX3OzeIKUVctW0Jy2R7OWMXky8KyW2gf.9qFm', -- password: 'admin123'
        'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        'email',
        true,
        'user',
        'active'
    ),
    (
        '44444444-4444-4444-4444-444444444444'::uuid,
        'bob@example.com',
        'Bob Wilson',
        '$2a$10$EixZaYVK1fsbw1ZfbX3OzeIKUVctW0Jy2R7OWMXky8KyW2gf.9qFm', -- password: 'admin123'
        'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        'google',
        true,
        'user',
        'active'
    );

-- ============================================
-- SEED USER METADATA TABLE
-- ============================================

INSERT INTO user_metadata (user_id, last_ip_address, login_attempts, two_factor_enabled, phone_number, company, position, timezone, language, preferences)
VALUES
    (
        '11111111-1111-1111-1111-111111111111'::uuid,
        '192.168.1.1',
        0,
        false,
        '+1-555-0100',
        'SignFlow Inc',
        'System Administrator',
        'America/New_York',
        'en',
        '{"theme": "dark", "notifications": true, "language": "en"}'::jsonb
    ),
    (
        '22222222-2222-2222-2222-222222222222'::uuid,
        '192.168.1.100',
        0,
        false,
        '+1-555-0101',
        'Acme Corporation',
        'Manager',
        'America/Chicago',
        'en',
        '{"theme": "light", "notifications": true, "language": "en"}'::jsonb
    ),
    (
        '33333333-3333-3333-3333-333333333333'::uuid,
        '192.168.1.101',
        0,
        true,
        '+1-555-0102',
        'Tech Innovations LLC',
        'Senior Manager',
        'America/Los_Angeles',
        'en',
        '{"theme": "dark", "notifications": false, "language": "en"}'::jsonb
    ),
    (
        '44444444-4444-4444-4444-444444444444'::uuid,
        '192.168.1.102',
        0,
        false,
        '+1-555-0103',
        'Global Services',
        'Consultant',
        'Europe/London',
        'en',
        '{"theme": "light", "notifications": true, "emailDigest": "weekly"}'::jsonb
    );

-- ============================================
-- SEED DOCUMENTS TABLE
-- ============================================

INSERT INTO documents (id, user_id, title, description, file_path, file_size, mime_type, status)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Contract Agreement 2026',
        'Annual contract renewal with updated terms and conditions',
        'documents/john/contract-2026.pdf',
        2048576,
        'application/pdf',
        'pending'
    ),
    (
        'a2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Vendor Agreement',
        'Vendor contract for supplies and services',
        'documents/john/vendor-agreement.pdf',
        1536000,
        'application/pdf',
        'signed'
    ),
    (
        'a3333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Project Proposal',
        'Detailed project proposal for Q1 2026 initiative',
        'documents/jane/project-proposal.pdf',
        3145728,
        'application/pdf',
        'pending'
    ),
    (
        'a4444444-4444-4444-4444-444444444444'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Service Agreement',
        'Service level agreement with client XYZ',
        'documents/jane/service-agreement.pdf',
        1024000,
        'application/pdf',
        'signed'
    ),
    (
        'a5555555-5555-5555-5555-555555555555'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Legal Review Document',
        'Document submitted for legal review and approval',
        'documents/bob/legal-review.pdf',
        2560000,
        'application/pdf',
        'draft'
    );

-- ============================================
-- SEED SIGNATURES TABLE
-- ============================================

INSERT INTO signatures (id, document_id, user_id, signature_data, signed_at, ipv4_address, user_agent)
VALUES
    (
        'b1111111-1111-1111-1111-111111111111'::uuid,
        'a2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        NOW() - INTERVAL '2 days',
        '192.168.1.100',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ),
    (
        'b2222222-2222-2222-2222-222222222222'::uuid,
        'a4444444-4444-4444-4444-444444444444'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        NOW() - INTERVAL '1 day',
        '192.168.1.101',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    );

-- ============================================
-- SEED AUDIT LOG TABLE
-- ============================================

INSERT INTO audit_log (id, user_id, action, table_name, record_id, old_values, new_values, details)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'login',
        'users',
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        'Admin user logged in successfully'
    ),
    (
        'c2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'register',
        'users',
        '22222222-2222-2222-2222-222222222222'::uuid,
        NULL,
        '{"email": "john@example.com", "name": "John Doe", "role": "user"}'::jsonb,
        'New user registered'
    ),
    (
        'c3333333-3333-3333-3333-333333333333'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'create',
        'documents',
        'a1111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        '{"title": "Contract Agreement 2026", "status": "pending"}'::jsonb,
        'Document uploaded for signature'
    ),
    (
        'c4444444-4444-4444-4444-444444444444'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'sign',
        'signatures',
        'b1111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        '{"document_id": "a2222222-2222-2222-2222-222222222222"}'::jsonb,
        'Document signed successfully'
    ),
    (
        'c5555555-5555-5555-5555-555555555555'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'login',
        'users',
        '33333333-3333-3333-3333-333333333333'::uuid,
        NULL,
        NULL,
        'User logged in'
    ),
    (
        'c6666666-6666-6666-6666-666666666666'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'update',
        'user_metadata',
        '33333333-3333-3333-3333-333333333333'::uuid,
        NULL,
        '{"two_factor_enabled": true}'::jsonb,
        'User enabled two-factor authentication'
    ),
    (
        'c7777777-7777-7777-7777-777777777777'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'verify_email',
        'users',
        '22222222-2222-2222-2222-222222222222'::uuid,
        NULL,
        NULL,
        'Admin verified user email'
    );

-- ============================================
-- SEED SESSIONS TABLE
-- ============================================

INSERT INTO sessions (id, user_id, token, refresh_token, expires_at, ip_address, user_agent)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJpYXQiOjE2NDEwMzY4MDB9.invalid',
        'refresh_token_admin_001',
        NOW() + INTERVAL '24 hours',
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    ),
    (
        'd2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMi0yMjIyLTIyMjItMjIyMi0yMjIyMjIyMjIyMjIiLCJpYXQiOjE2NDEwMzY4MDB9.invalid',
        'refresh_token_john_001',
        NOW() + INTERVAL '24 hours',
        '192.168.1.100',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    ),
    (
        'd3333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzMzMzMzMy0zMzMzLTMzMzMtMzMzMy0zMzMzMzMzMzMzMzMiLCJpYXQiOjE2NDEwMzY4MDB9.invalid',
        'refresh_token_jane_001',
        NOW() + INTERVAL '24 hours',
        '192.168.1.101',
        'Mozilla/5.0 (X11; Linux x86_64)'
    );

-- ============================================
-- SEED VERIFICATION CODES TABLE
-- ============================================

INSERT INTO verification_codes (id, user_id, code, type, expires_at, used)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        '123456',
        'email_verification',
        NOW() + INTERVAL '24 hours',
        true
    ),
    (
        'e2222222-2222-2222-2222-222222222222'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '654321',
        '2fa',
        NOW() + INTERVAL '15 minutes',
        false
    ),
    (
        'e3333333-3333-3333-3333-333333333333'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        '789012',
        'password_reset',
        NOW() + INTERVAL '1 hour',
        false
    );

-- ============================================
-- DISPLAY SEEDING SUMMARY
-- ============================================

SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM user_metadata) as total_metadata,
    (SELECT COUNT(*) FROM documents) as total_documents,
    (SELECT COUNT(*) FROM signatures) as total_signatures,
    (SELECT COUNT(*) FROM audit_log) as total_audit_logs,
    (SELECT COUNT(*) FROM sessions) as total_sessions,
    (SELECT COUNT(*) FROM verification_codes) as total_verification_codes;

-- ============================================
-- TEST USER CREDENTIALS
-- ============================================
-- 
-- The following test accounts have been created.
-- All test accounts use the password: 'admin123'
--
-- Admin Account:
--   Email: admin@signflow.com
--   Password: admin123
--   Role: admin
--
-- Test Users:
--   Email: john@example.com      | Password: admin123 | Role: user
--   Email: jane@example.com      | Password: admin123 | Role: user  
--   Email: bob@example.com       | Password: admin123 | Role: user
--
-- NOTE: These are test credentials only. Change passwords in production!
-- ============================================

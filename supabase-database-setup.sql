-- ============================================
-- SUPABASE DATABASE SETUP FOR SIGNFLOW
-- ============================================

-- Drop existing tables if needed (for fresh setup)
-- DROP TABLE IF EXISTS user_metadata CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(500), -- Only hash, never plain text
  picture TEXT, -- URL to profile picture
  provider VARCHAR(50) DEFAULT 'email', -- 'google', 'email', 'github', etc.
  verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin', 'moderator'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for faster queries
  CONSTRAINT users_email_check CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'moderator')),
  CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- USER METADATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_ip_address VARCHAR(45), -- Support IPv4 and IPv6
  login_attempts INTEGER DEFAULT 0,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  phone_number VARCHAR(20),
  company VARCHAR(255),
  position VARCHAR(255),
  timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  preferences JSONB DEFAULT '{}', -- Store additional preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_user_metadata_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_metadata UNIQUE (user_id)
);

CREATE INDEX idx_user_metadata_user_id ON user_metadata(user_id);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500), -- Path in storage bucket
  file_size INTEGER, -- In bytes
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending', 'signed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT documents_status_check CHECK (status IN ('draft', 'pending', 'signed', 'archived'))
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- ============================================
-- SIGNATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL, -- Base64 encoded signature
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ipv4_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_document_user_signature UNIQUE (document_id, user_id)
);

CREATE INDEX idx_signatures_document_id ON signatures(document_id);
CREATE INDEX idx_signatures_user_id ON signatures(user_id);
CREATE INDEX idx_signatures_signed_at ON signatures(signed_at);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'sign', etc.
  table_name VARCHAR(100), -- Which table was affected
  record_id UUID, -- Which record was affected
  old_values JSONB, -- Previous values
  new_values JSONB, -- New values
  ip_address VARCHAR(45),
  user_agent TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT audit_log_action_check CHECK (action IN ('login', 'logout', 'register', 'create', 'update', 'delete', 'sign', 'verify', 'verify_email', 'password_change', 'password_reset'))
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);

-- ============================================
-- SESSIONS TABLE (for token management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- VERIFICATION CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email_verification', 'password_reset', '2fa'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_verification_codes_type ON verification_codes(type);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User metadata policies
CREATE POLICY "Users can view their own metadata" 
  ON user_metadata FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own metadata" 
  ON user_metadata FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
  ON documents FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Signatures policies
CREATE POLICY "Users can view their own signatures" 
  ON signatures FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create signatures" 
  ON signatures FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Audit log policies (read-only, append-only)
CREATE POLICY "Users can view their own audit logs" 
  ON audit_log FOR SELECT 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Sessions policies
CREATE POLICY "Users can view their own sessions" 
  ON sessions FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_metadata table
CREATE TRIGGER user_metadata_updated_at_trigger
BEFORE UPDATE ON user_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for documents table
CREATE TRIGGER documents_updated_at_trigger
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sessions table
CREATE TRIGGER sessions_updated_at_trigger
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to log user actions to audit_log
CREATE OR REPLACE FUNCTION log_user_action(
  p_user_id UUID,
  p_action VARCHAR,
  p_table_name VARCHAR DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_details TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, details)
  VALUES (p_user_id, p_action, p_table_name, p_record_id, p_old_values, p_new_values, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL TEST DATA (Optional - remove in production)
-- ============================================

-- Uncomment to add test user
-- INSERT INTO users (email, name, password_hash, provider, verified, role, status)
-- VALUES ('test@signflow.com', 'Test User', 'hashed_password_here', 'email', true, 'user', 'active');

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Main users table storing authentication and profile information';
COMMENT ON TABLE user_metadata IS 'Extended user metadata including preferences and settings';
COMMENT ON TABLE documents IS 'Digital documents to be signed';
COMMENT ON TABLE signatures IS 'Signature records for documents';
COMMENT ON TABLE audit_log IS 'Complete audit trail of all user actions';
COMMENT ON TABLE sessions IS 'Active user sessions and tokens';
COMMENT ON TABLE verification_codes IS 'One-time verification codes for email and 2FA';

-- Display setup completion
-- SELECT 'Supabase database setup completed successfully!' AS status;

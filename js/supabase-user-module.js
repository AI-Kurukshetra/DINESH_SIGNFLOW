// Enhanced Supabase Integration for UserManager
// This module bridges UserManager (localStorage) with Supabase (database)

const SupabaseUserModule = {
    // Get initialized Supabase client
    async getClient() {
        return await initSupabase();
    },

    // ===== USER CRUD OPERATIONS =====

    // Create new user (Register)
    async createUser(userData) {
        const client = await this.getClient();
        if (!client) {
            console.error('Supabase not initialized');
            return null;
        }

        try {
            // Insert user into users table
            const { data, error } = await client
                .from('users')
                .insert([{
                    email: userData.email.toLowerCase(),
                    name: userData.name,
                    password_hash: userData.passwordHash || null,
                    picture: userData.picture || null,
                    provider: userData.provider || 'email',
                    verified: userData.verified || false,
                    role: userData.role || 'user',
                    status: 'active'
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating user:', error.message);
                return null;
            }

            // Create user metadata
            if (data) {
                await this.createUserMetadata(data.id, userData.metadata || {});
                // Log action
                await this.logAuditAction(data.id, 'register', 'users', data.id, null, data);
            }

            return data;
        } catch (error) {
            console.error('Exception creating user:', error);
            return null;
        }
    },

    // Get user by email
    async getUserByEmail(email) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('users')
                .select('*, user_metadata(*)')
                .eq('email', email.toLowerCase())
                .single();

            if (error) {
                console.error('Error fetching user:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception fetching user:', error);
            return null;
        }
    },

    // Get user by ID
    async getUserById(userId) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('users')
                .select('*, user_metadata(*)')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception fetching user:', error);
            return null;
        }
    },

    // Get all users (admin only)
    async getAllUsers() {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('users')
                .select('*, user_metadata(*)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching users:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception fetching users:', error);
            return null;
        }
    },

    // Update user profile
    async updateUser(userId, updates) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            // Prepare update object (exclude fields that shouldn't be updated)
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            // Remove fields that shouldn't be updated
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.password_hash; // Use separate function for password

            const { data, error } = await client
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating user:', error.message);
                return null;
            }

            // Log action
            await this.logAuditAction(userId, 'update', 'users', userId, null, updateData);

            return data;
        } catch (error) {
            console.error('Exception updating user:', error);
            return null;
        }
    },

    // Update user password
    async updateUserPassword(userId, newPasswordHash) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('users')
                .update({
                    password_hash: newPasswordHash,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating password:', error.message);
                return null;
            }

            // Log action
            await this.logAuditAction(userId, 'password_change', 'users', userId);

            return data;
        } catch (error) {
            console.error('Exception updating password:', error);
            return null;
        }
    },

    // Update last login
    async updateUserLastLogin(userId) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('users')
                .update({
                    last_login: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating last login:', error.message);
                return null;
            }

            // Log action
            await this.logAuditAction(userId, 'login', 'users', userId);

            return data;
        } catch (error) {
            console.error('Exception updating last login:', error);
            return null;
        }
    },

    // Delete user
    async deleteUser(userId) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            // Caution: This will cascade delete all related records
            const { error } = await client
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('Error deleting user:', error.message);
                return null;
            }

            // Log action
            await this.logAuditAction(userId, 'delete', 'users', userId);

            return true;
        } catch (error) {
            console.error('Exception deleting user:', error);
            return null;
        }
    },

    // ===== USER METADATA OPERATIONS =====

    // Create user metadata
    async createUserMetadata(userId, metadata) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('user_metadata')
                .insert([{
                    user_id: userId,
                    last_ip_address: metadata.lastIpAddress || null,
                    login_attempts: metadata.loginAttempts || 0,
                    two_factor_enabled: metadata.twoFactorEnabled || false,
                    phone_number: metadata.phoneNumber || null,
                    company: metadata.company || null,
                    position: metadata.position || null
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating user metadata:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception creating user metadata:', error);
            return null;
        }
    },

    // Update user metadata
    async updateUserMetadata(userId, metadata) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const updateData = {
                last_ip_address: metadata.lastIpAddress || undefined,
                login_attempts: metadata.loginAttempts !== undefined ? metadata.loginAttempts : undefined,
                two_factor_enabled: metadata.twoFactorEnabled !== undefined ? metadata.twoFactorEnabled : undefined,
                phone_number: metadata.phoneNumber || undefined,
                company: metadata.company || undefined,
                position: metadata.position || undefined,
                timezone: metadata.timezone || undefined,
                language: metadata.language || undefined,
                preferences: metadata.preferences || undefined
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

            const { data, error } = await client
                .from('user_metadata')
                .update(updateData)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating user metadata:', error.message);
                return null;
            }

            // Log action
            await this.logAuditAction(userId, 'update', 'user_metadata', userId, null, updateData);

            return data;
        } catch (error) {
            console.error('Exception updating user metadata:', error);
            return null;
        }
    },

    // ===== AUDIT LOG OPERATIONS =====

    // Log user action
    async logAuditAction(userId, action, tableName, recordId, oldValues = null, newValues = null, details = null) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('audit_log')
                .insert([{
                    user_id: userId,
                    action: action,
                    table_name: tableName,
                    record_id: recordId,
                    old_values: oldValues,
                    new_values: newValues,
                    details: details
                }])
                .select()
                .single();

            if (error) {
                console.error('Error logging audit action:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception logging audit action:', error);
            return null;
        }
    },

    // Get user audit log
    async getUserAuditLog(userId, limit = 100) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('audit_log')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching audit log:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception fetching audit log:', error);
            return null;
        }
    },

    // ===== SESSION OPERATIONS =====

    // Create session
    async createSession(userId, token, expiresAt, refreshToken = null) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('sessions')
                .insert([{
                    user_id: userId,
                    token: token,
                    refresh_token: refreshToken,
                    expires_at: expiresAt
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating session:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception creating session:', error);
            return null;
        }
    },

    // Get session by token
    async getSessionByToken(token) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('sessions')
                .select('*')
                .eq('token', token)
                .single();

            if (error) {
                console.error('Error fetching session:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception fetching session:', error);
            return null;
        }
    },

    // Delete session
    async deleteSession(sessionId) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { error } = await client
                .from('sessions')
                .delete()
                .eq('id', sessionId);

            if (error) {
                console.error('Error deleting session:', error.message);
                return null;
            }

            return true;
        } catch (error) {
            console.error('Exception deleting session:', error);
            return null;
        }
    },

    // ===== VERIFICATION CODE OPERATIONS =====

    // Create verification code
    async createVerificationCode(userId, code, type, expiresAt) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('verification_codes')
                .insert([{
                    user_id: userId,
                    code: code,
                    type: type,
                    expires_at: expiresAt
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating verification code:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception creating verification code:', error);
            return null;
        }
    },

    // Verify and use code
    async useVerificationCode(code, type) {
        const client = await this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('verification_codes')
                .update({
                    used: true,
                    used_at: new Date().toISOString()
                })
                .eq('code', code)
                .eq('type', type)
                .eq('used', false)
                .select()
                .single();

            if (error) {
                console.error('Error verifying code:', error.message);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception verifying code:', error);
            return null;
        }
    }
};

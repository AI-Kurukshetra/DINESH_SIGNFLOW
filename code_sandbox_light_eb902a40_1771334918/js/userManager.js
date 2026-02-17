// User Manager Module - Handles user CRUD operations and maintenance
const UserManager = {
    storageKey: 'signflow_users',
    currentUserKey: 'signflow_current_user',

    // Initialize user storage
    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    },

    // ===== READ Operations =====

    // Get all users
    getAllUsers() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    },

    // Get user by ID
    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId);
    },

    // Get user by email
    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    // Get current logged-in user
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    },

    // ===== CREATE Operations =====

    // Create/Register new user
    createUser(userData) {
        // Validate input
        if (!userData.email || !userData.name) {
            throw new Error('Email and name are required');
        }

        if (!this.isValidEmail(userData.email)) {
            throw new Error('Invalid email format');
        }

        // Check if user already exists
        if (this.getUserByEmail(userData.email)) {
            throw new Error('User with this email already exists');
        }

        // Create user object
        const user = {
            id: this.generateId(),
            email: userData.email.toLowerCase(),
            name: userData.name,
            password: userData.password ? userData.password : null,
            passwordHash: userData.password ? AuthModule.hashPassword(userData.password) : null,
            picture: userData.picture || null,
            provider: userData.provider || 'email', // 'google', 'email', etc.
            verified: userData.verified || false,
            role: userData.role || 'user', // 'user', 'admin'
            status: 'active', // 'active', 'inactive', 'suspended'
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            metadata: {
                lastIpAddress: null,
                loginAttempts: 0,
                twoFactorEnabled: false,
                phoneNumber: null,
                company: null,
                position: null
            }
        };

        // Save user
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Dispatch event
        this.dispatchEvent('user:created', { user });

        return { ...user, password: undefined, passwordHash: undefined };
    },

    // ===== UPDATE Operations =====

    // Update user profile
    updateUser(userId, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Prevent changing email to existing one
        if (updates.email && updates.email !== users[userIndex].email) {
            if (this.getUserByEmail(updates.email)) {
                throw new Error('Email already in use');
            }
        }

        // Update user
        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            id: users[userIndex].id, // Don't allow ID change
            createdAt: users[userIndex].createdAt, // Don't allow createdAt change
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Update current user if it's the same user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedUser = { ...currentUser, ...updates };
            delete updatedUser.passwordHash;
            localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
        }

        // Dispatch event
        this.dispatchEvent('user:updated', { userId, updates });

        return { ...users[userIndex], password: undefined, passwordHash: undefined };
    },

    // Update user password
    updatePassword(userId, oldPassword, newPassword) {
        const user = this.getUserById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        if (!AuthModule.verifyPassword(oldPassword, user.passwordHash)) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        // Update password
        return this.updateUser(userId, {
            password: newPassword,
            passwordHash: AuthModule.hashPassword(newPassword)
        });
    },

    // Update user last login
    updateUserLastLogin(userId, timestamp) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            users[userIndex].lastLogin = timestamp;
            users[userIndex].updatedAt = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(users));
        }
    },

    // Update user metadata
    updateUserMetadata(userId, metadata) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex].metadata = {
            ...users[userIndex].metadata,
            ...metadata
        };
        users[userIndex].updatedAt = new Date().toISOString();

        localStorage.setItem(this.storageKey, JSON.stringify(users));
        this.dispatchEvent('user:metadata-updated', { userId, metadata });

        return users[userIndex];
    },

    // ===== DELETE Operations =====

    // Delete user
    deleteUser(userId) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(u => u.id !== userId);

        if (filteredUsers.length === users.length) {
            throw new Error('User not found');
        }

        localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));

        // If deleting current user, sign out
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            AuthModule.signOut();
        }

        this.dispatchEvent('user:deleted', { userId });
    },

    // Soft delete (deactivate) user
    deactivateUser(userId) {
        return this.updateUser(userId, { status: 'inactive' });
    },

    // Reactivate user
    reactivateUser(userId) {
        return this.updateUser(userId, { status: 'active' });
    },

    // ===== ADMIN Operations =====

    // Get all users (admin only)
    getAllUsersAdmin() {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.role === 'admin') {
            return this.getAllUsers().map(u => ({
                ...u,
                password: undefined,
                passwordHash: undefined
            }));
        }
        throw new Error('Admin access required');
    },

    // Ban/suspend user (admin only)
    suspendUser(userId, reason = '') {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Admin access required');
        }

        return this.updateUser(userId, { 
            status: 'suspended',
            metadata: {
                suspensionReason: reason,
                suspendedAt: new Date().toISOString()
            }
        });
    },

    // Search users (admin only)
    searchUsers(query) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Admin access required');
        }

        const users = this.getAllUsers();
        const lowerQuery = query.toLowerCase();

        return users.filter(u => 
            u.email.toLowerCase().includes(lowerQuery) ||
            u.name.toLowerCase().includes(lowerQuery)
        ).map(u => ({
            ...u,
            password: undefined,
            passwordHash: undefined
        }));
    },

    // ===== UTILITY Functions =====

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Generate unique user ID
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get user statistics (admin only)
    getUserStatistics() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Admin access required');
        }

        const users = this.getAllUsers();
        return {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            inactive: users.filter(u => u.status === 'inactive').length,
            suspended: users.filter(u => u.status === 'suspended').length,
            googleAuth: users.filter(u => u.provider === 'google').length,
            emailAuth: users.filter(u => u.provider === 'email').length,
            verified: users.filter(u => u.verified).length,
            unverified: users.filter(u => !u.verified).length
        };
    },

    // Check if user has role
    hasRole(userId, role) {
        const user = this.getUserById(userId);
        return user ? user.role === role : false;
    },

    // Upgrade user role (admin only)
    updateUserRole(userId, newRole, performedBy = null) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Admin access required');
        }

        const validRoles = ['user', 'admin', 'moderator'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }

        return this.updateUser(userId, { role: newRole });
    },

    // Export user data (for GDPR compliance)
    exportUserData(userId) {
        const currentUser = this.getCurrentUser();
        
        // Allow user to export their own data or admin to export any user's data
        if ((currentUser.id !== userId) && (currentUser.role !== 'admin')) {
            throw new Error('Unauthorized access');
        }

        const user = this.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return {
            user: { ...user, password: undefined, passwordHash: undefined },
            documents: StorageManager.getDocumentsByUser(userId),
            signatures: StorageManager.getSignaturesByUser(userId),
            activities: StorageManager.getActivitiesByUser(userId),
            exportedAt: new Date().toISOString()
        };
    },

    // Dispatch custom events
    dispatchEvent(eventType, detail = {}) {
        const event = new CustomEvent(`user:${eventType}`, { detail });
        window.dispatchEvent(event);
    },

    // Listen to user events
    on(eventType, callback) {
        window.addEventListener(`user:${eventType}`, callback);
    }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    UserManager.init();
});

// Authentication Module - Handles Google OAuth and Email Authentication
const AuthModule = {
    // Configuration
    config: {
        // Replace with your actual Google OAuth 2.0 Client ID
        googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        storageKeys: {
            token: 'signflow_auth_token',
            user: 'signflow_current_user',
            sessionExpiry: 'signflow_session_expiry',
            refreshToken: 'signflow_refresh_token'
        }
    },

    // Initialize auth module
    init() {
        this.setupGoogleAuth();
        this.checkSessionExpiry();
        this.setupAutoLogout();
    },

    // Setup Google Authentication
    setupGoogleAuth() {
        try {
            // Google Sign-In initialization
            window.onload = function() {
                google.accounts.id.initialize({
                    client_id: AuthModule.config.googleClientId,
                    callback: AuthModule.handleGoogleSignIn,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
            };
        } catch (error) {
            console.log('Google OAuth setup: Make sure to set up Google OAuth credentials');
        }
    },

    // Handle Google Sign-In Response
    handleGoogleSignIn(response) {
        if (response.credential) {
            try {
                // Decode JWT token
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64).split('').map(c => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join('')
                );

                const userData = JSON.parse(jsonPayload);

                // Create user object
                const user = {
                    id: userData.sub,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    provider: 'google',
                    verified: userData.email_verified,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };

                // Save user session
                AuthModule.createSession(user, response.credential);
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Error processing Google sign-in:', error);
                alert('Sign-in failed. Please try again.');
            }
        }
    },

    // Alternative Google Sign-In (for browsers without Google Sign-In library support)
    googleSignIn() {
        const clientId = this.config.googleClientId;
        const redirectUri = window.location.origin + '/oauth-callback.html';
        const scope = 'openid email profile';
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scope)}`;

        window.location.href = authUrl;
    },

    // Email/Password Sign In
    emailSignIn(email, password, remember = false) {
        // Validate input
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        // Check credentials against stored users
        const userData = UserManager.getUserByEmail(email);
        
        if (!userData) {
            alert('User not found. Please create an account first.');
            document.getElementById('email-signin-form').reset();
            return;
        }

        // Verify password (in production, this should be on the backend)
        if (!this.verifyPassword(password, userData.passwordHash)) {
            alert('Invalid email or password');
            document.getElementById('email-signin-form').reset();
            return;
        }

        // Create user session
        const user = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture || null,
            provider: 'email',
            verified: userData.verified || false,
            createdAt: userData.createdAt,
            lastLogin: new Date().toISOString()
        };

        this.createSession(user, null, remember);
        window.location.href = 'dashboard.html';
    },

    // Create authenticated session
    createSession(user, token = null, rememberMe = false) {
        // Update last login
        user.lastLogin = new Date().toISOString();

        // Save current user
        localStorage.setItem(this.config.storageKeys.user, JSON.stringify(user));

        // Set session expiry
        const expiryTime = rememberMe ? 
            Date.now() + (7 * 24 * 60 * 60 * 1000) : // 7 days
            Date.now() + this.config.tokenExpiry; // 24 hours

        localStorage.setItem(this.config.storageKeys.sessionExpiry, expiryTime);

        // Save token if provided
        if (token) {
            localStorage.setItem(this.config.storageKeys.token, token);
        }

        // Update user last login in storage
        UserManager.updateUserLastLogin(user.id, user.lastLogin);

        // Dispatch custom event
        this.dispatchEvent('login', { user });
    },

    // Sign Out
    signOut() {
        // Clear session data
        localStorage.removeItem(this.config.storageKeys.user);
        localStorage.removeItem(this.config.storageKeys.token);
        localStorage.removeItem(this.config.storageKeys.sessionExpiry);
        localStorage.removeItem(this.config.storageKeys.refreshToken);

        // Sign out from Google if available
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }

        // Dispatch custom event
        this.dispatchEvent('logout');

        // Redirect to login
        window.location.href = 'login.html';
    },

    // Check if user is authenticated
    isAuthenticated() {
        const user = localStorage.getItem(this.config.storageKeys.user);
        const expiry = localStorage.getItem(this.config.storageKeys.sessionExpiry);

        if (!user || !expiry) {
            return false;
        }

        if (Date.now() > expiry) {
            this.signOut();
            return false;
        }

        return true;
    },

    // Get current session token
    getToken() {
        return localStorage.getItem(this.config.storageKeys.token);
    },

    // Password hashing (simple implementation - use bcrypt in production)
    hashPassword(password) {
        return btoa(password); // Simple base64 encoding for demo
    },

    // Verify password
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    },

    // Check session expiry and auto-logout
    checkSessionExpiry() {
        setInterval(() => {
            if (this.isAuthenticated()) {
                const expiry = parseInt(localStorage.getItem(this.config.storageKeys.sessionExpiry));
                const timeLeft = expiry - Date.now();

                // Warn user 5 minutes before logout
                if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
                    this.showSessionExpiryWarning(timeLeft);
                }

                // Auto logout
                if (Date.now() > expiry) {
                    this.signOut();
                }
            }
        }, 60000); // Check every minute
    },

    // Setup auto logout on inactivity
    setupAutoLogout() {
        let inactivityTimer;
        const inactivityTimeout = 30 * 60 * 1000; // 30 minutes

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            
            if (this.isAuthenticated()) {
                inactivityTimer = setTimeout(() => {
                    console.log('Logging out due to inactivity');
                    this.signOut();
                }, inactivityTimeout);
            }
        };

        // Events that reset the inactivity timer
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        resetTimer();
    },

    // Show session expiry warning
    showSessionExpiryWarning(timeLeft) {
        const minutes = Math.floor(timeLeft / 60000);
        const message = `Your session will expire in ${minutes} minute${minutes > 1 ? 's' : ''}. Do you want to continue?`;
        
        if (confirm(message)) {
            // Extend session
            const expiryTime = Date.now() + this.config.tokenExpiry;
            localStorage.setItem(this.config.storageKeys.sessionExpiry, expiryTime);
        }
    },

    // Dispatch authentication events
    dispatchEvent(eventType, detail = {}) {
        const event = new CustomEvent(`auth:${eventType}`, { detail });
        window.dispatchEvent(event);
    },

    // Listen to authentication events
    on(eventType, callback) {
        window.addEventListener(`auth:${eventType}`, callback);
    }
};

// Global function for Google Sign-In button
function handleCredentialResponse(response) {
    AuthModule.handleGoogleSignIn(response);
}

// Global function for alternative Google Sign-In
function signInWithGoogle() {
    AuthModule.googleSignIn();
}

// require authentication on certain pages
function requireAuth() {
    if (!AuthModule.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

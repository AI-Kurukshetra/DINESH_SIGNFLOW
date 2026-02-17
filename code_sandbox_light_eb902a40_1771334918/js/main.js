// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navMenu && navToggle && navMenu.classList.contains('active')) {
        if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
            navMenu.classList.remove('active');
        }
    }
});

// Update navigation based on authentication status
document.addEventListener('DOMContentLoaded', function() {
    initializeStorageOnFirstLoad();
    updateNavigation();
});

// Listen for authentication events
window.addEventListener('auth:login', function() {
    updateNavigation();
});

window.addEventListener('auth:logout', function() {
    updateNavigation();
});

// Update navigation UI
function updateNavigation() {
    const navAuth = document.getElementById('nav-auth');
    const navUser = document.getElementById('nav-user');
    
    if (!navAuth || !navUser) return;

    if (AuthModule.isAuthenticated()) {
        const user = UserManager.getCurrentUser();
        if (user) {
            navAuth.style.display = 'none';
            navUser.style.display = 'flex';
            navUser.style.gap = '12px';
            document.getElementById('user-name-nav').textContent = user.name.split(' ')[0];
        }
    } else {
        navAuth.style.display = 'flex';
        navAuth.style.gap = '12px';
        navUser.style.display = 'none';
    }
}

// Logout from navigation
function logoutFromNav() {
    if (confirm('Are you sure you want to log out?')) {
        AuthModule.signOut();
    }
}

// Initialize storage on first load
function initializeStorageOnFirstLoad() {
    if (!localStorage.getItem('signflow_initialized')) {
        const initialData = {
            documents: [],
            signatures: [],
            settings: {
                email: 'user@example.com',
                name: 'Demo User',
                notifications: true
            },
            initialized: true
        };
        
        localStorage.setItem('signflow_documents', JSON.stringify(initialData.documents));
        localStorage.setItem('signflow_signatures', JSON.stringify(initialData.signatures));
        localStorage.setItem('signflow_settings', JSON.stringify(initialData.settings));
        localStorage.setItem('signflow_initialized', 'true');
    }
}

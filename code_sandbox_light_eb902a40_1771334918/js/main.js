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

// Initialize storage on first load
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

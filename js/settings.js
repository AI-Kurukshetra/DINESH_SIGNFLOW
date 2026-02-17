// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
    setupTabNavigation();
});

function initSettings() {
    loadProfileSettings();
    loadSignatures();
    loadNotificationSettings();
    updateStorageInfo();
}

function setupTabNavigation() {
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update menu active state
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.settings-menu-item[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    // Update URL hash
    window.location.hash = tabName;
}

// Load settings on page load from hash
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['profile', 'signatures', 'notifications', 'security', 'data'].includes(hash)) {
        switchTab(hash);
    }
});

// Profile Settings
function loadProfileSettings() {
    const settings = StorageManager.getSettings();
    document.getElementById('userName').value = settings.name || '';
    document.getElementById('userEmail').value = settings.email || '';
    document.getElementById('userTitle').value = settings.title || '';
    document.getElementById('userCompany').value = settings.company || '';
}

function saveProfile() {
    const updates = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        title: document.getElementById('userTitle').value,
        company: document.getElementById('userCompany').value
    };

    StorageManager.updateSettings(updates);
    
    // Show success message
    showNotification('Profile updated successfully!');
}

// Signatures
function loadSignatures() {
    const signatures = StorageManager.getSignatures();
    const signaturesList = document.getElementById('signaturesList');
    
    if (!signaturesList) return;

    if (signatures.length === 0) {
        signaturesList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-gray);">
                <i class="fas fa-signature" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No signatures saved yet. Create your first signature to get started.</p>
            </div>
        `;
        return;
    }

    signaturesList.innerHTML = signatures.map(sig => `
        <div class="signature-card">
            <div class="signature-preview">
                ${sig.type === 'drawn' ? '<i class="fas fa-pen-fancy"></i>' : 
                  sig.type === 'typed' ? '<span style="font-family: cursive; font-size: 1.5rem;">' + sig.name + '</span>' :
                  '<i class="fas fa-image"></i>'}
            </div>
            <div class="signature-actions">
                <button class="btn-outline btn-small" onclick="useSignature('${sig.id}')">
                    <i class="fas fa-check"></i> Use
                </button>
                <button class="btn-outline btn-small" onclick="deleteSignature('${sig.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function createNewSignature() {
    alert('Create Signature\n\nThis would open a signature creation modal similar to the one in the sign page.');
}

function useSignature(id) {
    alert('This signature will be used for your next document signing.');
}

function deleteSignature(id) {
    if (confirm('Are you sure you want to delete this signature?')) {
        StorageManager.deleteSignature(id);
        loadSignatures();
        showNotification('Signature deleted successfully!');
    }
}

// Notifications
function loadNotificationSettings() {
    const settings = StorageManager.getSettings();
    document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
    document.getElementById('notifyViewed').checked = settings.notifyViewed !== false;
    document.getElementById('notifySigned').checked = settings.notifySigned !== false;
    document.getElementById('notifyReminders').checked = settings.notifyReminders !== false;
}

function saveNotifications() {
    const updates = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        notifyViewed: document.getElementById('notifyViewed').checked,
        notifySigned: document.getElementById('notifySigned').checked,
        notifyReminders: document.getElementById('notifyReminders').checked
    };

    StorageManager.updateSettings(updates);
    showNotification('Notification preferences saved!');
}

// Storage & Data
function updateStorageInfo() {
    const documents = StorageManager.getDocuments();
    const documentsCount = document.getElementById('documentsCount');
    
    if (documentsCount) {
        documentsCount.textContent = documents.length;
    }
}

function exportData() {
    const data = {
        documents: StorageManager.getDocuments(),
        signatures: StorageManager.getSignatures(),
        settings: StorageManager.getSettings(),
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `signflow-data-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!');
}

function clearCompletedDocs() {
    if (confirm('This will delete all completed documents. Are you sure?')) {
        const documents = StorageManager.getDocuments();
        const completedIds = documents
            .filter(doc => doc.status === 'completed' || doc.status === 'signed')
            .map(doc => doc.id);
        
        completedIds.forEach(id => StorageManager.deleteDocument(id));
        
        updateStorageInfo();
        showNotification(`${completedIds.length} completed document(s) deleted!`);
    }
}

function deleteAllData() {
    const confirmation = prompt('This will delete ALL your data permanently. Type "DELETE" to confirm:');
    
    if (confirmation === 'DELETE') {
        StorageManager.clearAll();
        showNotification('All data deleted. Refreshing page...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else if (confirmation !== null) {
        alert('Deletion cancelled. Please type "DELETE" exactly to confirm.');
    }
}

// Utility function to show notifications
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

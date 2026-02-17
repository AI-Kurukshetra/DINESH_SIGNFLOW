// Dashboard functionality
let currentTab = 'inbox';

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadUserInfo();
    loadDocuments();
    setupEventListeners();
});

// Initialize dashboard
function initDashboard() {
    // Get current tab from URL hash or default to inbox
    const hash = window.location.hash.replace('#', '');
    if (hash && ['inbox', 'sent', 'completed', 'templates'].includes(hash)) {
        currentTab = hash;
    }
    switchTab(currentTab);
}

// Load user information
function loadUserInfo() {
    const settings = StorageManager.getSettings();
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = settings.name;
    }
}

// Load documents based on current tab
function loadDocuments() {
    updateCounts();
    
    switch(currentTab) {
        case 'inbox':
            loadInboxDocuments();
            break;
        case 'sent':
            loadSentDocuments();
            break;
        case 'completed':
            loadCompletedDocuments();
            break;
        case 'templates':
            // Templates are static HTML, no loading needed
            break;
    }
}

// Update document counts
function updateCounts() {
    const inboxDocs = StorageManager.getInboxDocuments();
    const sentDocs = StorageManager.getSentDocuments();
    const completedDocs = StorageManager.getCompletedDocuments();
    
    document.getElementById('inboxCount').textContent = inboxDocs.length;
    document.getElementById('sentCount').textContent = sentDocs.length;
    document.getElementById('completedCount').textContent = completedDocs.length;
}

// Load inbox documents
function loadInboxDocuments() {
    const documents = StorageManager.getInboxDocuments();
    const container = document.getElementById('inboxDocuments');
    renderDocuments(documents, container, 'inbox');
}

// Load sent documents
function loadSentDocuments() {
    const documents = StorageManager.getSentDocuments();
    const container = document.getElementById('sentDocuments');
    renderDocuments(documents, container, 'sent');
}

// Load completed documents
function loadCompletedDocuments() {
    const documents = StorageManager.getCompletedDocuments();
    const container = document.getElementById('completedDocuments');
    renderDocuments(documents, container, 'completed');
}

// Render documents in grid
function renderDocuments(documents, container, type) {
    if (!container) return;
    
    if (documents.length === 0) {
        showEmptyState(container);
        return;
    }
    
    container.innerHTML = '';
    hideEmptyState();
    
    documents.forEach(doc => {
        const card = createDocumentCard(doc, type);
        container.appendChild(card);
    });
}

// Create document card element
function createDocumentCard(doc, type) {
    const card = document.createElement('div');
    card.className = 'document-card';
    card.onclick = () => openDocumentModal(doc);
    
    const statusClass = `status-${doc.status}`;
    const statusText = doc.status.charAt(0).toUpperCase() + doc.status.slice(1);
    
    let actionButton = '';
    if (type === 'inbox' && doc.status === 'pending') {
        actionButton = `<button class="btn-primary btn-small" onclick="event.stopPropagation(); signDocument('${doc.id}')">Sign Now</button>`;
    } else if (type === 'sent' && doc.status !== 'completed') {
        actionButton = `<button class="btn-outline btn-small" onclick="event.stopPropagation(); viewDocument('${doc.id}')">View Details</button>`;
    } else {
        actionButton = `<button class="btn-outline btn-small" onclick="event.stopPropagation(); downloadDocument('${doc.id}')">Download</button>`;
    }
    
    const progressBar = doc.progress !== undefined ? `
        <div class="document-progress">
            <div class="progress-text">
                <span>Progress</span>
                <span>${doc.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${doc.progress}%"></div>
            </div>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div class="document-header">
            <div class="document-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="document-info">
                <div class="document-title">${doc.name}</div>
                <div class="document-meta">
                    <span><i class="fas fa-calendar"></i> ${StorageManager.formatDate(doc.createdAt)}</span>
                    <span><i class="fas fa-file"></i> ${doc.pages} pages</span>
                </div>
            </div>
        </div>
        <div class="document-status ${statusClass}">
            <i class="fas fa-circle"></i>
            ${statusText}
        </div>
        ${progressBar}
        <div class="document-actions">
            ${actionButton}
        </div>
    `;
    
    return card;
}

// Show empty state
function showEmptyState(container) {
    if (container) {
        container.innerHTML = '';
    }
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

// Hide empty state
function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Switch between tabs
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update URL hash
    window.location.hash = tabName;
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item[data-tab]').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.sidebar-item[data-tab="${tabName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // Update title
    const titles = {
        inbox: 'Inbox',
        sent: 'Sent',
        completed: 'Completed',
        templates: 'Templates'
    };
    const titleElement = document.getElementById('tabTitle');
    if (titleElement) {
        titleElement.textContent = titles[tabName] || 'Dashboard';
    }
    
    // Load documents for the tab
    loadDocuments();
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item[data-tab]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length > 0) {
                performSearch(query);
            } else {
                loadDocuments();
            }
        });
    }
    
    // Close modal on outside click
    const modal = document.getElementById('documentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Perform search
function performSearch(query) {
    const results = StorageManager.searchDocuments(query);
    const container = document.querySelector(`#${currentTab}-content .documents-grid`);
    if (container) {
        renderDocuments(results, container, currentTab);
    }
}

// Open document modal
function openDocumentModal(doc) {
    const modal = document.getElementById('documentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = doc.name;
    
    const recipients = doc.recipients || [];
    const recipientsList = recipients.map(r => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
            <span>${r.name} (${r.email})</span>
            <span class="status-${r.status}">${r.status}</span>
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <div class="modal-detail">
            <span class="modal-detail-label">Status:</span>
            <span class="modal-detail-value status-${doc.status}">${doc.status}</span>
        </div>
        <div class="modal-detail">
            <span class="modal-detail-label">Sender:</span>
            <span class="modal-detail-value">${doc.sender}</span>
        </div>
        <div class="modal-detail">
            <span class="modal-detail-label">Created:</span>
            <span class="modal-detail-value">${StorageManager.formatDate(doc.createdAt)}</span>
        </div>
        <div class="modal-detail">
            <span class="modal-detail-label">Pages:</span>
            <span class="modal-detail-value">${doc.pages}</span>
        </div>
        <div class="modal-detail">
            <span class="modal-detail-label">File Size:</span>
            <span class="modal-detail-value">${doc.fileSize}</span>
        </div>
        ${doc.description ? `
        <div class="modal-detail">
            <span class="modal-detail-label">Description:</span>
            <span class="modal-detail-value">${doc.description}</span>
        </div>
        ` : ''}
        ${recipients.length > 0 ? `
        <div class="modal-detail" style="flex-direction: column; align-items: flex-start;">
            <span class="modal-detail-label" style="margin-bottom: 0.5rem;">Recipients:</span>
            <div style="width: 100%;">${recipientsList}</div>
        </div>
        ` : ''}
        <div class="modal-actions">
            ${doc.status === 'pending' && doc.type === 'received' ? 
                `<button class="btn-primary" onclick="signDocument('${doc.id}')">Sign Document</button>` : 
                `<button class="btn-primary" onclick="viewDocument('${doc.id}')">View Document</button>`
            }
            <button class="btn-outline" onclick="downloadDocument('${doc.id}')">Download</button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('documentModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Sign document action
function signDocument(docId) {
    closeModal();
    window.location.href = `sign.html?id=${docId}`;
}

// View document action
function viewDocument(docId) {
    closeModal();
    window.location.href = `viewer.html?id=${docId}`;
}

// Download document action
function downloadDocument(docId) {
    const doc = StorageManager.getDocumentById(docId);
    if (doc) {
        alert(`Downloading ${doc.name}...\n\nIn a production app, this would trigger a real file download.`);
    }
}

// Create from template
function createFromTemplate(templateType) {
    alert(`Creating document from ${templateType} template...\n\nThis would open the document editor with a pre-filled template.`);
    // In production, this would navigate to editor with template
    // window.location.href = `editor.html?template=${templateType}`;
}

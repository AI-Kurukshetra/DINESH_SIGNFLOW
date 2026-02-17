// Viewer page functionality
let currentDocument = null;
let currentPage = 1;
let totalPages = 1;
let zoomLevel = 100;

document.addEventListener('DOMContentLoaded', function() {
    initViewer();
});

function initViewer() {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (!docId) {
        alert('No document specified');
        window.location.href = 'dashboard.html';
        return;
    }

    currentDocument = StorageManager.getDocumentById(docId);
    if (!currentDocument) {
        alert('Document not found');
        window.location.href = 'dashboard.html';
        return;
    }

    // Update document status to viewed if it was pending
    if (currentDocument.status === 'pending') {
        StorageManager.updateDocument(docId, { status: 'viewed' });
        currentDocument.status = 'viewed';
    }

    loadDocumentDetails();
    renderDocument();
    loadActivity();
}

function loadDocumentDetails() {
    document.getElementById('docTitle').textContent = currentDocument.name;
    document.getElementById('senderInfo').textContent = currentDocument.sender || 'Unknown';
    document.getElementById('createdDate').textContent = StorageManager.formatDate(currentDocument.createdAt);
    document.getElementById('pageCount').textContent = currentDocument.pages || 1;
    document.getElementById('fileSize').textContent = currentDocument.fileSize || 'Unknown';

    totalPages = currentDocument.pages || 1;
    updatePageIndicator();

    // Update status indicator
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    if (statusIndicator && statusText) {
        statusIndicator.className = `status-indicator ${currentDocument.status}`;
        statusText.textContent = currentDocument.status.charAt(0).toUpperCase() + currentDocument.status.slice(1);
    }

    // Load recipients
    loadRecipients();
}

function loadRecipients() {
    const recipientsList = document.getElementById('recipientsList');
    if (!recipientsList) return;

    if (currentDocument.recipients && currentDocument.recipients.length > 0) {
        recipientsList.innerHTML = '';
        currentDocument.recipients.forEach(recipient => {
            const item = document.createElement('div');
            item.className = 'recipient-item';
            item.innerHTML = `
                <div class="recipient-name">${recipient.name}</div>
                <div class="recipient-email">${recipient.email}</div>
                <span class="recipient-status status-${recipient.status}">${recipient.status}</span>
            `;
            recipientsList.appendChild(item);
        });
    } else {
        recipientsList.innerHTML = '<p style="color: var(--text-gray);">No recipients</p>';
    }
}

function loadActivity() {
    const activityLog = document.getElementById('activityLog');
    if (!activityLog) return;

    const activities = [
        {
            time: currentDocument.createdAt,
            text: `Document created by ${currentDocument.sender || 'You'}`
        }
    ];

    if (currentDocument.status === 'viewed' || currentDocument.status === 'signed' || currentDocument.status === 'completed') {
        activities.push({
            time: currentDocument.updatedAt,
            text: 'Document viewed'
        });
    }

    if (currentDocument.status === 'signed' || currentDocument.status === 'completed') {
        activities.push({
            time: currentDocument.signedDate || currentDocument.updatedAt,
            text: 'Document signed'
        });
    }

    if (currentDocument.status === 'completed') {
        activities.push({
            time: currentDocument.completedDate || currentDocument.updatedAt,
            text: 'All signatures completed'
        });
    }

    activityLog.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-time">${StorageManager.formatDate(activity.time)}</div>
            <div class="activity-text">${activity.text}</div>
        </div>
    `).join('');
}

function renderDocument() {
    const viewerWrapper = document.getElementById('viewerWrapper');
    if (!viewerWrapper) return;

    viewerWrapper.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const page = document.createElement('div');
        page.className = 'viewer-page';
        page.id = `viewer-page${i}`;
        page.innerHTML = `
            <i class="fas fa-file-pdf page-placeholder"></i>
            <div class="page-number-indicator">Page ${i}</div>
        `;
        viewerWrapper.appendChild(page);
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        scrollToPage(currentPage);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        scrollToPage(currentPage);
    }
}

function scrollToPage(pageNum) {
    const page = document.getElementById(`viewer-page${pageNum}`);
    if (page) {
        page.scrollIntoView({ behavior: 'smooth' });
    }
    updatePageIndicator();
}

function updatePageIndicator() {
    const indicator = document.getElementById('pageIndicator');
    if (indicator) {
        indicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

function zoomIn() {
    zoomLevel = Math.min(200, zoomLevel + 10);
    updateZoom();
}

function zoomOut() {
    zoomLevel = Math.max(50, zoomLevel - 10);
    updateZoom();
}

function fitToWidth() {
    zoomLevel = 100;
    updateZoom();
}

function updateZoom() {
    const wrapper = document.getElementById('viewerWrapper');
    const zoomLevelElement = document.getElementById('zoomLevel');
    
    if (wrapper) {
        wrapper.style.transform = `scale(${zoomLevel / 100})`;
    }
    
    if (zoomLevelElement) {
        zoomLevelElement.textContent = zoomLevel + '%';
    }
}

function downloadDocument() {
    alert(`Downloading ${currentDocument.name}...\n\nIn a production app, this would download the actual PDF file.`);
}

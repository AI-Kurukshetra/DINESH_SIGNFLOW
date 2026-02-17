// Send confirmation page functionality
let currentDocument = null;

document.addEventListener('DOMContentLoaded', function() {
    initSendPage();
});

function initSendPage() {
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

    loadDocumentSummary();
    loadRecipients();
    loadEmailMessage();
}

function loadDocumentSummary() {
    document.getElementById('documentName').textContent = currentDocument.name;
    
    const fieldCount = currentDocument.fields ? currentDocument.fields.length : 0;
    document.getElementById('totalFields').textContent = fieldCount;

    const signingOrder = currentDocument.signingOrder === 'sequential' ? 
        'Sequential (one at a time)' : 'Parallel (all at once)';
    document.getElementById('signingOrder').textContent = signingOrder;
}

function loadRecipients() {
    const recipientsList = document.getElementById('recipientsList');
    const recipientCount = document.getElementById('recipientCount');
    
    if (!currentDocument.recipients || currentDocument.recipients.length === 0) {
        recipientsList.innerHTML = '<p>No recipients found</p>';
        return;
    }

    recipientCount.textContent = currentDocument.recipients.length;
    recipientsList.innerHTML = '';

    currentDocument.recipients.forEach((recipient, index) => {
        // Count fields assigned to this recipient
        const recipientFields = currentDocument.fields ? 
            currentDocument.fields.filter(f => f.recipient === index) : [];

        const initials = recipient.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        const card = document.createElement('div');
        card.className = 'recipient-card';
        card.innerHTML = `
            <div class="recipient-info">
                <div class="recipient-avatar">${initials}</div>
                <div class="recipient-details">
                    <div class="recipient-name">${recipient.name}</div>
                    <div class="recipient-email">${recipient.email}</div>
                </div>
            </div>
            <div class="recipient-fields">
                ${recipientFields.length} field(s) to complete
            </div>
        `;
        recipientsList.appendChild(card);
    });
}

function loadEmailMessage() {
    const subjectElement = document.getElementById('emailSubject');
    const bodyElement = document.getElementById('emailBody');

    if (subjectElement) {
        subjectElement.textContent = currentDocument.name;
    }

    if (bodyElement) {
        const message = currentDocument.emailMessage || 
            'Please review and sign this document at your earliest convenience.';
        bodyElement.textContent = message;
    }
}

function sendDocument() {
    // Update document status
    StorageManager.updateDocument(currentDocument.id, {
        status: 'sent',
        sentDate: new Date().toISOString()
    });

    // Simulate sending emails to recipients
    if (currentDocument.recipients) {
        currentDocument.recipients.forEach(recipient => {
            console.log(`Sending email to ${recipient.email}...`);
            // In production, this would make an API call to send actual emails
        });
    }

    // Show success modal
    showSuccessModal();
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
    }
}

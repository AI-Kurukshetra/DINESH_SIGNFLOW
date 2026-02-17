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
    
        recipientCount.textContent = currentDocument.recipients ? currentDocument.recipients.length : 0;
        recipientsList.innerHTML = '';

        if (!currentDocument.recipients || currentDocument.recipients.length === 0) {
            recipientsList.innerHTML = '<p>No recipients found</p>';
        } else {
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
                    <div class="recipient-actions">
                        <button class="btn-outline small" onclick="removeRecipient(${index})">Remove</button>
                    </div>
                `;
                recipientsList.appendChild(card);
            });
        }


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
            <div class="recipient-actions">
                <button class="btn-outline small" onclick="removeRecipient(${index})">Remove</button>
            </div>
        `;
        recipientsList.appendChild(card);
    });
}

// Add a recipient from the UI
function addRecipient() {
    const name = document.getElementById('newRecipientName').value.trim();
    const email = document.getElementById('newRecipientEmail').value.trim();
    const type = document.getElementById('newRecipientType').value;

    if (!name || !email) {
        alert('Please provide both name and email for the recipient');
        return;
    }

    // Ensure recipients array exists
    if (!currentDocument.recipients) currentDocument.recipients = [];

    currentDocument.recipients.push({
        name: name,
        email: email,
        type: type,
        status: 'pending'
    });

    // Persist changes
    StorageManager.updateDocument(currentDocument.id, { recipients: currentDocument.recipients });

    // Clear inputs
    document.getElementById('newRecipientName').value = '';
    document.getElementById('newRecipientEmail').value = '';

    loadRecipients();
}

// Remove a recipient by index
function removeRecipient(index) {
    if (!confirm('Remove this recipient?')) return;
    currentDocument.recipients.splice(index, 1);
    StorageManager.updateDocument(currentDocument.id, { recipients: currentDocument.recipients });
    loadRecipients();
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

    // Persist recipient statuses and create a send request record
    const sendRequest = StorageManager.addSendRequest({
        documentId: currentDocument.id,
        documentName: currentDocument.name,
        sender: currentDocument.sender || (UserManager.getCurrentUser() && UserManager.getCurrentUser().email) || 'unknown',
        recipients: currentDocument.recipients || [],
        signingOrder: currentDocument.signingOrder || 'parallel',
        subject: currentDocument.name,
        message: currentDocument.emailMessage || 'Please review and sign this document.'
    });

    // Simulate sending emails and add notifications per recipient
    if (currentDocument.recipients) {
        currentDocument.recipients.forEach(recipient => {
            // mark recipient as pending/sent
            recipient.status = 'pending';

            // Create a notification entry
            StorageManager.addNotification({
                type: 'signature_request',
                to: recipient.email,
                toName: recipient.name,
                documentId: currentDocument.id,
                documentName: currentDocument.name,
                sendRequestId: sendRequest.id,
                status: 'sent',
                signUrl: `${window.location.origin}/sign.html?id=${currentDocument.id}&recipient=${encodeURIComponent(recipient.email)}&send=${sendRequest.id}`
            });

            console.log(`Simulated email sent to ${recipient.email}`);
        });

        // Persist recipient updates on the document
        StorageManager.updateDocument(currentDocument.id, { recipients: currentDocument.recipients });
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

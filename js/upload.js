// Upload page functionality
let selectedFile = null;
let uploadedDocument = null;

// Initialize upload page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    setupFileUpload();
    setupActionRadios();
});

// Load user info
function loadUserInfo() {
    const settings = StorageManager.getSettings();
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = settings.name;
    }
}

// Setup file upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Click to upload
    if (uploadArea) {
        uploadArea.addEventListener('click', function(e) {
            if (e.target !== uploadArea && !uploadArea.contains(e.target)) return;
            fileInput.click();
        });
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFileSelect(e.target.files[0]);
        });
    }

    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
        });
    }
}

// Handle file selection
function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a PDF or Word document.');
        return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('File size exceeds 10MB. Please upload a smaller file.');
        return;
    }

    selectedFile = file;
    showFilePreview(file);
    simulateUpload();
}

// Show file preview
function showFilePreview(file) {
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const docTitle = document.getElementById('docTitle');

    if (uploadArea) uploadArea.style.display = 'none';
    if (filePreview) filePreview.style.display = 'block';

    // Set file details
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = formatFileSize(file.size);
    
    // Pre-fill document title with filename (without extension)
    if (docTitle) {
        docTitle.value = file.name.replace(/\.[^/.]+$/, '');
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Simulate file upload (in production, this would upload to server)
function simulateUpload() {
    const uploadProgress = document.getElementById('uploadProgress');
    const filePreview = document.getElementById('filePreview');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Show progress
    if (filePreview) filePreview.style.display = 'none';
    if (uploadProgress) uploadProgress.style.display = 'block';

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (uploadProgress) uploadProgress.style.display = 'none';
                if (filePreview) filePreview.style.display = 'block';
            }, 500);
        }
    }, 100);
}

// Remove uploaded file
function removeFile() {
    selectedFile = null;
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileInput = document.getElementById('fileInput');

    if (uploadArea) uploadArea.style.display = 'block';
    if (filePreview) filePreview.style.display = 'none';
    if (fileInput) fileInput.value = '';

    // Reset form
    document.getElementById('docTitle').value = '';
    document.getElementById('docDescription').value = '';
    document.querySelector('input[name="action"][value="sign"]').checked = true;
    document.getElementById('recipientsSection').style.display = 'none';
}

// Setup action radio buttons
function setupActionRadios() {
    const radios = document.querySelectorAll('input[name="action"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            const recipientsSection = document.getElementById('recipientsSection');
            if (this.value === 'send') {
                recipientsSection.style.display = 'block';
            } else {
                recipientsSection.style.display = 'none';
            }
        });
    });
}

// Add recipient
function addRecipient() {
    const recipientsList = document.getElementById('recipientsList');
    const newRecipient = document.createElement('div');
    newRecipient.className = 'recipient-item';
    newRecipient.innerHTML = `
        <input type="email" placeholder="Email address" class="recipient-email">
        <input type="text" placeholder="Full name" class="recipient-name">
        <button class="btn-outline btn-small" onclick="removeRecipient(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    recipientsList.appendChild(newRecipient);
}

// Remove recipient
function removeRecipient(button) {
    const recipientsList = document.getElementById('recipientsList');
    const items = recipientsList.querySelectorAll('.recipient-item');
    
    // Keep at least one recipient
    if (items.length > 1) {
        button.closest('.recipient-item').remove();
    } else {
        alert('You must have at least one recipient.');
    }
}

// Proceed to editor
function proceedToEditor() {
    console.log('proceedToEditor() called');
    
    if (!selectedFile) {
        alert('Please upload a document first.');
        console.log('No file selected');
        return;
    }

    // Get form values
    const docTitle = document.getElementById('docTitle').value.trim();
    console.log('Document title:', docTitle);
    
    if (!docTitle) {
        alert('Please enter a document title.');
        document.getElementById('docTitle').focus();
        console.log('Title is empty');
        return;
    }

    const docDescription = document.getElementById('docDescription').value.trim();
    const action = document.querySelector('input[name="action"]:checked').value;
    console.log('Action:', action, 'Description:', docDescription);

    // Create document object with default signature fields
    const newDocument = {
        name: docTitle,
        description: docDescription,
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileType: selectedFile.type,
        pages: Math.floor(Math.random() * 10) + 1, // Simulate page count
        status: 'draft',
        type: action === 'sign' ? 'self' : 'sent',
        fields: [
            {
                id: 'signature_1',
                label: 'Your Signature',
                type: 'signature',
                page: 1,
                x: 50,
                y: 80,
                width: 200,
                height: 100,
                required: true,
                value: null
            },
            {
                id: 'date_1',
                label: 'Date',
                type: 'date',
                page: 1,
                x: 270,
                y: 80,
                width: 200,
                height: 40,
                required: false,
                value: null
            }
        ]
    };

    // If sending to others, get recipients
    if (action === 'send') {
        const recipients = [];
        const recipientItems = document.querySelectorAll('.recipient-item');
        
        let hasError = false;
        recipientItems.forEach(item => {
            const email = item.querySelector('.recipient-email').value.trim();
            const name = item.querySelector('.recipient-name').value.trim();
            
            if (!email || !name) {
                hasError = true;
                return;
            }

            // Basic email validation
            if (!isValidEmail(email)) {
                alert(`Invalid email address: ${email}`);
                hasError = true;
                return;
            }

            recipients.push({
                email: email,
                name: name,
                status: 'pending'
            });
        });

        if (hasError) return;
        if (recipients.length === 0) {
            alert('Please add at least one recipient.');
            return;
        }

        newDocument.recipients = recipients;
        newDocument.signingOrder = document.getElementById('signingOrder').value;
        newDocument.emailMessage = document.getElementById('emailMessage').value.trim();
    }

    try {
        console.log('Saving document to storage...');
        // Save document to storage
        const savedDoc = StorageManager.addDocument(newDocument);
        console.log('Document saved:', savedDoc);
        
        if (!savedDoc || !savedDoc.id) {
            console.error('ERROR: Document not saved properly or no ID returned');
            alert('Error saving document. Please try again.');
            return;
        }
        
        console.log('Redirecting to sign page with ID:', savedDoc.id);
        // Redirect directly to sign page to add signature
        window.location.href = `sign.html?id=${savedDoc.id}`;
    } catch (error) {
        console.error('ERROR in proceedToEditor:', error);
        alert('Error processing document: ' + error.message);
    }
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Preview the signing workflow without navigation
 */
async function previewDocument() {
    try {
        // Validate form first
        const titleInput = document.getElementById('documentTitle');
        const emailInput = document.getElementById('userEmail');
        const fileInput = document.getElementById('documentUpload');
        
        if (!titleInput.value.trim()) {
            alert('Please enter a document title');
            return;
        }
        
        if (!emailInput.value.trim()) {
            alert('Please enter your email');
            return;
        }
        
        if (!isValidEmail(emailInput.value)) {
            alert('Please enter a valid email address');
            return;
        }
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a file to preview');
            return;
        }
        
        // Create temporary document for preview
        const fileContent = await readFileAsBase64(fileInput.files[0]);
        
        const previewDoc = {
            id: 'preview_' + Date.now(),
            title: titleInput.value.trim(),
            userEmail: emailInput.value.trim(),
            fileName: fileInput.files[0].name,
            fileContent: fileContent,
            recipients: [],
            signatureFields: [
                { id: 'signature_1', type: 'signature', x: 100, y: 100, label: 'Signature 1' },
                { id: 'date_1', type: 'date', x: 100, y: 150, label: 'Date' }
            ],
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        // Save preview document
        StorageManager.addDocument(previewDoc);
        
        // Load and display preview
        loadPreview(previewDoc);
        
        // Open modal
        document.getElementById('previewModal').style.display = 'block';
        
    } catch (error) {
        console.error('Preview error:', error);
        alert('Error loading preview: ' + error.message);
    }
}

/**
 * Load preview content
 */
function loadPreview(document) {
    try {
        const previewContent = document.getElementById('previewContent');
        
        // Create preview HTML with sign page content
        const html = `
            <div class="preview-document-container">
                <div class="preview-sidebar">
                    <div class="document-info">
                        <h3>${document.title}</h3>
                        <p><strong>File:</strong> ${document.fileName}</p>
                        <p><strong>Email:</strong> ${document.userEmail}</p>
                    </div>
                </div>
                
                <div class="preview-main">
                    <div class="canvas-area">
                        <img id="previewImage" src="${document.fileContent}" alt="Document Preview" style="max-width: 100%; max-height: 500px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div class="signature-fields-preview">
                        <h4>Signature Fields</h4>
                        <div id="fieldsContainer" class="fields-container">
                            ${document.signatureFields.map(field => `
                                <div class="field-item" data-field-id="${field.id}">
                                    <div class="field-label">${field.label}</div>
                                    <div class="field-box">
                                        <i class="fas fa-pen"></i> Click to add ${field.type}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        previewContent.innerHTML = html;
        
        // Add interaction hint
        const hint = document.createElement('div');
        hint.className = 'preview-hint';
        hint.innerHTML = '<i class="fas fa-info-circle"></i> This is a preview. Click fields to see how signing works.';
        previewContent.insertBefore(hint, previewContent.firstChild);
        
    } catch (error) {
        console.error('Error loading preview:', error);
        document.getElementById('previewContent').innerHTML = '<p style="color: red;">Error loading preview</p>';
    }
}

/**
 * Close preview modal
 */
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

/**
 * Close preview and proceed to actual signing
 */
function closePreviewAndProceed() {
    closePreview();
    proceedToEditor();
}

/**
 * Helper: Convert file to base64
 */
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('previewModal');
    if (e.target === modal) {
        closePreview();
    }
});


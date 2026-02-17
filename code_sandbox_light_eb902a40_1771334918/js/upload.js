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
    if (!selectedFile) {
        alert('Please upload a document first.');
        return;
    }

    // Get form values
    const docTitle = document.getElementById('docTitle').value.trim();
    if (!docTitle) {
        alert('Please enter a document title.');
        document.getElementById('docTitle').focus();
        return;
    }

    const docDescription = document.getElementById('docDescription').value.trim();
    const action = document.querySelector('input[name="action"]:checked').value;

    // Create document object
    const document = {
        name: docTitle,
        description: docDescription,
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileType: selectedFile.type,
        pages: Math.floor(Math.random() * 10) + 1, // Simulate page count
        status: 'draft',
        type: action === 'sign' ? 'self' : 'sent'
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

        document.recipients = recipients;
        document.signingOrder = document.getElementById('signingOrder').value;
        document.emailMessage = document.getElementById('emailMessage').value.trim();
    }

    // Save document to storage
    const savedDoc = StorageManager.addDocument(document);
    
    // Redirect based on action
    if (action === 'sign') {
        // Go directly to editor to add signature fields
        window.location.href = `editor.html?id=${savedDoc.id}&mode=self`;
    } else {
        // Go to editor to add signature fields for recipients
        window.location.href = `editor.html?id=${savedDoc.id}&mode=send`;
    }
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

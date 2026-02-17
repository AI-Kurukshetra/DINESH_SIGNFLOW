// Sign page functionality
let currentDocument = null;
let documentFields = [];
let currentPage = 1;
let totalPages = 1;
let zoomLevel = 100;
let currentFieldId = null;
let currentRecipientEmail = null;

// Signature variables
let canvas, ctx;
let isDrawing = false;
let signatureData = null;
let selectedFont = 'cursive';

// Initialize sign page
document.addEventListener('DOMContentLoaded', function() {
    initSignPage();
});

function initSignPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    const recipientEmail = urlParams.get('recipient');
    if (recipientEmail) {
        currentRecipientEmail = decodeURIComponent(recipientEmail);
    }

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

    loadDocumentInfo();
    loadDocumentFields();
    renderDocument();
    initSignatureCanvas();
}

function loadDocumentInfo() {
    document.getElementById('documentTitle').textContent = currentDocument.name;
    document.getElementById('senderName').textContent = currentDocument.sender || 'You';
    document.getElementById('pageCount').textContent = currentDocument.pages || 1;
    document.getElementById('docDate').textContent = StorageManager.formatDate(currentDocument.createdAt);
    totalPages = currentDocument.pages || 1;
    updatePageIndicator();
}

function loadDocumentFields() {
    documentFields = currentDocument.fields || [];
    renderFieldsChecklist();
    updateProgress();
}

function renderFieldsChecklist() {
    const fieldsList = document.getElementById('fieldsList');
    if (!fieldsList) return;

    fieldsList.innerHTML = '';
    documentFields.forEach((field, index) => {
        const item = document.createElement('div');
        item.className = 'field-checklist-item';
        if (field.value) item.classList.add('completed');
        
        const icon = field.value ? 'fa-check-circle' : 'fa-circle';
        item.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${field.label}</span>
        `;
        item.onclick = () => scrollToField(field.id);
        fieldsList.appendChild(item);
    });
}

function scrollToField(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fieldElement.click();
    }
}

function renderDocument() {
    const viewerWrapper = document.getElementById('viewerWrapper');
    if (!viewerWrapper) return;

    viewerWrapper.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const page = document.createElement('div');
        page.className = 'viewer-page';
        page.id = `viewer-page${i}`;

        const overlay = document.createElement('div');
        overlay.className = 'viewer-overlay';
        overlay.setAttribute('data-page', i);

        page.appendChild(overlay);
        viewerWrapper.appendChild(page);

        // Render fields for this page
        const pageFields = documentFields.filter(f => f.page == i);
        pageFields.forEach(field => renderField(field, overlay));
    }
}

function renderField(field, container) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'interactive-field';
    fieldElement.id = field.id;
    if (field.value) fieldElement.classList.add('filled');

    fieldElement.style.left = field.x + 'px';
    fieldElement.style.top = field.y + 'px';
    fieldElement.style.width = field.width + 'px';
    fieldElement.style.height = field.height + 'px';

    const icon = getFieldIcon(field.type);
    const content = field.value ? 
        `<span class="field-value">${field.value}</span>` :
        `<i class="${icon}"></i><span class="field-placeholder">Click to ${getFieldAction(field.type)}</span>`;

    fieldElement.innerHTML = content;
    fieldElement.onclick = () => handleFieldClick(field);

    container.appendChild(fieldElement);
}

function getFieldIcon(type) {
    const icons = {
        signature: 'fas fa-pen-fancy',
        initials: 'fas fa-font',
        date: 'fas fa-calendar',
        text: 'fas fa-align-left',
        name: 'fas fa-user',
        email: 'fas fa-envelope',
        checkbox: 'fas fa-check-square',
        radio: 'fas fa-dot-circle'
    };
    return icons[type] || 'fas fa-square';
}

function getFieldAction(type) {
    const actions = {
        signature: 'sign',
        initials: 'add initials',
        date: 'add date',
        text: 'add text',
        name: 'add name',
        email: 'add email',
        checkbox: 'check',
        radio: 'select'
    };
    return actions[type] || 'fill';
}

function handleFieldClick(field) {
    currentFieldId = field.id;

    if (field.type === 'signature' || field.type === 'initials') {
        openSignatureModal(field.type);
    } else if (field.type === 'date') {
        fillDateField(field);
    } else if (field.type === 'checkbox' || field.type === 'radio') {
        toggleCheckField(field);
    } else {
        openTextModal(field);
    }
}

// Signature Modal Functions
function initSignatureCanvas() {
    canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function handleTouchStart(e) {
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function handleTouchMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updatePenColor() {
    const colorSelect = document.getElementById('penColor');
    if (colorSelect && ctx) {
        const color = colorSelect.value;
        ctx.strokeStyle = color;
        console.log('Pen color updated to:', color);
    }
}

function updatePenSize() {
    const sizeInput = document.getElementById('penSize');
    if (sizeInput && ctx) {
        const size = sizeInput.value;
        ctx.lineWidth = size;
        console.log('Pen size updated to:', size);
    }
}

function openSignatureModal(type) {
    console.log('Opening signature modal for type:', type);
    const modal = document.getElementById('signatureModal');
    if (modal) {
        modal.classList.add('active');
        console.log('Modal shown, clearing canvas...');
        // Give a moment for DOM to render before clearing
        setTimeout(() => {
            clearCanvas();
            // Reset form fields
            document.getElementById('signatureText').value = '';
            signatureData = null;
        }, 100);
    } else {
        console.error('Signature modal not found');
    }
}

function closeSignatureModal() {
    const modal = document.getElementById('signatureModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function switchSignatureTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.signature-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateTypedSignature() {
    const text = document.getElementById('signatureText').value;
    document.querySelectorAll('[id^="preview-"]').forEach(preview => {
        preview.textContent = text || 'Your Signature';
    });
}

function selectFont(fontName) {
    selectedFont = fontName;
    document.querySelectorAll('.font-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`.font-option[data-font="${fontName}"]`).classList.add('active');
}

function handleSignatureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('uploadedImage').src = e.target.result;
        document.getElementById('uploadPreview').style.display = 'block';
        signatureData = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveSignature() {
    // Validate that a field was selected
    if (!currentFieldId) {
        alert('Please click on a field first to add a signature');
        return;
    }

    const activeTabElement = document.querySelector('.signature-tab-content.active');
    if (!activeTabElement) {
        alert('Error: No tab selected');
        return;
    }

    const activeTab = activeTabElement.id;
    
    if (activeTab === 'draw-tab') {
        if (isCanvasEmpty()) {
            alert('Please draw your signature first');
            return;
        }
        signatureData = canvas.toDataURL();
    } else if (activeTab === 'type-tab') {
        const text = document.getElementById('signatureText').value;
        if (!text) {
            alert('Please type your signature');
            return;
        }
        signatureData = `TYPED:${selectedFont}:${text}`;
    } else if (activeTab === 'upload-tab') {
        if (!signatureData) {
            alert('Please upload a signature image');
            return;
        }
    }

    // Verify signature data was captured
    if (!signatureData) {
        alert('Error: Could not capture signature. Please try again.');
        return;
    }

    console.log('Saving signature for field:', currentFieldId);
    fillFieldWithSignature(currentFieldId, signatureData);
    closeSignatureModal();
}

function isCanvasEmpty() {
    const pixelBuffer = new Uint32Array(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
}

function fillFieldWithSignature(fieldId, signature) {
    const field = documentFields.find(f => f.id === fieldId);
    if (!field) {
        console.error('Field not found:', fieldId);
        return;
    }

    console.log('Filling field', fieldId, 'with signature');
    
    field.value = signature;
    field.completed = true;

    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        fieldElement.classList.add('filled');
        // Show a visual indication that signature was added
        fieldElement.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
            <span class="field-value">✓ Signed</span>
        `;
    }

    console.log('Field updated successfully');
    updateProgress();
    renderFieldsChecklist();
}

// Text Modal Functions
function openTextModal(field) {
    const modal = document.getElementById('textInputModal');
    const title = document.getElementById('textModalTitle');
    const label = document.getElementById('textInputLabel');
    const input = document.getElementById('textInputField');

    if (title) title.textContent = field.label;
    if (label) label.textContent = `Enter ${field.label.toLowerCase()}:`;
    if (input) {
        input.value = field.value || '';
        input.focus();
    }

    if (modal) modal.classList.add('active');
}

function closeTextModal() {
    const modal = document.getElementById('textInputModal');
    if (modal) modal.classList.remove('active');
}

function saveTextInput() {
    const input = document.getElementById('textInputField');
    const value = input.value.trim();

    if (!value) {
        alert('Please enter a value');
        return;
    }

    const field = documentFields.find(f => f.id === currentFieldId);
    if (!field) return;

    field.value = value;
    field.completed = true;

    const fieldElement = document.getElementById(currentFieldId);
    if (fieldElement) {
        fieldElement.classList.add('filled');
        fieldElement.innerHTML = `<span class="field-value">${value}</span>`;
    }

    updateProgress();
    renderFieldsChecklist();
    closeTextModal();
}

// Date Field
function fillDateField(field) {
    const today = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

    field.value = today;
    field.completed = true;

    const fieldElement = document.getElementById(field.id);
    if (fieldElement) {
        fieldElement.classList.add('filled');
        fieldElement.innerHTML = `<i class="fas fa-calendar-check"></i><span class="field-value">${today}</span>`;
    }

    updateProgress();
    renderFieldsChecklist();
}

// Checkbox/Radio
function toggleCheckField(field) {
    field.value = !field.value;
    field.completed = true;

    const fieldElement = document.getElementById(field.id);
    if (fieldElement) {
        if (field.value) {
            fieldElement.classList.add('filled');
            fieldElement.innerHTML = '<i class="fas fa-check-circle"></i><span class="field-value">Checked</span>';
        } else {
            fieldElement.classList.remove('filled');
            fieldElement.innerHTML = `<i class="${getFieldIcon(field.type)}"></i><span class="field-placeholder">Click to check</span>`;
        }
    }

    updateProgress();
    renderFieldsChecklist();
}

// Progress
function updateProgress() {
    const completedFields = documentFields.filter(f => f.completed).length;
    const totalFields = documentFields.length;
    const progress = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');

    if (progressFill) progressFill.style.width = progress + '%';
    if (progressPercent) progressPercent.textContent = progress + '%';
}

// Navigation
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

// Zoom
function zoomIn() {
    zoomLevel = Math.min(200, zoomLevel + 10);
    updateZoom();
}

function zoomOut() {
    zoomLevel = Math.max(50, zoomLevel - 10);
    updateZoom();
}

function updateZoom() {
    const wrapper = document.getElementById('viewerWrapper');
    const zoomLevelElement = document.getElementById('zoomLevel');
    
    if (wrapper) wrapper.style.transform = `scale(${zoomLevel / 100})`;
    if (zoomLevelElement) zoomLevelElement.textContent = zoomLevel + '%';
}

// Actions
function saveDraft() {
    StorageManager.updateDocument(currentDocument.id, {
        fields: documentFields,
        status: 'draft'
    });
    alert('Draft saved successfully!');
}

function completeSignature() {
    const incompleteFields = documentFields.filter(f => !f.completed);
    
    if (incompleteFields.length > 0) {
        alert(`Please complete all required fields. ${incompleteFields.length} field(s) remaining.`);
        return;
    }

    StorageManager.updateDocument(currentDocument.id, {
        fields: documentFields,
        status: 'signed',
        signedDate: new Date().toISOString()
    });

    // If the signer was identified via recipient param, update their recipient status
    if (currentRecipientEmail && currentDocument.recipients) {
        const rec = currentDocument.recipients.find(r => r.email.toLowerCase() === currentRecipientEmail.toLowerCase());
        if (rec) {
            rec.status = 'signed';
            StorageManager.updateDocument(currentDocument.id, { recipients: currentDocument.recipients });
        }
    }

    // Add a notification for signature completion
    StorageManager.addNotification({
        type: 'signature_completed',
        documentId: currentDocument.id,
        documentName: currentDocument.name,
        by: currentRecipientEmail || (UserManager.getCurrentUser() && UserManager.getCurrentUser().email) || 'unknown',
        status: 'completed'
    });

    alert('Document signed successfully!');
    window.location.href = 'dashboard.html';
}

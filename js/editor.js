// Editor functionality
let currentDocument = null;
let editorMode = 'self'; // 'self' or 'send'
let selectedField = null;
let fields = [];
let fieldIdCounter = 0;
let zoomLevel = 100;
let draggedFieldType = null;
let activeRecipient = null;

// Initialize editor
document.addEventListener('DOMContentLoaded', function() {
    initEditor();
});

function initEditor() {
    // Get document ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    const mode = urlParams.get('mode');

    if (!docId) {
        alert('No document specified');
        window.location.href = 'dashboard.html';
        return;
    }

    // Load document
    currentDocument = StorageManager.getDocumentById(docId);
    if (!currentDocument) {
        alert('Document not found');
        window.location.href = 'dashboard.html';
        return;
    }

    // Set editor mode
    editorMode = mode || 'self';

    // Initialize UI
    loadDocumentInfo();
    setupDragAndDrop();
    setupRecipients();
    
    // Hide help tooltip after 5 seconds
    setTimeout(() => {
        const tooltip = document.querySelector('.help-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }, 5000);
}

function loadDocumentInfo() {
    const titleElement = document.getElementById('documentTitle');
    if (titleElement) {
        titleElement.textContent = currentDocument.name;
    }

    // Create additional pages if needed
    const canvasWrapper = document.getElementById('canvasWrapper');
    if (canvasWrapper && currentDocument.pages > 1) {
        for (let i = 2; i <= currentDocument.pages; i++) {
            const page = document.createElement('div');
            page.className = 'document-page';
            page.id = `page${i}`;
            page.innerHTML = `
                <div class="page-overlay" data-page="${i}"></div>
                <div class="page-number">Page ${i}</div>
            `;
            canvasWrapper.appendChild(page);
        }
    }
}

function setupRecipients() {
    if (editorMode === 'send' && currentDocument.recipients) {
        const recipientsPanel = document.getElementById('recipientsPanel');
        const recipientButtons = document.getElementById('recipientButtons');
        
        if (recipientsPanel) recipientsPanel.style.display = 'block';
        
        if (recipientButtons) {
            recipientButtons.innerHTML = '';
            currentDocument.recipients.forEach((recipient, index) => {
                const btn = document.createElement('button');
                btn.className = 'recipient-btn';
                btn.textContent = recipient.name;
                btn.onclick = () => selectRecipient(index);
                if (index === 0) {
                    btn.classList.add('active');
                    activeRecipient = index;
                }
                recipientButtons.appendChild(btn);
            });
        }

        // Update properties panel
        const recipientGroup = document.getElementById('recipientGroup');
        const fieldRecipient = document.getElementById('fieldRecipient');
        if (recipientGroup) recipientGroup.style.display = 'block';
        if (fieldRecipient) {
            fieldRecipient.innerHTML = currentDocument.recipients.map((r, i) => 
                `<option value="${i}">${r.name}</option>`
            ).join('');
        }
    }
}

function selectRecipient(index) {
    activeRecipient = index;
    const buttons = document.querySelectorAll('.recipient-btn');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function setupDragAndDrop() {
    // Setup field items dragging
    const fieldItems = document.querySelectorAll('.field-item');
    fieldItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Setup page overlays as drop zones
    const pageOverlays = document.querySelectorAll('.page-overlay');
    pageOverlays.forEach(overlay => {
        overlay.addEventListener('dragover', handleDragOver);
        overlay.addEventListener('dragleave', handleDragLeave);
        overlay.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedFieldType = this.getAttribute('data-field-type');
    this.style.opacity = '0.5';
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('dragover');
}

function handleDragLeave(e) {
    this.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('dragover');

    if (!draggedFieldType) return;

    // Get drop position relative to page
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create field
    createField(draggedFieldType, x, y, this);
    draggedFieldType = null;
}

function createField(type, x, y, container) {
    const field = {
        id: `field-${++fieldIdCounter}`,
        type: type,
        x: x,
        y: y,
        width: 180,
        height: 50,
        label: getFieldLabel(type),
        required: false,
        recipient: editorMode === 'send' ? activeRecipient : null,
        page: container.getAttribute('data-page')
    };

    fields.push(field);
    renderField(field, container);
}

function getFieldLabel(type) {
    const labels = {
        signature: 'Signature',
        initials: 'Initials',
        date: 'Date',
        text: 'Text',
        name: 'Full Name',
        email: 'Email',
        checkbox: 'Checkbox',
        radio: 'Radio Button'
    };
    return labels[type] || type;
}

function renderField(field, container) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'dropped-field';
    fieldElement.id = field.id;
    fieldElement.style.left = field.x + 'px';
    fieldElement.style.top = field.y + 'px';
    fieldElement.style.width = field.width + 'px';
    fieldElement.style.height = field.height + 'px';

    const icon = getFieldIcon(field.type);
    const requiredMark = field.required ? ' <span class="field-required">*</span>' : '';

    fieldElement.innerHTML = `
        <i class="${icon}"></i>
        <span class="field-label">${field.label}${requiredMark}</span>
        <button class="field-delete-btn" onclick="deleteFieldElement('${field.id}', event)">
            <i class="fas fa-times"></i>
        </button>
        <div class="field-resize-handle"></div>
    `;

    fieldElement.addEventListener('click', () => selectField(field.id));
    makeFieldDraggable(fieldElement, field);
    makeFieldResizable(fieldElement, field);

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

function makeFieldDraggable(element, field) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('field-resize-handle')) return;
        if (e.target.classList.contains('field-delete-btn') || e.target.closest('.field-delete-btn')) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = field.x;
        initialY = field.y;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        field.x = initialX + dx;
        field.y = initialY + dy;
        
        element.style.left = field.x + 'px';
        element.style.top = field.y + 'px';
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function makeFieldResizable(element, field) {
    const handle = element.querySelector('.field-resize-handle');
    if (!handle) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = field.width;
        startHeight = field.height;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        field.width = Math.max(100, startWidth + dx);
        field.height = Math.max(30, startHeight + dy);

        element.style.width = field.width + 'px';
        element.style.height = field.height + 'px';
    }

    function onMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function selectField(fieldId) {
    // Deselect all fields
    document.querySelectorAll('.dropped-field').forEach(f => f.classList.remove('selected'));

    // Select field
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
        fieldElement.classList.add('selected');
        selectedField = fields.find(f => f.id === fieldId);
        showPropertiesPanel();
    }
}

function showPropertiesPanel() {
    if (!selectedField) return;

    const panel = document.getElementById('propertiesPanel');
    const container = document.querySelector('.editor-container');
    
    if (panel) {
        panel.style.display = 'block';
        container.classList.add('properties-open');

        // Fill in field properties
        document.getElementById('fieldType').value = selectedField.type;
        document.getElementById('fieldLabel').value = selectedField.label;
        document.getElementById('fieldRequired').checked = selectedField.required;

        if (editorMode === 'send' && selectedField.recipient !== null) {
            document.getElementById('fieldRecipient').value = selectedField.recipient;
        }
    }
}

function closePropertiesPanel() {
    const panel = document.getElementById('propertiesPanel');
    const container = document.querySelector('.editor-container');
    
    if (panel) {
        panel.style.display = 'none';
        container.classList.remove('properties-open');
    }

    // Deselect field
    document.querySelectorAll('.dropped-field').forEach(f => f.classList.remove('selected'));
    selectedField = null;
}

function saveFieldProperties() {
    if (!selectedField) return;

    selectedField.label = document.getElementById('fieldLabel').value;
    selectedField.required = document.getElementById('fieldRequired').checked;

    if (editorMode === 'send') {
        selectedField.recipient = parseInt(document.getElementById('fieldRecipient').value);
    }

    // Update field element
    const fieldElement = document.getElementById(selectedField.id);
    if (fieldElement) {
        const labelSpan = fieldElement.querySelector('.field-label');
        const requiredMark = selectedField.required ? ' <span class="field-required">*</span>' : '';
        labelSpan.innerHTML = selectedField.label + requiredMark;
    }

    closePropertiesPanel();
}

function deleteFieldElement(fieldId, event) {
    event.stopPropagation();
    if (confirm('Delete this field?')) {
        deleteField();
    }
}

function deleteField() {
    if (!selectedField) return;

    const fieldElement = document.getElementById(selectedField.id);
    if (fieldElement) {
        fieldElement.remove();
    }

    fields = fields.filter(f => f.id !== selectedField.id);
    closePropertiesPanel();
}

// Zoom controls
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
    const wrapper = document.getElementById('canvasWrapper');
    const zoomLevelElement = document.getElementById('zoomLevel');
    
    if (wrapper) {
        wrapper.style.transform = `scale(${zoomLevel / 100})`;
    }
    
    if (zoomLevelElement) {
        zoomLevelElement.textContent = zoomLevel + '%';
    }
}

// Actions
function cancelEdit() {
    if (fields.length > 0) {
        if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return;
        }
    }
    window.location.href = 'dashboard.html';
}

function saveAndContinue() {
    if (fields.length === 0) {
        alert('Please add at least one field to the document.');
        return;
    }

    // Save fields to document
    currentDocument.fields = fields;
    StorageManager.updateDocument(currentDocument.id, {
        fields: fields,
        status: editorMode === 'self' ? 'ready-to-sign' : 'ready-to-send'
    });

    // Redirect based on mode
    if (editorMode === 'self') {
        // Go to sign page
        window.location.href = `sign.html?id=${currentDocument.id}`;
    } else {
        // Go to send confirmation page
        window.location.href = `send.html?id=${currentDocument.id}`;
    }
}

// Storage Manager for SignFlow Application
const StorageManager = {
    // Keys for localStorage
    keys: {
        documents: 'signflow_documents',
        signatures: 'signflow_signatures',
        sendRequests: 'signflow_send_requests',
        notifications: 'signflow_notifications',
        settings: 'signflow_settings',
        initialized: 'signflow_initialized'
    },

    // Initialize storage
    init() {
        if (!localStorage.getItem(this.keys.initialized)) {
            const initialData = {
                documents: [],
                signatures: [],
                settings: {
                    email: 'user@example.com',
                    name: 'Demo User',
                    notifications: true,
                    theme: 'light'
                }
            };
            
            this.setDocuments(initialData.documents);
            this.setSignatures(initialData.signatures);
            this.setSettings(initialData.settings);
            localStorage.setItem(this.keys.initialized, 'true');
        }
    },

    // Document Methods
    getDocuments() {
        const data = localStorage.getItem(this.keys.documents);
        return data ? JSON.parse(data) : [];
    },

    setDocuments(documents) {
        localStorage.setItem(this.keys.documents, JSON.stringify(documents));
    },

    addDocument(document) {
        const documents = this.getDocuments();
        document.id = this.generateId();
        document.createdAt = new Date().toISOString();
        document.updatedAt = new Date().toISOString();
        documents.push(document);
        this.setDocuments(documents);
        return document;
    },

    getDocumentById(id) {
        const documents = this.getDocuments();
        return documents.find(doc => doc.id === id);
    },

    updateDocument(id, updates) {
        const documents = this.getDocuments();
        const index = documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
            documents[index] = {
                ...documents[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.setDocuments(documents);
            return documents[index];
        }
        return null;
    },

    deleteDocument(id) {
        const documents = this.getDocuments();
        const filtered = documents.filter(doc => doc.id !== id);
        this.setDocuments(filtered);
    },

    // Filter documents by status
    getDocumentsByStatus(status) {
        const documents = this.getDocuments();
        return documents.filter(doc => doc.status === status);
    },

    // Get inbox documents (documents sent to user)
    getInboxDocuments() {
        const documents = this.getDocuments();
        return documents.filter(doc => 
            doc.type === 'received' && 
            (doc.status === 'pending' || doc.status === 'viewed')
        );
    },

    // Get sent documents (documents sent by user)
    getSentDocuments() {
        const documents = this.getDocuments();
        return documents.filter(doc => doc.type === 'sent');
    },

    // Get completed documents
    getCompletedDocuments() {
        const documents = this.getDocuments();
        return documents.filter(doc => 
            doc.status === 'completed' || doc.status === 'signed'
        );
    },

    // Signature Methods
    getSignatures() {
        const data = localStorage.getItem(this.keys.signatures);
        return data ? JSON.parse(data) : [];
    },

    setSignatures(signatures) {
        localStorage.setItem(this.keys.signatures, JSON.stringify(signatures));
    },

    addSignature(signature) {
        const signatures = this.getSignatures();
        signature.id = this.generateId();
        signature.createdAt = new Date().toISOString();
        signatures.push(signature);
        this.setSignatures(signatures);
        return signature;
    },

    getSignatureById(id) {
        const signatures = this.getSignatures();
        return signatures.find(sig => sig.id === id);
    },

    deleteSignature(id) {
        const signatures = this.getSignatures();
        const filtered = signatures.filter(sig => sig.id !== id);
        this.setSignatures(filtered);
    },

    // Settings Methods
    getSettings() {
        const data = localStorage.getItem(this.keys.settings);
        return data ? JSON.parse(data) : {
            email: 'user@example.com',
            name: 'Demo User',
            notifications: true,
            theme: 'light'
        };
    },

    setSettings(settings) {
        localStorage.setItem(this.keys.settings, JSON.stringify(settings));
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        const updated = { ...settings, ...updates };
        this.setSettings(updated);
        return updated;
    },

    // Utility Methods
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    },

    // Search documents
    searchDocuments(query) {
        const documents = this.getDocuments();
        const lowerQuery = query.toLowerCase();
        return documents.filter(doc => 
            doc.name.toLowerCase().includes(lowerQuery) ||
            (doc.description && doc.description.toLowerCase().includes(lowerQuery)) ||
            (doc.sender && doc.sender.toLowerCase().includes(lowerQuery)) ||
            (doc.recipients && doc.recipients.some(r => 
                r.name.toLowerCase().includes(lowerQuery) || 
                r.email.toLowerCase().includes(lowerQuery)
            ))
        );
    },

    // Send requests / notifications
    getSendRequests() {
        const data = localStorage.getItem(this.keys.sendRequests);
        return data ? JSON.parse(data) : [];
    },

    setSendRequests(requests) {
        localStorage.setItem(this.keys.sendRequests, JSON.stringify(requests));
    },

    addSendRequest(request) {
        const requests = this.getSendRequests();
        request.id = this.generateId();
        request.createdAt = new Date().toISOString();
        requests.push(request);
        this.setSendRequests(requests);
        return request;
    },

    getNotifications() {
        const data = localStorage.getItem(this.keys.notifications);
        return data ? JSON.parse(data) : [];
    },

    setNotifications(notifications) {
        localStorage.setItem(this.keys.notifications, JSON.stringify(notifications));
    },

    addNotification(notification) {
        const notifs = this.getNotifications();
        notification.id = this.generateId();
        notification.createdAt = new Date().toISOString();
        notifs.push(notification);
        this.setNotifications(notifs);
        return notification;
    },

    // Add sample data for demo
    addSampleData() {
        const sampleDocuments = [
            {
                name: 'Service Agreement - Acme Corp',
                type: 'received',
                status: 'pending',
                sender: 'john.doe@acmecorp.com',
                recipients: [{ 
                    name: 'Demo User', 
                    email: 'user@example.com', 
                    status: 'pending' 
                }],
                fileSize: '245 KB',
                pages: 5,
                description: 'Annual service contract renewal',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                name: 'NDA - Client Project',
                type: 'sent',
                status: 'viewed',
                sender: 'user@example.com',
                recipients: [
                    { name: 'Alice Johnson', email: 'alice@example.com', status: 'viewed' },
                    { name: 'Bob Smith', email: 'bob@example.com', status: 'pending' }
                ],
                fileSize: '180 KB',
                pages: 3,
                description: 'Non-disclosure agreement for new project',
                progress: 50
            },
            {
                name: 'Employment Contract',
                type: 'completed',
                status: 'completed',
                sender: 'hr@company.com',
                recipients: [{ 
                    name: 'Demo User', 
                    email: 'user@example.com', 
                    status: 'signed' 
                }],
                fileSize: '320 KB',
                pages: 8,
                description: 'Full-time employment agreement',
                completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                progress: 100
            },
            {
                name: 'Freelance Invoice #1234',
                type: 'sent',
                status: 'signed',
                sender: 'user@example.com',
                recipients: [{ 
                    name: 'Tech Startup Inc', 
                    email: 'billing@techstartup.com', 
                    status: 'signed' 
                }],
                fileSize: '125 KB',
                pages: 2,
                description: 'November 2024 services rendered',
                progress: 100
            }
        ];

        // Add sample documents
        sampleDocuments.forEach(doc => this.addDocument(doc));
    },

    // Clear all data (for testing)
    clearAll() {
        localStorage.removeItem(this.keys.documents);
        localStorage.removeItem(this.keys.signatures);
        localStorage.removeItem(this.keys.settings);
        localStorage.removeItem(this.keys.initialized);
    },

    // Get documents by user
    getDocumentsByUser(userId) {
        const documents = this.getDocuments();
        return documents.filter(doc => doc.userId === userId || doc.sender === userId);
    },

    // Get signatures by user
    getSignaturesByUser(userId) {
        const signatures = this.getSignatures();
        return signatures.filter(sig => sig.userId === userId);
    },

    // Get activities by user
    getActivitiesByUser(userId) {
        // Activities would be stored separately or derived from document/signature history
        const docs = this.getDocumentsByUser(userId);
        const activities = [];
        docs.forEach(doc => {
            activities.push({
                type: 'document_activity',
                action: doc.type === 'sent' ? 'sent' : 'received',
                document: doc.name,
                timestamp: doc.createdAt,
                status: doc.status
            });
        });
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

};

// Initialize storage on load
StorageManager.init();

// Add sample data if no documents exist
if (StorageManager.getDocuments().length === 0) {
    StorageManager.addSampleData();
}

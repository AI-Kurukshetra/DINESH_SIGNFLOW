# SignFlow - Electronic Signature Platform

A comprehensive web-based electronic signature (eSignature) platform similar to DocuSign, built with HTML, CSS, and JavaScript. SignFlow enables users to upload, sign, send, and manage documents electronically with a modern, intuitive interface.

![SignFlow](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Live Demo

Access the application by opening `index.html` in your web browser.

## ✨ Features

### Core Functionality

#### 1. **Document Management**
- Upload documents in various formats (PDF, DOC, DOCX)
- Drag-and-drop file upload support
- Document preview and viewer
- Document library with search and filter
- Document status tracking (Pending, Viewed, Signed, Completed)

#### 2. **Electronic Signatures**
- **Draw Signature**: Sign with mouse or touch
- **Type Signature**: Type your name with multiple font styles
- **Upload Signature**: Upload signature image
- Reusable signature library
- Support for initials and full signatures

#### 3. **Document Editor**
- Drag-and-drop signature field placement
- Multiple field types:
  - Signature fields
  - Initial fields
  - Date fields
  - Text fields
  - Name and email fields
  - Checkboxes and radio buttons
- Resizable and movable fields
- Field properties customization
- Real-time field preview

#### 4. **Multi-Signer Support**
- Send documents to multiple recipients
- Assign specific fields to each signer
- Sequential or parallel signing workflows
- Track recipient status in real-time
- Custom email messages to recipients

#### 5. **User Dashboard**
- **Inbox**: Documents awaiting your signature
- **Sent**: Documents you've sent to others
- **Completed**: Fully signed documents
- **Templates**: Reusable document templates
- Document search functionality
- Status indicators and progress tracking

#### 6. **Document Tracking**
- Real-time document status updates
- Activity log and audit trail
- View timestamps for all actions
- Recipient status monitoring
- Email notifications (simulated)

#### 7. **Settings & Profile**
- User profile management
- Signature library management
- Notification preferences
- Security settings
- Data export and storage management

### Additional Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with blue and white color scheme
- **Local Storage**: All data persists in browser local storage
- **Sample Data**: Pre-loaded sample documents for demo purposes
- **Progress Tracking**: Visual progress indicators for document completion
- **Field Validation**: Required field enforcement
- **Zoom Controls**: Zoom in/out on documents for better viewing

## 📁 Project Structure

```
signflow/
├── index.html              # Landing page with features showcase
├── dashboard.html          # User dashboard with document management
├── upload.html            # Document upload page
├── editor.html            # Document editor with field placement
├── sign.html              # Signature page with signature pad
├── viewer.html            # Document viewer with activity tracking
├── send.html              # Send confirmation page
├── settings.html          # Settings and profile management
│
├── css/
│   ├── style.css          # Global styles and components
│   ├── dashboard.css      # Dashboard-specific styles
│   ├── upload.css         # Upload page styles
│   ├── editor.css         # Editor page styles
│   ├── sign.css           # Signature page styles
│   ├── viewer.css         # Viewer page styles
│   ├── send.css           # Send page styles
│   └── settings.css       # Settings page styles
│
└── js/
    ├── main.js            # Global JavaScript utilities
    ├── storage.js         # Local storage management
    ├── dashboard.js       # Dashboard functionality
    ├── upload.js          # Upload functionality
    ├── editor.js          # Editor with drag-and-drop
    ├── sign.js            # Signature pad and signing
    ├── viewer.js          # Document viewing
    ├── send.js            # Send workflow
    └── settings.js        # Settings management
```

## 🎯 Functional Entry Points

### Main Pages

1. **Landing Page** (`index.html`)
   - URL: `/index.html`
   - Features overview and getting started

2. **Dashboard** (`dashboard.html`)
   - URL: `/dashboard.html`
   - Tabs: `#inbox`, `#sent`, `#completed`, `#templates`
   - Main hub for document management

3. **Upload Document** (`upload.html`)
   - URL: `/upload.html`
   - Upload and configure new documents

4. **Document Editor** (`editor.html`)
   - URL: `/editor.html?id={docId}&mode={self|send}`
   - Add signature fields with drag-and-drop

5. **Sign Document** (`sign.html`)
   - URL: `/sign.html?id={docId}`
   - Complete signature fields

6. **View Document** (`viewer.html`)
   - URL: `/viewer.html?id={docId}`
   - View document details and activity

7. **Send Confirmation** (`send.html`)
   - URL: `/send.html?id={docId}`
   - Review and send to recipients

8. **Settings** (`settings.html`)
   - URL: `/settings.html`
   - Tabs: `#profile`, `#signatures`, `#notifications`, `#security`, `#data`

## 💾 Data Storage

All data is stored in browser localStorage with the following structure:

### Storage Keys
- `signflow_documents`: Array of document objects
- `signflow_signatures`: Array of saved signatures
- `signflow_settings`: User settings and preferences
- `signflow_initialized`: Initialization flag

### Document Object Schema
```javascript
{
  id: "uuid",
  name: "Document Name",
  description: "Document description",
  type: "sent" | "received" | "self",
  status: "draft" | "pending" | "viewed" | "signed" | "completed",
  sender: "email@example.com",
  recipients: [
    {
      name: "Recipient Name",
      email: "recipient@example.com",
      status: "pending" | "viewed" | "signed"
    }
  ],
  fields: [
    {
      id: "field-id",
      type: "signature" | "initials" | "date" | "text" | "name" | "email" | "checkbox" | "radio",
      x: 100,
      y: 200,
      width: 180,
      height: 50,
      label: "Field Label",
      required: true,
      recipient: 0,
      page: 1,
      value: "field value",
      completed: true
    }
  ],
  fileSize: "245 KB",
  pages: 5,
  createdAt: "ISO date string",
  updatedAt: "ISO date string"
}
```

## 🔧 Setup & Installation

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser
- JavaScript enabled

### Installation Steps

1. **Download/Clone the project**
   ```bash
   # If using git
   git clone [repository-url]
   cd signflow
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local development server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js
     npx http-server
     ```

3. **Access the application**
   - Navigate to `http://localhost:8000` (if using local server)
   - Or directly open the `index.html` file

## 📱 Usage Guide

### Signing Your Own Document

1. Click "Get Started" or "Dashboard" from the landing page
2. Click "Upload Document" or the "+" button
3. Upload your document (drag-and-drop or browse)
4. Fill in document details
5. Select "Sign it myself"
6. Click "Continue"
7. Drag signature and date fields onto the document
8. Click "Save & Continue"
9. Complete all required fields
10. Click "Complete" to finish signing

### Sending Document to Others

1. Upload document as above
2. Select "Send to others for signature"
3. Add recipient email addresses and names
4. Choose signing order (parallel or sequential)
5. Add optional message
6. Click "Continue" to open editor
7. Assign fields to specific recipients
8. Place fields on document
9. Click "Save & Continue"
10. Review details and click "Send Document"

### Managing Documents

- **View Inbox**: See documents waiting for your signature
- **Track Sent**: Monitor documents you've sent
- **Access Completed**: View all signed documents
- **Search**: Use search bar to find specific documents
- **Filter**: Switch between inbox, sent, and completed tabs

## 🎨 Customization

### Styling
All styles use CSS custom properties (variables) defined in `css/style.css`:

```css
:root {
    --primary-color: #0066FF;
    --primary-dark: #0052CC;
    --secondary-color: #F5F7FA;
    --text-dark: #1A1A1A;
    /* ... more variables */
}
```

Modify these variables to change the color scheme.

### Adding New Templates

Edit `dashboard.html` to add more document templates in the templates section.

## 🔒 Security Features

- **Client-side only**: All data stays in your browser
- **No server communication**: Complete privacy
- **Local storage**: Data persists across sessions
- **Audit trail**: Track all document actions
- **Field validation**: Ensure required fields are completed

## 🌐 Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11 (not supported)

## 📊 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage API
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)
- **No frameworks**: Pure vanilla JavaScript
- **No build tools**: Ready to run

## 🚧 Limitations & Future Enhancements

### Current Limitations
- No actual PDF rendering (simulated with placeholder)
- No real email sending (simulated)
- No server-side storage
- No user authentication
- No actual file downloads
- Limited to browser storage capacity

### Planned Enhancements
- Real PDF.js integration for document rendering
- Backend API integration for storage
- User authentication and multi-device sync
- Email notification service integration
- Advanced template builder
- Bulk send functionality
- Custom branding options
- API webhooks
- Mobile native apps

## 🤝 Contributing

This is a demo project. For production use, consider:
- Adding backend API
- Implementing real PDF rendering
- Adding authentication system
- Setting up email service
- Implementing file storage service
- Adding e-signature compliance features

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙋 Support

For issues or questions:
1. Check the code comments in source files
2. Review this README
3. Inspect browser console for errors
4. Check localStorage data structure

## 🎉 Acknowledgments

Inspired by DocuSign and modern electronic signature platforms. Built as a comprehensive demonstration of client-side web application capabilities.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Demo/Production Ready (with backend integration)

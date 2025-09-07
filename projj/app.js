// Civic Issue Reporter Application
class CivicReporter {
    constructor() {
        this.issues = [];
        this.currentUser = null;
        this.map = null;
        this.markers = [];
        this.currentIssueId = 6; // Counter for new issues
        this.currentEditingId = null;
        
        // Initialize with sample data
        this.initializeSampleData();
        
        // Initialize the application
        this.init();
    }
    
    initializeSampleData() {
        this.issues = [
            {
                id: 1,
                title: "Large pothole on Main Street",
                description: "Deep pothole causing vehicle damage near traffic signal",
                category: "pothole",
                status: "submitted",
                priority: "high",
                location: "Main Street & 1st Avenue",
                coordinates: [28.6139, 77.2090],
                reportedBy: "citizen@example.com",
                reportDate: "2025-09-01",
                assignedTo: "Public Works",
                photoUrl: "https://via.placeholder.com/300x200?text=Pothole"
            },
            {
                id: 2,
                title: "Streetlight not working",
                description: "Main road streetlight has been out for 3 days",
                category: "streetlight",
                status: "in_progress",
                priority: "medium",
                location: "Park Avenue",
                coordinates: [28.6129, 77.2080],
                reportedBy: "resident@example.com",
                reportDate: "2025-08-30",
                assignedTo: "Electrical Dept",
                photoUrl: "https://via.placeholder.com/300x200?text=Broken+Light"
            },
            {
                id: 3,
                title: "Overflowing trash bin",
                description: "Garbage bin full and attracting pests",
                category: "sanitation",
                status: "resolved",
                priority: "medium",
                location: "Central Park",
                coordinates: [28.6149, 77.2100],
                reportedBy: "walker@example.com",
                reportDate: "2025-08-29",
                assignedTo: "Sanitation",
                photoUrl: "https://via.placeholder.com/300x200?text=Trash+Bin"
            },
            {
                id: 4,
                title: "Broken sidewalk",
                description: "Cracked sidewalk poses tripping hazard",
                category: "infrastructure",
                status: "submitted",
                priority: "medium",
                location: "Commerce Street",
                coordinates: [28.6119, 77.2070],
                reportedBy: "pedestrian@example.com",
                reportDate: "2025-09-02",
                assignedTo: "Public Works",
                photoUrl: "https://via.placeholder.com/300x200?text=Broken+Sidewalk"
            },
            {
                id: 5,
                title: "Water leakage from main pipe",
                description: "Continuous water leak causing road damage",
                category: "water",
                status: "in_progress",
                priority: "high",
                location: "Industrial Road",
                coordinates: [28.6159, 77.2110],
                reportedBy: "concerned@example.com",
                reportDate: "2025-08-31",
                assignedTo: "Water Dept",
                photoUrl: "https://via.placeholder.com/300x200?text=Water+Leak"
            }
        ];
    }
    
    init() {
        this.setupEventListeners();
        this.updateDashboardStats();
        this.renderIssuesTable();
        this.showNotification('System initialized successfully', 'success');
    }
    
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Issue form submission
        document.getElementById('issueForm').addEventListener('submit', (e) => {
            this.handleIssueSubmission(e);
        });
        
        // Photo preview
        document.getElementById('issuePhoto').addEventListener('change', (e) => {
            this.previewPhoto(e);
        });
        
        // Location detection
        document.getElementById('detectLocationBtn').addEventListener('click', () => {
            this.detectLocation();
        });
        
        // Admin login/logout
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showAdminLogin();
        });
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });
        
        // Map filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterMapMarkers(e.target.dataset.category);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Admin filters and search
        document.getElementById('searchIssues').addEventListener('input', () => {
            this.filterIssuesTable();
        });
        
        document.getElementById('filterStatus').addEventListener('change', () => {
            this.filterIssuesTable();
        });
        
        document.getElementById('filterCategory').addEventListener('change', () => {
            this.filterIssuesTable();
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });
        
        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            this.handleIssueUpdate(e);
        });
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show/hide sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const sectionMap = {
            'report': 'reportSection',
            'map': 'mapSection',
            'admin': 'adminSection'
        };
        
        document.getElementById(sectionMap[tabName]).classList.add('active');
        
        // Initialize map if switching to map view
        if (tabName === 'map' && !this.map) {
            setTimeout(() => this.initializeMap(), 100);
        }
        
        // Check admin access
        if (tabName === 'admin') {
            this.checkAdminAccess();
        }
    }
    
    handleIssueSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const photoFile = document.getElementById('issuePhoto').files[0];
        
        const newIssue = {
            id: this.currentIssueId++,
            title: document.getElementById('issueTitle').value,
            description: document.getElementById('issueDescription').value,
            category: document.getElementById('issueCategory').value,
            priority: document.getElementById('issuePriority').value,
            location: document.getElementById('issueLocation').value,
            coordinates: [28.6139 + (Math.random() - 0.5) * 0.02, 77.2090 + (Math.random() - 0.5) * 0.02],
            reportedBy: document.getElementById('reporterEmail').value,
            reportDate: new Date().toISOString().split('T')[0],
            status: 'submitted',
            assignedTo: this.getDefaultDepartment(document.getElementById('issueCategory').value),
            photoUrl: photoFile ? URL.createObjectURL(photoFile) : 'https://via.placeholder.com/300x200?text=No+Photo'
        };
        
        this.issues.push(newIssue);
        
        // Reset form
        e.target.reset();
        document.getElementById('photoPreview').classList.add('hidden');
        
        // Update views
        this.updateDashboardStats();
        this.renderIssuesTable();
        
        if (this.map) {
            this.updateMapMarkers();
        }
        
        this.showNotification('Issue reported successfully! Thank you for helping improve your community.', 'success');
    }
    
    getDefaultDepartment(category) {
        const departmentMap = {
            'pothole': 'Public Works',
            'streetlight': 'Electrical Dept',
            'sanitation': 'Sanitation',
            'infrastructure': 'Public Works',
            'water': 'Water Dept'
        };
        return departmentMap[category] || 'Public Works';
    }
    
    previewPhoto(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('photoPreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Photo preview">`;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
        }
    }
    
    detectLocation() {
        const locationInput = document.getElementById('issueLocation');
        const btn = document.getElementById('detectLocationBtn');
        
        btn.innerHTML = '<span class="spinner"></span>Detecting...';
        btn.disabled = true;
        
        // Simulate location detection
        setTimeout(() => {
            const locations = [
                'Main Street & 1st Avenue',
                'Park Avenue & Central Road',
                'Commerce Street & Broadway',
                'Industrial Road & Factory Lane',
                'Residential Area, Block A'
            ];
            
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            locationInput.value = randomLocation;
            
            btn.innerHTML = 'Detect Current Location';
            btn.disabled = false;
            
            this.showNotification('Location detected successfully', 'success');
        }, 2000);
    }
    
    initializeMap() {
        this.map = L.map('map').setView([28.6139, 77.2090], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        this.updateMapMarkers();
    }
    
    updateMapMarkers() {
        // Clear existing markers
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
        
        // Add markers for each issue
        this.issues.forEach(issue => {
            const markerColor = this.getMarkerColor(issue.status);
            
            const marker = L.circleMarker(issue.coordinates, {
                radius: 8,
                fillColor: markerColor,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);
            
            const popupContent = `
                <div class="popup-title">${issue.title}</div>
                <div class="popup-category">${issue.category}</div>
                <div class="popup-description">${issue.description}</div>
                <div class="popup-status ${issue.status}">Status: ${issue.status.replace('_', ' ')}</div>
            `;
            
            marker.bindPopup(popupContent);
            marker.issueCategory = issue.category;
            this.markers.push(marker);
        });
    }
    
    getMarkerColor(status) {
        const colorMap = {
            'submitted': '#95a5a6',
            'in_progress': '#f39c12',
            'resolved': '#27ae60'
        };
        return colorMap[status] || '#95a5a6';
    }
    
    filterMapMarkers(category) {
        this.markers.forEach(marker => {
            if (category === 'all' || marker.issueCategory === category) {
                marker.setStyle({ opacity: 1, fillOpacity: 0.8 });
            } else {
                marker.setStyle({ opacity: 0.3, fillOpacity: 0.3 });
            }
        });
    }
    
    showAdminLogin() {
        this.switchTab('admin');
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        // Simple authentication check
        if (email === 'admin@civic.gov' && password === 'admin123') {
            this.currentUser = { email, role: 'admin' };
            this.showAdminDashboard();
            this.showNotification('Admin login successful', 'success');
        } else {
            this.showNotification('Invalid credentials', 'error');
        }
    }
    
    logout() {
        this.currentUser = null;
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('userStatus').classList.add('hidden');
        this.checkAdminAccess();
        this.showNotification('Logged out successfully', 'success');
    }
    
    checkAdminAccess() {
        const adminGuard = document.querySelector('.admin-guard');
        const adminContent = document.querySelector('.admin-content');
        
        if (this.currentUser && this.currentUser.role === 'admin') {
            adminGuard.classList.add('hidden');
            adminContent.classList.remove('hidden');
            document.getElementById('loginBtn').classList.add('hidden');
            document.getElementById('logoutBtn').classList.remove('hidden');
            document.getElementById('userStatus').classList.remove('hidden');
        } else {
            adminGuard.classList.remove('hidden');
            adminContent.classList.add('hidden');
        }
    }
    
    showAdminDashboard() {
        this.checkAdminAccess();
        this.updateDashboardStats();
        this.renderIssuesTable();
    }
    
    updateDashboardStats() {
        const total = this.issues.length;
        const pending = this.issues.filter(i => i.status === 'submitted').length;
        const inProgress = this.issues.filter(i => i.status === 'in_progress').length;
        const resolved = this.issues.filter(i => i.status === 'resolved').length;
        
        document.getElementById('totalIssues').textContent = total;
        document.getElementById('pendingIssues').textContent = pending;
        document.getElementById('inProgressIssues').textContent = inProgress;
        document.getElementById('resolvedIssues').textContent = resolved;
    }
    
    renderIssuesTable() {
        const tbody = document.getElementById('issuesTableBody');
        tbody.innerHTML = '';
        
        let filteredIssues = this.getFilteredIssues();
        
        filteredIssues.forEach(issue => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="issue-id">#${issue.id}</span></td>
                <td><div class="issue-title">${issue.title}</div></td>
                <td><span class="issue-category">${issue.category}</span></td>
                <td><span class="status-badge ${issue.status}">${issue.status.replace('_', ' ')}</span></td>
                <td><span class="priority-badge ${issue.priority}">${issue.priority}</span></td>
                <td><div class="issue-location">${issue.location}</div></td>
                <td>${issue.assignedTo}</td>
                <td><div class="issue-date">${issue.reportDate}</div></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn--view" onclick="app.viewIssue(${issue.id})">View</button>
                        <button class="action-btn action-btn--edit" onclick="app.editIssue(${issue.id})">Edit</button>
                        <button class="action-btn action-btn--delete" onclick="app.deleteIssue(${issue.id})">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    getFilteredIssues() {
        const searchTerm = document.getElementById('searchIssues').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        
        return this.issues.filter(issue => {
            const matchesSearch = issue.title.toLowerCase().includes(searchTerm) ||
                                issue.description.toLowerCase().includes(searchTerm) ||
                                issue.location.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || issue.status === statusFilter;
            const matchesCategory = !categoryFilter || issue.category === categoryFilter;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }
    
    filterIssuesTable() {
        this.renderIssuesTable();
    }
    
    viewIssue(id) {
        const issue = this.issues.find(i => i.id === id);
        if (!issue) return;
        
        const modal = document.getElementById('issueModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="modal-detail-item">
                <div class="modal-detail-label">Title</div>
                <div class="modal-detail-value">${issue.title}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Description</div>
                <div class="modal-detail-value">${issue.description}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Category</div>
                <div class="modal-detail-value">${issue.category}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Status</div>
                <div class="modal-detail-value">
                    <span class="status-badge ${issue.status}">${issue.status.replace('_', ' ')}</span>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Priority</div>
                <div class="modal-detail-value">
                    <span class="priority-badge ${issue.priority}">${issue.priority}</span>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Location</div>
                <div class="modal-detail-value">${issue.location}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Reported By</div>
                <div class="modal-detail-value">${issue.reportedBy}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Report Date</div>
                <div class="modal-detail-value">${issue.reportDate}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Assigned To</div>
                <div class="modal-detail-value">${issue.assignedTo}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Photo</div>
                <div class="modal-detail-value">
                    <img src="${issue.photoUrl}" alt="Issue photo" class="modal-photo">
                </div>
            </div>
        `;
        
        this.showModal(modal);
    }
    
    editIssue(id) {
        const issue = this.issues.find(i => i.id === id);
        if (!issue) return;
        
        this.currentEditingId = id;
        
        // Populate edit form
        document.getElementById('editStatus').value = issue.status;
        document.getElementById('editAssigned').value = issue.assignedTo;
        document.getElementById('editPriority').value = issue.priority;
        
        const modal = document.getElementById('editModal');
        this.showModal(modal);
    }
    
    handleIssueUpdate(e) {
        e.preventDefault();
        
        if (!this.currentEditingId) return;
        
        const issue = this.issues.find(i => i.id === this.currentEditingId);
        if (!issue) return;
        
        // Update issue
        issue.status = document.getElementById('editStatus').value;
        issue.assignedTo = document.getElementById('editAssigned').value;
        issue.priority = document.getElementById('editPriority').value;
        
        // Update views
        this.updateDashboardStats();
        this.renderIssuesTable();
        
        if (this.map) {
            this.updateMapMarkers();
        }
        
        // Close modal
        this.closeModal(document.getElementById('editModal'));
        
        this.showNotification('Issue updated successfully', 'success');
    }
    
    deleteIssue(id) {
        if (confirm('Are you sure you want to delete this issue?')) {
            this.issues = this.issues.filter(i => i.id !== id);
            
            // Update views
            this.updateDashboardStats();
            this.renderIssuesTable();
            
            if (this.map) {
                this.updateMapMarkers();
            }
            
            this.showNotification('Issue deleted successfully', 'success');
        }
    }
    
    showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    closeModal(modal) {
        modal.classList.add('hidden');
        this.currentEditingId = null;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialize the application
const app = new CivicReporter();

// Global functions for inline event handlers
window.app = app;
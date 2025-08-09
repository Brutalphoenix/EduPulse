/**
 * EduPulse Admin Dashboard JavaScript
 * Contains functions specific to the admin dashboard
 */

// Global variables
let recordsTable = null;
let refreshInterval = null;
const REFRESH_INTERVAL_MS = 10000; // 10 seconds

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initAdminDashboard();
});

/**
 * Initialize admin dashboard
 * @returns {void}
 */
function initAdminDashboard() {
    // Load initial data
    loadDashboardData();
    
    // Set up refresh interval
    setupAutoRefresh();
    
    // Set up manual refresh button
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadDashboardData(true);
        });
    }
    
    // Set up export button
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', exportRecords);
    }
    
    // Set up retrain model button
    const retrainButton = document.getElementById('retrainButton');
    if (retrainButton) {
        retrainButton.addEventListener('click', retrainModel);
    }
}

/**
 * Set up auto-refresh for dashboard data
 * @returns {void}
 */
function setupAutoRefresh() {
    // Clear any existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Set up new interval
    refreshInterval = setInterval(function() {
        loadDashboardData(false);
    }, REFRESH_INTERVAL_MS);
    
    // Clear interval when page is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearInterval(refreshInterval);
        } else {
            setupAutoRefresh();
        }
    });
}

/**
 * Load dashboard data from API
 * @param {boolean} showLoading - Whether to show loading indicators
 * @returns {Promise<void>}
 */
async function loadDashboardData(showLoading = true) {
    try {
        if (showLoading) {
            // Show loading indicators
            document.querySelectorAll('.stats-card .card-body').forEach(card => {
                card.innerHTML = '<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
            });
            
            const tableBody = document.querySelector('#recordsTable tbody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
            }
        }
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Fetch records from API
        const response = await fetch('/api/records', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        });
        
        // Parse response
        const data = await response.json();
        
        // Handle error
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred while loading dashboard data');
        }
        
        // Update dashboard with data
        updateDashboardStats(data.records);
        updateRecordsTable(data.records);
        updateCharts(data.records);
        
        // Show success message if manual refresh
        if (showLoading) {
            showToast('Dashboard Updated', 'Dashboard data has been refreshed successfully.', 'success');
        }
        
    } catch (error) {
        console.error('Dashboard data loading error:', error);
        if (showLoading) {
            showToast('Data Loading Error', error.message, 'danger');
        }
    }
}

/**
 * Update dashboard statistics
 * @param {Array} records - Records from API
 * @returns {void}
 */
function updateDashboardStats(records) {
    // Calculate statistics
    const totalStudents = new Set(records.map(record => record.student_id)).size;
    
    let lowRiskCount = 0;
    let mediumRiskCount = 0;
    let highRiskCount = 0;
    
    // Count risk levels (only count the most recent record for each student)
    const studentLatestRecord = {};
    records.forEach(record => {
        if (!record.risk_level) return;
        
        const studentId = record.student_id;
        const timestamp = record.timestamp;
        
        if (!studentLatestRecord[studentId] || timestamp > studentLatestRecord[studentId].timestamp) {
            studentLatestRecord[studentId] = record;
        }
    });
    
    // Count risk levels from latest records
    Object.values(studentLatestRecord).forEach(record => {
        if (record.risk_level === 'Low') {
            lowRiskCount++;
        } else if (record.risk_level === 'Medium') {
            mediumRiskCount++;
        } else if (record.risk_level === 'High') {
            highRiskCount++;
        }
    });
    
    // Update statistics in UI
    document.getElementById('totalStudentsCount').textContent = totalStudents;
    document.getElementById('lowRiskCount').textContent = lowRiskCount;
    document.getElementById('mediumRiskCount').textContent = mediumRiskCount;
    document.getElementById('highRiskCount').textContent = highRiskCount;
    
    // Update last updated timestamp
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
}

/**
 * Update records table
 * @param {Array} records - Records from API
 * @returns {void}
 */
function updateRecordsTable(records) {
    const tableBody = document.querySelector('#recordsTable tbody');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Sort records by timestamp (newest first)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Add records to table
    records.slice(0, 10).forEach(record => {
        // Skip records without risk level (sentiment-only records)
        if (!record.risk_level) return;
        
        // Determine risk class for styling
        let riskClass = 'success';
        if (record.risk_level === 'Medium') {
            riskClass = 'warning';
        } else if (record.risk_level === 'High') {
            riskClass = 'danger';
        }
        
        // Format timestamp
        const timestamp = new Date(record.timestamp).toLocaleString();
        
        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.student_id}</td>
            <td>${timestamp}</td>
            <td>${record.attendance || 'N/A'}</td>
            <td>${record.assignment_score || 'N/A'}</td>
            <td>${record.test_score || 'N/A'}</td>
            <td>
                <span class="badge bg-${riskClass}">
                    ${record.risk_level} (${Math.round((record.risk_probability || 0) * 100)}%)
                </span>
            </td>
            <td>
                <div class="btn-group" role="group" aria-label="Record actions">
                    <button type="button" class="btn btn-sm btn-primary view-record" 
                            data-record-id="${record.student_id}" 
                            data-bs-toggle="modal" 
                            data-bs-target="#recordModal"
                            aria-label="View details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-warning re-predict" 
                            data-record-id="${record.student_id}"
                            aria-label="Re-predict">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-info send-alert" 
                            data-record-id="${record.student_id}"
                            aria-label="Send alert">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add row to table
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addTableButtonListeners();
}

/**
 * Add event listeners to table buttons
 * @returns {void}
 */
function addTableButtonListeners() {
    // View record buttons
    document.querySelectorAll('.view-record').forEach(button => {
        button.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            viewRecordDetails(recordId);
        });
    });
    
    // Re-predict buttons
    document.querySelectorAll('.re-predict').forEach(button => {
        button.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            rePredict(recordId);
        });
    });
    
    // Send alert buttons
    document.querySelectorAll('.send-alert').forEach(button => {
        button.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            sendAlert(recordId);
        });
    });
}

/**
 * View record details in modal
 * @param {string} recordId - Student ID
 * @returns {void}
 */
function viewRecordDetails(recordId) {
    // This would typically fetch the specific record from the API
    // For demo purposes, we'll just show a modal with the record ID
    const modalTitle = document.querySelector('#recordModal .modal-title');
    const modalBody = document.querySelector('#recordModal .modal-body');
    
    modalTitle.textContent = `Student Record: ${recordId}`;
    modalBody.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading record details...</p>
        </div>
    `;
    
    // In a real implementation, you would fetch the record details from the API
    // and populate the modal with the data
    setTimeout(() => {
        modalBody.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                This is a placeholder for the record details modal.
                In a production environment, this would show detailed information for student ${recordId}.
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h5>Student Information</h5>
                    <ul class="list-group mb-3">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Student ID
                            <span class="badge bg-primary rounded-pill">${recordId}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Department
                            <span class="badge bg-secondary rounded-pill">Computer Science</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Year
                            <span class="badge bg-secondary rounded-pill">2</span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>Risk Assessment</h5>
                    <div class="card border-warning mb-3">
                        <div class="card-body text-center">
                            <h1 class="display-4 text-warning">65%</h1>
                            <p class="lead">Medium Risk</p>
                        </div>
                    </div>
                </div>
            </div>
            <h5>Academic Metrics</h5>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Benchmark</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Attendance</td>
                        <td>78%</td>
                        <td>85%</td>
                    </tr>
                    <tr>
                        <td>Assignment Score</td>
                        <td>72/100</td>
                        <td>75/100</td>
                    </tr>
                    <tr>
                        <td>Test Score</td>
                        <td>68/100</td>
                        <td>70/100</td>
                    </tr>
                    <tr>
                        <td>Behavior Score</td>
                        <td>7/10</td>
                        <td>8/10</td>
                    </tr>
                    <tr>
                        <td>Sentiment Score</td>
                        <td>45/100</td>
                        <td>60/100</td>
                    </tr>
                </tbody>
            </table>
        `;
    }, 1000);
}

/**
 * Re-predict for a student
 * @param {string} recordId - Student ID
 * @returns {Promise<void>}
 */
async function rePredict(recordId) {
    try {
        // In a real implementation, you would fetch the student's data
        // and send it to the prediction API
        showToast('Re-prediction', `Re-prediction requested for student ${recordId}. This is a placeholder.`, 'info');
        
    } catch (error) {
        console.error('Re-prediction error:', error);
        showToast('Re-prediction Error', error.message, 'danger');
    }
}

/**
 * Send alert for a student
 * @param {string} recordId - Student ID
 * @returns {Promise<void>}
 */
async function sendAlert(recordId) {
    try {
        // In a real implementation, you would send an alert via the API
        showToast('Alert Sent', `Alert sent for student ${recordId}. This is a placeholder.`, 'info');
        
    } catch (error) {
        console.error('Send alert error:', error);
        showToast('Send Alert Error', error.message, 'danger');
    }
}

/**
 * Export records to CSV
 * @returns {Promise<void>}
 */
async function exportRecords() {
    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Show loading toast
        showToast('Exporting Records', 'Preparing CSV export...', 'info');
        
        // Redirect to export endpoint
        window.location.href = '/api/export';
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export Error', error.message, 'danger');
    }
}

/**
 * Retrain the ML model
 * @returns {Promise<void>}
 */
async function retrainModel() {
    try {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to retrain the model? This may take a few minutes.')) {
            return;
        }
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Show loading toast
        showToast('Retraining Model', 'Model retraining has started. This may take a few minutes...', 'info');
        
        // Disable retrain button
        const retrainButton = document.getElementById('retrainButton');
        if (retrainButton) {
            retrainButton.disabled = true;
            retrainButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Retraining...';
        }
        
        // Send retrain request
        const response = await fetch('/admin/retrain', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        });
        
        // Parse response
        const result = await response.json();
        
        // Reset button state
        if (retrainButton) {
            retrainButton.disabled = false;
            retrainButton.innerHTML = 'Retrain Model';
        }
        
        // Handle error
        if (!response.ok) {
            throw new Error(result.error || 'An error occurred during model retraining');
        }
        
        // Show success toast
        showToast('Retraining Complete', 'Model has been retrained successfully.', 'success');
        
    } catch (error) {
        console.error('Retraining error:', error);
        showToast('Retraining Error', error.message, 'danger');
        
        // Reset button state
        const retrainButton = document.getElementById('retrainButton');
        if (retrainButton) {
            retrainButton.disabled = false;
            retrainButton.innerHTML = 'Retrain Model';
        }
    }
}

/**
 * Update dashboard charts
 * @param {Array} records - Records from API
 * @returns {void}
 */
function updateCharts(records) {
    // Call chart helper functions
    updateRiskDistributionChart(records);
    updateDepartmentRiskChart(records);
    updateSentimentTrendChart(records);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDashboardStats,
        updateRecordsTable,
        viewRecordDetails
    };
}
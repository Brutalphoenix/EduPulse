/**
 * EduPulse Main JavaScript
 * Contains common functions for the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initTooltips();
    
    // Initialize prediction form
    initPredictionForm();
    
    // Initialize sentiment form
    initSentimentForm();
});

/**
 * Initialize Bootstrap tooltips
 * @returns {void}
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize prediction form submission
 * @returns {void}
 */
function initPredictionForm() {
    const predictionForm = document.getElementById('predictionForm');
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitPredictionForm();
        });
    }
}

/**
 * Initialize sentiment form submission
 * @returns {void}
 */
function initSentimentForm() {
    const sentimentForm = document.getElementById('sentimentForm');
    if (sentimentForm) {
        sentimentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitSentimentForm();
        });
    }
}

/**
 * Submit prediction form via fetch API
 * @returns {Promise<void>}
 */
async function submitPredictionForm() {
    try {
        const form = document.getElementById('predictionForm');
        const resultContainer = document.getElementById('predictionResult');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        
        // Get form data
        const formData = new FormData(form);
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Submit form
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        // Parse response
        const result = await response.json();
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = 'Predict';
        
        // Handle error
        if (!response.ok) {
            throw new Error(result.error || 'An error occurred during prediction');
        }
        
        // Update UI with prediction result
        updatePredictionUI(result);
        
        // Show success toast
        showToast('Prediction Complete', 'Dropout risk prediction has been calculated successfully.', 'success');
        
    } catch (error) {
        console.error('Prediction error:', error);
        showToast('Prediction Error', error.message, 'danger');
        
        // Reset button state
        const submitButton = document.querySelector('#predictionForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Predict';
        }
    }
}

/**
 * Update UI with prediction result
 * @param {Object} result - Prediction result from API
 * @returns {void}
 */
function updatePredictionUI(result) {
    const resultContainer = document.getElementById('predictionResult');
    if (!resultContainer) return;
    
    // Determine risk class for styling
    let riskClass = 'success';
    if (result.risk_level === 'Medium') {
        riskClass = 'warning';
    } else if (result.risk_level === 'High') {
        riskClass = 'danger';
    }
    
    // Update result container
    resultContainer.innerHTML = `
        <div class="card border-${riskClass} mb-3">
            <div class="card-header bg-${riskClass} text-white">
                <h5 class="card-title mb-0">Dropout Risk Prediction</h5>
            </div>
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                        <div class="display-4 fw-bold text-${riskClass}">${result.risk_percentage}%</div>
                        <p class="lead">Risk Percentage</p>
                    </div>
                    <div class="col-md-8">
                        <h4 class="text-${riskClass}">Risk Level: ${result.risk_level}</h4>
                        <div class="progress mb-3" style="height: 25px;">
                            <div class="progress-bar bg-${riskClass}" role="progressbar" 
                                 style="width: ${result.risk_percentage}%;" 
                                 aria-valuenow="${result.risk_percentage}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                                ${result.risk_percentage}%
                            </div>
                        </div>
                        <p class="mb-0">
                            <strong>Interpretation:</strong> 
                            ${getRiskInterpretation(result.risk_level)}
                        </p>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-transparent border-${riskClass}">
                <small class="text-muted">Prediction saved successfully. Timestamp: ${new Date().toLocaleString()}</small>
            </div>
        </div>
    `;
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Get risk interpretation text based on risk level
 * @param {string} riskLevel - Risk level (Low, Medium, High)
 * @returns {string} - Interpretation text
 */
function getRiskInterpretation(riskLevel) {
    switch (riskLevel) {
        case 'Low':
            return 'Student is at low risk of dropping out. Continue with regular support.';
        case 'Medium':
            return 'Student is at moderate risk of dropping out. Consider additional support measures.';
        case 'High':
            return 'Student is at high risk of dropping out. Immediate intervention recommended.';
        default:
            return 'Unable to determine risk level.';
    }
}

/**
 * Submit sentiment form via fetch API
 * @returns {Promise<void>}
 */
async function submitSentimentForm() {
    try {
        const form = document.getElementById('sentimentForm');
        const resultContainer = document.getElementById('sentimentResult');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...';
        
        // Get form data
        const formData = new FormData(form);
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Submit form
        const response = await fetch('/sentiment', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        // Parse response
        const result = await response.json();
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = 'Analyze Sentiment';
        
        // Handle error
        if (!response.ok) {
            throw new Error(result.error || 'An error occurred during sentiment analysis');
        }
        
        // Update UI with sentiment result
        updateSentimentUI(result);
        
        // Show success toast
        showToast('Sentiment Analysis Complete', 'Text sentiment has been analyzed successfully.', 'success');
        
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        showToast('Sentiment Analysis Error', error.message, 'danger');
        
        // Reset button state
        const submitButton = document.querySelector('#sentimentForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Analyze Sentiment';
        }
    }
}

/**
 * Update UI with sentiment analysis result
 * @param {Object} result - Sentiment result from API
 * @returns {void}
 */
function updateSentimentUI(result) {
    const resultContainer = document.getElementById('sentimentResult');
    if (!resultContainer) return;
    
    // Determine sentiment class for styling
    let sentimentClass = 'primary';
    let sentimentLabel = 'Neutral';
    
    if (result.sentiment_score_percent > 65) {
        sentimentClass = 'success';
        sentimentLabel = 'Positive';
    } else if (result.sentiment_score_percent < 35) {
        sentimentClass = 'danger';
        sentimentLabel = 'Negative';
    }
    
    // Update result container
    resultContainer.innerHTML = `
        <div class="card border-${sentimentClass} mb-3">
            <div class="card-header bg-${sentimentClass} text-white">
                <h5 class="card-title mb-0">Sentiment Analysis Result</h5>
            </div>
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                        <div class="display-4 fw-bold text-${sentimentClass}">${result.sentiment_score_percent}%</div>
                        <p class="lead">Sentiment Score</p>
                    </div>
                    <div class="col-md-8">
                        <h4 class="text-${sentimentClass}">Sentiment: ${sentimentLabel}</h4>
                        <div class="progress mb-3" style="height: 25px;">
                            <div class="progress-bar bg-${sentimentClass}" role="progressbar" 
                                 style="width: ${result.sentiment_score_percent}%;" 
                                 aria-valuenow="${result.sentiment_score_percent}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                                ${result.sentiment_score_percent}%
                            </div>
                        </div>
                        <p class="mb-0">
                            <strong>Interpretation:</strong> 
                            ${getSentimentInterpretation(result.sentiment_score_percent)}
                        </p>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-transparent border-${sentimentClass}">
                <small class="text-muted">Sentiment analysis saved successfully. Timestamp: ${new Date().toLocaleString()}</small>
            </div>
        </div>
    `;
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Get sentiment interpretation text based on sentiment score
 * @param {number} score - Sentiment score (0-100)
 * @returns {string} - Interpretation text
 */
function getSentimentInterpretation(score) {
    if (score > 65) {
        return 'The text expresses a positive sentiment. The student appears to be satisfied and engaged.';
    } else if (score < 35) {
        return 'The text expresses a negative sentiment. The student may be experiencing difficulties or dissatisfaction.';
    } else {
        return 'The text expresses a neutral sentiment. The student appears to be neither particularly satisfied nor dissatisfied.';
    }
}

/**
 * Show a Bootstrap toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, danger, warning, info)
 * @returns {void}
 */
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast HTML
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${title}</strong>
                <small>Just now</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.innerHTML += toastHtml;
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getRiskInterpretation,
        getSentimentInterpretation,
        updatePredictionUI,
        updateSentimentUI
    };
}
/**
 * EduPulse Authentication JavaScript
 * Contains functions for handling login and authentication
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize login form
    initLoginForm();
});

/**
 * Initialize login form submission
 * @returns {void}
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitLoginForm();
        });
    }
}

/**
 * Submit login form via fetch API
 * @returns {Promise<void>}
 */
async function submitLoginForm() {
    try {
        const form = document.getElementById('loginForm');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        
        // Get form data
        const formData = new FormData(form);
        
        // Get CSRF token
        const csrfToken = document.querySelector('input[name="csrf_token"]').value;
        
        // Submit form
        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = 'Login';
        
        // Check if response is a redirect
        if (response.redirected) {
            // Redirect to the URL provided by the server
            window.location.href = response.url;
            return;
        }
        
        // Parse response if it's JSON
        if (response.headers.get('content-type')?.includes('application/json')) {
            const result = await response.json();
            
            // Handle error
            if (!response.ok) {
                throw new Error(result.error || 'Invalid credentials');
            }
            
            // Handle success
            if (result.redirect) {
                window.location.href = result.redirect;
            }
        } else {
            // If not JSON, it's probably HTML (error page)
            const html = await response.text();
            
            // Extract error message from HTML (this is a simple approach, might need adjustment)
            const errorMatch = html.match(/<div class="alert alert-danger">(.*?)<\/div>/);
            if (errorMatch && errorMatch[1]) {
                throw new Error(errorMatch[1].trim());
            } else {
                throw new Error('Login failed. Please check your credentials.');
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showLoginError(error.message);
    }
}

/**
 * Show login error message
 * @param {string} message - Error message
 * @returns {void}
 */
function showLoginError(message) {
    // Check if error container exists, create if not
    let errorContainer = document.getElementById('loginErrorContainer');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'loginErrorContainer';
        
        // Insert after form header
        const formHeader = document.querySelector('.card-header');
        if (formHeader) {
            formHeader.insertAdjacentElement('afterend', errorContainer);
        } else {
            // Fallback: insert at beginning of form
            const form = document.getElementById('loginForm');
            form.insertAdjacentElement('beforebegin', errorContainer);
        }
    }
    
    // Set error message
    errorContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show m-3" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Focus on username field
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
}

/**
 * Validate login form
 * @returns {boolean} - True if form is valid, false otherwise
 */
function validateLoginForm() {
    const form = document.getElementById('loginForm');
    const username = form.querySelector('#username').value.trim();
    const password = form.querySelector('#password').value;
    
    // Check if username is empty
    if (!username) {
        showLoginError('Username is required');
        return false;
    }
    
    // Check if password is empty
    if (!password) {
        showLoginError('Password is required');
        return false;
    }
    
    return true;
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateLoginForm,
        showLoginError
    };
}
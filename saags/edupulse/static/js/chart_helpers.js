/**
 * EduPulse Chart Helpers
 * Contains functions for creating and updating charts using Chart.js
 */

// Global chart objects
let riskDistributionChart = null;
let departmentRiskChart = null;
let sentimentTrendChart = null;

/**
 * Initialize all charts
 * @returns {void}
 */
function initCharts() {
    // Initialize risk distribution chart
    initRiskDistributionChart();
    
    // Initialize department risk chart
    initDepartmentRiskChart();
    
    // Initialize sentiment trend chart
    initSentimentTrendChart();
}

/**
 * Initialize risk distribution chart
 * @returns {void}
 */
function initRiskDistributionChart() {
    const ctx = document.getElementById('riskDistributionChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (riskDistributionChart) {
        riskDistributionChart.destroy();
    }
    
    // Create new chart
    riskDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Risk Distribution',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update risk distribution chart with new data
 * @param {Array} records - Records from API
 * @returns {void}
 */
function updateRiskDistributionChart(records) {
    if (!riskDistributionChart) {
        initRiskDistributionChart();
    }
    
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
    let lowRiskCount = 0;
    let mediumRiskCount = 0;
    let highRiskCount = 0;
    
    Object.values(studentLatestRecord).forEach(record => {
        if (record.risk_level === 'Low') {
            lowRiskCount++;
        } else if (record.risk_level === 'Medium') {
            mediumRiskCount++;
        } else if (record.risk_level === 'High') {
            highRiskCount++;
        }
    });
    
    // Update chart data
    riskDistributionChart.data.datasets[0].data = [lowRiskCount, mediumRiskCount, highRiskCount];
    riskDistributionChart.update();
}

/**
 * Initialize department risk chart
 * @returns {void}
 */
function initDepartmentRiskChart() {
    const ctx = document.getElementById('departmentRiskChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (departmentRiskChart) {
        departmentRiskChart.destroy();
    }
    
    // Create new chart
    departmentRiskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Sciences'],
            datasets: [
                {
                    label: 'Low Risk',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Medium Risk',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                },
                {
                    label: 'High Risk',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Risk by Department',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

/**
 * Update department risk chart with new data
 * @param {Array} records - Records from API
 * @returns {void}
 */
function updateDepartmentRiskChart(records) {
    if (!departmentRiskChart) {
        initDepartmentRiskChart();
    }
    
    // For demo purposes, we'll generate random data
    // In a real implementation, you would process the records to get department data
    
    // Generate random data for each department
    const departments = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Sciences'];
    const lowRiskData = [];
    const mediumRiskData = [];
    const highRiskData = [];
    
    departments.forEach(() => {
        lowRiskData.push(Math.floor(Math.random() * 20) + 5);
        mediumRiskData.push(Math.floor(Math.random() * 15) + 3);
        highRiskData.push(Math.floor(Math.random() * 10) + 1);
    });
    
    // Update chart data
    departmentRiskChart.data.datasets[0].data = lowRiskData;
    departmentRiskChart.data.datasets[1].data = mediumRiskData;
    departmentRiskChart.data.datasets[2].data = highRiskData;
    departmentRiskChart.update();
}

/**
 * Initialize sentiment trend chart
 * @returns {void}
 */
function initSentimentTrendChart() {
    const ctx = document.getElementById('sentimentTrendChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (sentimentTrendChart) {
        sentimentTrendChart.destroy();
    }
    
    // Create new chart
    sentimentTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Will be populated with dates
            datasets: [{
                label: 'Average Sentiment Score',
                data: [], // Will be populated with sentiment scores
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Sentiment Score (0-100)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Sentiment Trend Over Time',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

/**
 * Update sentiment trend chart with new data
 * @param {Array} records - Records from API
 * @returns {void}
 */
function updateSentimentTrendChart(records) {
    if (!sentimentTrendChart) {
        initSentimentTrendChart();
    }
    
    // Filter records with sentiment scores
    const sentimentRecords = records.filter(record => 
        record.sentiment_score_percent !== undefined && 
        record.timestamp !== undefined
    );
    
    // Group records by date
    const sentimentByDate = {};
    sentimentRecords.forEach(record => {
        const date = new Date(record.timestamp).toLocaleDateString();
        if (!sentimentByDate[date]) {
            sentimentByDate[date] = [];
        }
        sentimentByDate[date].push(record.sentiment_score_percent);
    });
    
    // Calculate average sentiment score for each date
    const dates = [];
    const averageScores = [];
    
    Object.entries(sentimentByDate).forEach(([date, scores]) => {
        dates.push(date);
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        averageScores.push(average);
    });
    
    // Sort dates chronologically
    const sortedIndices = dates.map((date, index) => index)
        .sort((a, b) => new Date(dates[a]) - new Date(dates[b]));
    
    const sortedDates = sortedIndices.map(index => dates[index]);
    const sortedScores = sortedIndices.map(index => averageScores[index]);
    
    // Update chart data
    sentimentTrendChart.data.labels = sortedDates;
    sentimentTrendChart.data.datasets[0].data = sortedScores;
    sentimentTrendChart.update();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateRiskDistributionChart,
        updateDepartmentRiskChart,
        updateSentimentTrendChart
    };
}
# Power BI Integration Guide for EduPulse

This guide provides step-by-step instructions for connecting Power BI to EduPulse data for advanced analytics and visualization.

## Prerequisites

- Power BI Desktop (latest version)
- Google account with access to the EduPulse Google Sheet
- EduPulse application running with data in Google Sheets

## Connecting Power BI to Google Sheets

### Step 1: Set Up Google Sheets Data Source

1. Open Power BI Desktop
2. Click on "Get Data" in the Home ribbon
3. Select "Online Services" > "Google Sheets"
4. Click "Connect"
5. Sign in to your Google account when prompted
6. Select the EduPulse Google Sheet from the list
7. Select the sheets/tabs you want to import (e.g., "Records", "DailyStats")
8. Click "Load" or "Transform Data" if you need to make adjustments

### Step 2: Configure Data Refresh

1. Go to "File" > "Options and settings" > "Data source settings"
2. Select the Google Sheets connection
3. Click "Edit Permissions"
4. Ensure credentials are saved for refresh
5. Click "OK"

## Recommended Visualizations

### 1. Risk Distribution Dashboard

- **Visualization Type**: Pie chart or Donut chart
- **Data**: Count of students by risk level (Low, Medium, High)
- **Purpose**: Quick overview of risk distribution

### 2. Risk Trend Analysis

- **Visualization Type**: Line chart
- **Data**: Average risk percentage over time (by day/week/month)
- **Purpose**: Track changes in risk levels over time

### 3. Department Risk Heatmap

- **Visualization Type**: Matrix or Heatmap
- **Data**: Risk levels by department/course
- **Purpose**: Identify high-risk areas in the institution

### 4. Sentiment Analysis Dashboard

- **Visualization Type**: Gauge and Line chart
- **Data**: Average sentiment scores over time
- **Purpose**: Track student sentiment trends

### 5. Intervention Impact Analysis

- **Visualization Type**: Scatter plot
- **Data**: Risk level before and after interventions
- **Purpose**: Measure effectiveness of interventions

## Publishing to Power BI Service

### Step 1: Publish Your Report

1. In Power BI Desktop, click "Publish" in the Home ribbon
2. Sign in to your Power BI account if prompted
3. Select a workspace to publish to
4. Click "Select"
5. Wait for the publishing process to complete

### Step 2: Configure Scheduled Refresh

1. Go to Power BI Service (app.powerbi.com)
2. Navigate to your workspace
3. Find your dataset
4. Click the "..." menu and select "Settings"
5. Go to "Scheduled refresh" section
6. Set up the refresh frequency (recommended: daily)
7. Configure refresh time (preferably after EduPulse data aggregation runs)
8. Save changes

### Step 3: Share Dashboard

1. Create a dashboard from your report
2. Click "Share" in the top navigation
3. Enter email addresses of users who need access
4. Configure sharing permissions
5. Add a message if needed
6. Click "Share"

## Data Schema Reference

The EduPulse data in Google Sheets follows this schema:

### Records Sheet

- `student_id`: Student identifier
- `timestamp`: Date and time of record
- `user`: User who created the record
- `attendance`: Attendance percentage (50-100)
- `assignment_score`: Assignment score (0-100)
- `test_score`: Test score (0-100)
- `behavior_score`: Behavior score (0-10)
- `sentiment_score`: Sentiment score (-1 to 1)
- `sentiment_score_percent`: Sentiment score as percentage (0-100)
- `text`: Feedback text (if applicable)
- `risk_probability`: Dropout risk probability (0-1)
- `risk_level`: Risk level (Low, Medium, High)

### DailyStats Sheet (created by aggregation script)

- `date`: Date of aggregation
- `total_students`: Total number of students
- `low_risk_count`: Number of students at low risk
- `medium_risk_count`: Number of students at medium risk
- `high_risk_count`: Number of students at high risk
- `avg_sentiment_score`: Average sentiment score
- `avg_attendance`: Average attendance
- `avg_assignment_score`: Average assignment score
- `avg_test_score`: Average test score

## Troubleshooting

### Common Issues

1. **Data Refresh Failures**
   - Check Google account permissions
   - Verify Google Sheets API is enabled
   - Check if the Google Sheet is shared with your account

2. **Missing Data**
   - Ensure the aggregation script is running properly
   - Check if new data is being added to Google Sheets
   - Verify sheet names match what Power BI expects

3. **Visualization Issues**
   - Check data types (dates, numbers, text)
   - Verify calculations and measures
   - Ensure relationships between tables are correctly defined

### Getting Help

If you encounter issues with Power BI integration, contact your system administrator or refer to the following resources:

- [Power BI Documentation](https://docs.microsoft.com/en-us/power-bi/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- EduPulse documentation in the project repository
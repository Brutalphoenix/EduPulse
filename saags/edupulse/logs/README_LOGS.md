# EduPulse Logging System

This document explains the logging system used in EduPulse, including log rotation, log levels, and troubleshooting tips.

## Log Configuration

EduPulse uses Python's built-in `logging` module with a `RotatingFileHandler` to manage application logs. The primary log file is stored in this directory as `app.log`.

### Log Rotation

Log rotation is configured with the following parameters:

- **Maximum File Size**: 10 KB (10240 bytes)
- **Backup Count**: 10 files

When the main log file (`app.log`) reaches the maximum size, it is renamed to `app.log.1`, and a new `app.log` file is created. This process continues up to the specified backup count, after which the oldest log file is deleted.

### Log Format

Each log entry follows this format:

```
YYYY-MM-DD HH:MM:SS,ms LEVEL: MESSAGE [in FILE:LINE]
```

Example:
```
2023-05-15 14:32:45,123 INFO: EduPulse startup [in app.py:25]
```

## Log Levels

EduPulse uses the following log levels, in order of increasing severity:

1. **DEBUG**: Detailed information, typically useful only for diagnosing problems
2. **INFO**: Confirmation that things are working as expected
3. **WARNING**: Indication that something unexpected happened, or may happen in the near future
4. **ERROR**: Due to a more serious problem, the software has not been able to perform a function
5. **CRITICAL**: A serious error indicating that the program itself may be unable to continue running

In production, the log level is set to INFO, meaning DEBUG messages are not recorded.

## Key Log Events

The application logs the following key events:

- Application startup and shutdown
- User authentication (success/failure)
- Prediction requests and results
- Sentiment analysis requests and results
- Database operations
- Email alerts
- Model retraining
- API requests
- Errors and exceptions

## Troubleshooting Using Logs

### Common Issues and Log Patterns

1. **Database Connection Issues**
   - Look for: `ERROR: Google Sheets initialization error` or `ERROR: Firebase initialization error`
   - Solution: Check credentials and network connectivity

2. **ML Model Loading Failures**
   - Look for: `ERROR: Error loading ML model`
   - Solution: Ensure model files exist and are not corrupted

3. **Email Sending Failures**
   - Look for: `ERROR: Email sending failed`
   - Solution: Verify SMTP settings and network connectivity

4. **API Rate Limiting**
   - Look for: `WARNING: Rate limit exceeded for IP`
   - Solution: Implement client-side throttling or increase limits

5. **Input Validation Failures**
   - Look for: `WARNING: Potential SQL injection detected` or `WARNING: Potential XSS detected`
   - Solution: Review and sanitize input data

### Analyzing Logs

To analyze logs effectively:

1. **Filter by Level**: Use grep or similar tools to filter by log level
   ```
   grep "ERROR" app.log
   ```

2. **Filter by Component**: Look for specific components or functions
   ```
   grep "prediction" app.log
   ```

3. **Time-Based Analysis**: Extract logs from a specific time period
   ```
   grep "2023-05-15" app.log
   ```

4. **Follow Logs in Real-Time**: Monitor logs as they are generated
   ```
   tail -f app.log
   ```

## Log Maintenance

### Manual Rotation

To manually rotate logs:

1. Stop the application
2. Rename or archive the current log file
3. Restart the application

### Clearing Logs

To clear logs (use with caution):

1. Stop the application
2. Delete or archive log files
3. Restart the application

### Archiving Logs

For long-term storage:

1. Compress old log files: `gzip app.log.10`
2. Move to an archive location
3. Consider implementing a log archiving policy

## Security Considerations

- Logs may contain sensitive information; ensure appropriate access controls
- Regularly review logs for security events
- Consider implementing log encryption for highly sensitive environments
- Ensure compliance with relevant data protection regulations

## Additional Resources

- [Python Logging Documentation](https://docs.python.org/3/library/logging.html)
- [Rotating File Handler Documentation](https://docs.python.org/3/library/logging.handlers.html#rotatingfilehandler)
- [Flask Logging Guide](https://flask.palletsprojects.com/en/2.2.x/logging/)
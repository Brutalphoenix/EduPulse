from flask import Flask, render_template, session, redirect, url_for, request, flash, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime, timedelta
import uuid
import json
import os
import random
import string

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'edupulse-hackathon-key-2023'
socketio = SocketIO(app)

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Load or initialize users data
def load_users():
    try:
        with open('data/users.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Default users if file doesn't exist or is invalid
        default_users = {
            "admin": {
                "username": "admin",
                "password": "admin123",
                "role": "admin",
                "email": "admin@edupulse.com",
                "name": "Admin User",
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "student": {
                "username": "student",
                "password": "student123",
                "role": "student",
                "email": "student@example.com",
                "name": "John Student",
                "student_id": "S12345",
                "department": "Computer Science",
                "year": 2,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "mentor": {
                "username": "mentor",
                "password": "mentor123",
                "role": "mentor",
                "email": "mentor@example.com",
                "name": "Dr. Jane Mentor",
                "mentor_id": "M54321",
                "specialization": "Computer Science",
                "experience": 5,
                "hourly_rate": 50,
                "availability": ["Monday", "Wednesday", "Friday"],
                "rating": 4.8,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        save_users(default_users)
        return default_users

def save_users(users):
    with open('data/users.json', 'w') as f:
        json.dump(users, f, indent=4)

# Load or initialize mentorship sessions
def load_mentorship_sessions():
    try:
        with open('data/mentorship_sessions.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Default empty sessions if file doesn't exist or is invalid
        default_sessions = {}
        save_mentorship_sessions(default_sessions)
        return default_sessions

def save_mentorship_sessions(sessions):
    with open('data/mentorship_sessions.json', 'w') as f:
        json.dump(sessions, f, indent=4)

# Load or initialize chat messages
def load_chat_messages():
    try:
        with open('data/chat_messages.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Default empty messages if file doesn't exist or is invalid
        default_messages = {}
        save_chat_messages(default_messages)
        return default_messages

def save_chat_messages(messages):
    with open('data/chat_messages.json', 'w') as f:
        json.dump(messages, f, indent=4)

# Load or initialize payment transactions
def load_payments():
    try:
        with open('data/payments.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Default empty payments if file doesn't exist or is invalid
        default_payments = {}
        save_payments(default_payments)
        return default_payments

def save_payments(payments):
    with open('data/payments.json', 'w') as f:
        json.dump(payments, f, indent=4)

# Load or initialize student records
def load_student_records():
    try:
        with open('data/student_records.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Default records if file doesn't exist or is invalid
        default_records = {
            "S12345": [
                {
                    "student_id": "S12345",
                    "timestamp": "2023-05-15 14:30:00",
                    "attendance": 85.5,
                    "assignment_score": 78.0,
                    "test_score": 72.5,
                    "risk_level": "Low",
                    "risk_probability": 0.25
                }
            ],
            "S67890": [
                {
                    "student_id": "S67890",
                    "timestamp": "2023-05-15 15:45:00",
                    "attendance": 65.0,
                    "assignment_score": 58.0,
                    "test_score": 62.0,
                    "risk_level": "Medium",
                    "risk_probability": 0.55
                }
            ],
            "S24680": [
                {
                    "student_id": "S24680",
                    "timestamp": "2023-05-15 16:20:00",
                    "attendance": 52.0,
                    "assignment_score": 45.0,
                    "test_score": 48.0,
                    "risk_level": "High",
                    "risk_probability": 0.85
                }
            ]
        }
        save_student_records(default_records)
        return default_records

def save_student_records(records):
    with open('data/student_records.json', 'w') as f:
        json.dump(records, f, indent=4)

# Generate a random session ID
def generate_session_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    from flask import session as flask_session
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        users = load_users()
        
        if username in users and users[username]['password'] == password:
            user = users[username]
            flask_session['user'] = username
            flask_session['role'] = user['role']
            flask_session['name'] = user.get('name', username)
            
            if user['role'] == 'student':
                flask_session['student_id'] = user.get('student_id', '')
                flash('Login successful!', 'success')
                return redirect(url_for('student_dashboard'))
            elif user['role'] == 'mentor':
                flask_session['mentor_id'] = user.get('mentor_id', '')
                flash('Login successful!', 'success')
                return redirect(url_for('mentor_dashboard'))
            elif user['role'] == 'admin':
                flash('Login successful!', 'success')
                return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        name = request.form.get('name')
        role = request.form.get('role')
        
        users = load_users()
        
        if username in users:
            flash('Username already exists', 'danger')
            return render_template('signup.html')
        
        # Create new user
        new_user = {
            "username": username,
            "password": password,
            "role": role,
            "email": email,
            "name": name,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Add role-specific fields
        if role == 'student':
            new_user['student_id'] = 'S' + ''.join(random.choices(string.digits, k=5))
            new_user['department'] = request.form.get('department', '')
            new_user['year'] = int(request.form.get('year', 1))
        elif role == 'mentor':
            new_user['mentor_id'] = 'M' + ''.join(random.choices(string.digits, k=5))
            new_user['specialization'] = request.form.get('specialization', '')
            new_user['experience'] = int(request.form.get('experience', 0))
            new_user['hourly_rate'] = float(request.form.get('hourly_rate', 0))
            new_user['availability'] = request.form.getlist('availability')
            new_user['rating'] = 5.0  # Default rating for new mentors
        
        users[username] = new_user
        save_users(users)
        
        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    from flask import session as flask_session
    flask_session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/mentor/update-profile', methods=['POST'])
def update_mentor_profile():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'mentor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    mentor_id = flask_session.get('mentor_id')
    specialization = request.form.get('specialization')
    experience = request.form.get('experience')
    hourly_rate = request.form.get('hourly_rate')
    payment_details = request.form.get('payment_details')
    availability = request.form.getlist('availability[]')
    
    # Get users
    users = load_users()
    
    # Find mentor
    for username, user in users.items():
        if user.get('role') == 'mentor' and user.get('mentor_id') == mentor_id:
            # Update mentor details
            user['specialization'] = specialization
            user['experience'] = int(experience)
            user['hourly_rate'] = float(hourly_rate)
            user['payment_details'] = payment_details
            user['availability'] = availability
            
            # Save users
            save_users(users)
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully'
            })
    
    return jsonify({
        'success': False,
        'error': 'Mentor not found'
    }), 404

@app.route('/admin/dashboard')
def admin_dashboard():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'admin':
        flash('You do not have permission to access this page', 'danger')
        return redirect(url_for('index'))
    
    # Get all users
    users = load_users()
    students = [user for username, user in users.items() if user['role'] == 'student']
    mentors = [user for username, user in users.items() if user['role'] == 'mentor']
    
    # Get all student records
    student_records = load_student_records()
    
    # Calculate risk statistics
    total_students = len(students)
    high_risk_count = 0
    medium_risk_count = 0
    low_risk_count = 0
    
    for student_id, records in student_records.items():
        if records:
            latest_record = records[-1]
            risk_level = latest_record.get('risk_level', 'Low')
            
            if risk_level == 'High':
                high_risk_count += 1
            elif risk_level == 'Medium':
                medium_risk_count += 1
            else:
                low_risk_count += 1
    
    # Get all mentorship sessions
    mentorship_sessions = load_mentorship_sessions()
    
    # Calculate session statistics
    total_sessions = len(mentorship_sessions)
    pending_sessions = sum(1 for session in mentorship_sessions.values() if session.get('status') == 'pending_approval')
    active_sessions = sum(1 for session in mentorship_sessions.values() if session.get('status') in ['approved', 'scheduled', 'active'])
    completed_sessions = sum(1 for session in mentorship_sessions.values() if session.get('status') == 'completed')
    
    # Calculate revenue
    total_revenue = sum(session.get('cost_usd', 0) for session in mentorship_sessions.values() if session.get('payment_status') == 'paid')
    
    # Get recent activities (last 10 sessions)
    recent_activities = sorted(
        [session for session in mentorship_sessions.values()],
        key=lambda x: x.get('created_at', ''),
        reverse=True
    )[:10]
    
    return render_template('admin_dashboard.html',
                          total_students=total_students,
                          total_mentors=len(mentors),
                          high_risk_count=high_risk_count,
                          medium_risk_count=medium_risk_count,
                          low_risk_count=low_risk_count,
                          total_sessions=total_sessions,
                          pending_sessions=pending_sessions,
                          active_sessions=active_sessions,
                          completed_sessions=completed_sessions,
                          total_revenue=total_revenue,
                          recent_activities=recent_activities,
                          students=students,
                          mentors=mentors)

@app.route('/student/dashboard')
def student_dashboard():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'student':
        flash('You do not have permission to access this page', 'danger')
        return redirect(url_for('index'))
    
    student_id = flask_session.get('student_id')
    
    # Get student records
    student_records = load_student_records()
    records = student_records.get(student_id, [])
    
    # Get available mentors
    users = load_users()
    mentors = [user for username, user in users.items() if user['role'] == 'mentor']
    
    # Get active mentorship sessions
    mentorship_sessions = load_mentorship_sessions()
    active_sessions = []
    
    for session_id, mentorship_session in mentorship_sessions.items():
        if mentorship_session.get('student_id') == student_id and mentorship_session.get('status') in ['scheduled', 'active']:
            active_sessions.append(mentorship_session)
    
    return render_template('student_dashboard.html', records=records, mentors=mentors, active_sessions=active_sessions)

@app.route('/mentor/dashboard')
def mentor_dashboard():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'mentor':
        flash('You do not have permission to access this page', 'danger')
        return redirect(url_for('index'))
    
    mentor_id = flask_session.get('mentor_id')
    
    # Get mentor details
    users = load_users()
    mentor_details = None
    
    for username, user in users.items():
        if user.get('role') == 'mentor' and user.get('mentor_id') == mentor_id:
            mentor_details = user
            break
    
    if not mentor_details:
        flash('Mentor profile not found', 'danger')
        return redirect(url_for('index'))
    
    # Set default values if not present
    if 'rating' not in mentor_details:
        mentor_details['rating'] = 4.5
    
    if 'availability' not in mentor_details:
        mentor_details['availability'] = ['Monday', 'Wednesday', 'Friday']
    
    if 'experience' not in mentor_details:
        mentor_details['experience'] = 3
    
    if 'specialization' not in mentor_details:
        mentor_details['specialization'] = 'General Education'
    
    if 'hourly_rate' not in mentor_details:
        mentor_details['hourly_rate'] = 50
    
    # Get mentorship requests and sessions
    mentorship_sessions = load_mentorship_sessions()
    pending_requests = []
    active_sessions = []
    completed_sessions = []
    
    for session_id, mentorship_session in mentorship_sessions.items():
        if mentorship_session.get('mentor_id') == mentor_id:
            if mentorship_session.get('status') == 'pending_approval':
                pending_requests.append(mentorship_session)
            elif mentorship_session.get('status') in ['approved', 'scheduled', 'active']:
                active_sessions.append(mentorship_session)
            elif mentorship_session.get('status') == 'completed':
                completed_sessions.append(mentorship_session)
    
    # Calculate analytics data
    total_earnings = sum(mentorship_session.get('cost_usd', 0) for mentorship_session in completed_sessions if mentorship_session.get('payment_status') == 'paid')
    total_earnings += sum(mentorship_session.get('cost_usd', 0) for mentorship_session in active_sessions if mentorship_session.get('payment_status') == 'paid')
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    monthly_earnings = 0
    for mentorship_session in completed_sessions + active_sessions:
        if mentorship_session.get('payment_status') == 'paid':
            if 'created_at' in mentorship_session:
                try:
                    session_date = datetime.strptime(mentorship_session.get('created_at'), "%Y-%m-%d %H:%M:%S")
                    if session_date.month == current_month and session_date.year == current_year:
                        monthly_earnings += mentorship_session.get('cost_usd', 0)
                except (ValueError, TypeError):
                    pass
    
    # Get reviews (in a real app, this would come from a database)
    reviews = [
        {'student_name': 'John D.', 'rating': 5, 'comment': 'Excellent mentor!', 'date': '2023-05-15'},
        {'student_name': 'Sarah M.', 'rating': 5, 'comment': 'Very helpful and knowledgeable.', 'date': '2023-06-22'},
        {'student_name': 'Michael R.', 'rating': 4, 'comment': 'Good explanations and patient.', 'date': '2023-07-10'},
        {'student_name': 'Emily T.', 'rating': 5, 'comment': 'Helped me understand difficult concepts.', 'date': '2023-08-05'},
        {'student_name': 'David L.', 'rating': 3, 'comment': 'Decent explanations but sometimes rushed.', 'date': '2023-09-18'}
    ]
    
    return render_template('mentor_dashboard.html', 
                          mentor=mentor_details,
                          pending_requests=pending_requests,
                          active_sessions=active_sessions,
                          completed_sessions=completed_sessions,
                          total_earnings=total_earnings,
                          monthly_earnings=monthly_earnings,
                          reviews=reviews)

@app.route('/predict', methods=['POST'])
def predict():
    student_id = request.form.get('student_id', session.get('student_id', ''))
    attendance = float(request.form.get('attendance', 0))
    assignment_score = float(request.form.get('assignment_score', 0))
    test_score = float(request.form.get('test_score', 0))
    
    # Calculate risk score
    risk_score = (100 - attendance) * 0.5 + (100 - assignment_score) * 0.3 + (100 - test_score) * 0.2
    risk_probability = risk_score / 100
    
    if risk_probability < 0.3:
        risk_level = 'Low'
    elif risk_probability <= 0.6:
        risk_level = 'Medium'
    else:
        risk_level = 'High'
    
    # Create new record
    new_record = {
        'student_id': student_id,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'attendance': attendance,
        'assignment_score': assignment_score,
        'test_score': test_score,
        'risk_level': risk_level,
        'risk_probability': risk_probability
    }
    
    # Save to student records
    student_records = load_student_records()
    
    if student_id not in student_records:
        student_records[student_id] = []
    
    student_records[student_id].append(new_record)
    save_student_records(student_records)
    
    return {
        'risk_probability': risk_probability,
        'risk_percentage': round(risk_probability * 100),
        'risk_level': risk_level,
        'timestamp': new_record['timestamp']
    }

@app.route('/sentiment', methods=['POST'])
def sentiment():
    text = request.form.get('text', '')
    
    # Sentiment analysis logic
    positive_words = ['good', 'great', 'excellent', 'enjoy', 'like', 'love', 'happy', 'helpful', 
                      'clear', 'interesting', 'engaging', 'supportive', 'understanding', 'patient']
    negative_words = ['bad', 'poor', 'terrible', 'hate', 'dislike', 'difficult', 'struggle', 'confusing',
                      'boring', 'frustrating', 'overwhelming', 'unclear', 'unhelpful', 'disappointed']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    # Calculate sentiment score
    total_count = positive_count + negative_count
    if total_count > 0:
        sentiment_score = (positive_count - negative_count) / total_count
    else:
        sentiment_score = 0
    
    # Determine sentiment label
    if sentiment_score > 0.2:
        sentiment_label = 'Positive'
    elif sentiment_score < -0.2:
        sentiment_label = 'Negative'
    else:
        sentiment_label = 'Neutral'
    
    # Convert to percentage (0-100)
    sentiment_score_percent = round((sentiment_score + 1) / 2 * 100)
    
    return {
        'sentiment_score': sentiment_score,
        'sentiment_score_percent': sentiment_score_percent,
        'sentiment_label': sentiment_label
    }

@app.route('/mentorship/request', methods=['POST'])
def request_mentorship():
    from flask import session as flask_session
    
    print(f"Session data: {flask_session}")
    if flask_session.get('role') != 'student':
        print(f"Unauthorized: role is {flask_session.get('role')}")
        return jsonify({'success': False, 'error': 'You must be logged in as a student to request mentorship'})
    
    mentor_id = request.form.get('mentor_id')
    date = request.form.get('date')
    time = request.form.get('time')
    duration = int(request.form.get('duration', 60))
    topic = request.form.get('topic')
    
    # Get mentor details
    users = load_users()
    mentor = None
    
    for username, user in users.items():
        if user.get('mentor_id') == mentor_id:
            mentor = user
            break
    
    if not mentor:
        return jsonify({'error': 'Mentor not found'}), 404
    
    # Calculate session cost
    hourly_rate_usd = float(mentor.get('hourly_rate', 50))
    session_cost_usd = (hourly_rate_usd / 60) * duration
    
    # Convert to INR (1 USD = 83.5 INR approx)
    exchange_rate = 83.5
    session_cost_inr = session_cost_usd * exchange_rate
    
    # Create new mentorship session
    session_id = generate_session_id()
    new_session = {
        'session_id': session_id,
        'student_id': flask_session.get('student_id'),
        'student_name': flask_session.get('name'),
        'mentor_id': mentor_id,
        'mentor_name': mentor.get('name'),
        'date': date,
        'time': time,
        'duration': duration,
        'topic': topic,
        'status': 'pending_approval',  # Changed from 'pending' to 'pending_approval'
        'cost_usd': session_cost_usd,
        'cost_inr': session_cost_inr,
        'payment_status': 'awaiting_approval',  # New field
        'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'meeting_link': '',
        'chat_room': f"session_{session_id}"
    }
    
    # Save to mentorship sessions
    mentorship_sessions = load_mentorship_sessions()
    mentorship_sessions[session_id] = new_session
    save_mentorship_sessions(mentorship_sessions)
    
    return jsonify({
        'success': True,
        'message': 'Mentorship request sent successfully',
        'session_id': session_id,
        'cost_usd': session_cost_usd,
        'cost_inr': session_cost_inr
    })

@app.route('/mentorship/accept', methods=['POST'])
def accept_mentorship():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'mentor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    session_id = request.form.get('session_id')
    payment_details = request.form.get('payment_details', '')
    
    # Get mentorship session
    mentorship_sessions = load_mentorship_sessions()
    
    if session_id not in mentorship_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session_data = mentorship_sessions[session_id]
    
    if session_data['mentor_id'] != flask_session.get('mentor_id'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Update session status
    session_data['status'] = 'approved'
    session_data['payment_status'] = 'pending_payment'
    session_data['mentor_payment_details'] = payment_details
    mentorship_sessions[session_id] = session_data
    save_mentorship_sessions(mentorship_sessions)
    
    return jsonify({
        'success': True,
        'message': 'Mentorship request approved. Awaiting student payment.',
        'session_id': session_id
    })

@app.route('/mentorship/reject', methods=['POST'])
def reject_mentorship():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'mentor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    session_id = request.form.get('session_id')
    
    # Get mentorship session
    mentorship_sessions = load_mentorship_sessions()
    
    if session_id not in mentorship_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session_data = mentorship_sessions[session_id]
    
    if session_data['mentor_id'] != flask_session.get('mentor_id'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Update session status
    session_data['status'] = 'rejected'
    mentorship_sessions[session_id] = session_data
    save_mentorship_sessions(mentorship_sessions)
    
    return jsonify({
        'success': True,
        'message': 'Mentorship request rejected'
    })

@app.route('/payment/process', methods=['POST'])
def process_payment():
    from flask import session as flask_session
    
    if flask_session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    session_id = request.form.get('session_id')
    payment_method = request.form.get('payment_method', 'credit_card')
    currency = request.form.get('currency', 'INR')
    
    # Credit card details
    card_number = request.form.get('card_number', '')
    card_holder = request.form.get('card_holder', '')
    expiry_date = request.form.get('expiry_date', '')
    cvv = request.form.get('cvv', '')
    
    # UPI details
    upi_id = request.form.get('upi_id', '')
    
    # Bank transfer details
    bank_account = request.form.get('bank_account', '')
    ifsc_code = request.form.get('ifsc_code', '')
    
    # Get mentorship session
    mentorship_sessions = load_mentorship_sessions()
    
    if session_id not in mentorship_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session_data = mentorship_sessions[session_id]
    
    if session_data['student_id'] != flask_session.get('student_id'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    if session_data['status'] != 'approved':
        return jsonify({'error': 'Session not approved by mentor yet'}), 400
    
    # Determine amount based on currency
    if currency == 'USD':
        amount = session_data['cost_usd']
    else:  # INR
        amount = session_data['cost_inr']
    
    # Create payment record
    payment_id = str(uuid.uuid4())
    payment = {
        'payment_id': payment_id,
        'session_id': session_id,
        'student_id': session_data['student_id'],
        'mentor_id': session_data['mentor_id'],
        'amount': amount,
        'currency': currency,
        'payment_method': payment_method,
        'status': 'completed',
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    
    # Add payment method specific details
    if payment_method == 'credit_card':
        payment['card_last4'] = card_number[-4:] if card_number else '****'
        payment['card_holder'] = card_holder
    elif payment_method == 'upi':
        payment['upi_id'] = upi_id
    elif payment_method == 'bank_transfer':
        payment['bank_account_last4'] = bank_account[-4:] if bank_account else '****'
        payment['ifsc_code'] = ifsc_code
    
    # Save payment record
    payments = load_payments()
    payments[payment_id] = payment
    save_payments(payments)
    
    # Update session status
    session_data['status'] = 'scheduled'
    session_data['payment_status'] = 'paid'
    session_data['payment_id'] = payment_id
    session_data['meeting_link'] = f"https://meet.edupulse.com/{session_id}"
    mentorship_sessions[session_id] = session_data
    save_mentorship_sessions(mentorship_sessions)
    
    return jsonify({
        'success': True,
        'message': 'Payment processed successfully',
        'payment_id': payment_id,
        'meeting_link': session_data['meeting_link']
    })

@app.route('/chat/<room_id>')
def chat_room(room_id):
    if not session.get('user'):
        flash('Please log in to access the chat', 'danger')
        return redirect(url_for('login'))
    
    # Check if room exists and user has access
    mentorship_sessions = load_mentorship_sessions()
    
    session_id = room_id.replace('session_', '')
    if session_id not in mentorship_sessions:
        flash('Chat room not found', 'danger')
        return redirect(url_for('index'))
    
    session_data = mentorship_sessions[session_id]
    
    # Check if user is part of this session
    user_role = session.get('role')
    if (user_role == 'student' and session_data['student_id'] != session.get('student_id')) or \
       (user_role == 'mentor' and session_data['mentor_id'] != session.get('mentor_id')):
        flash('You do not have access to this chat room', 'danger')
        return redirect(url_for('index'))
    
    # Get chat history
    chat_messages = load_chat_messages()
    messages = chat_messages.get(room_id, [])
    
    return render_template('chat.html', room=room_id, messages=messages, session_data=session_data)

@app.route('/video/<session_id>')
def video_call(session_id):
    if not session.get('user'):
        flash('Please log in to access the video call', 'danger')
        return redirect(url_for('login'))
    
    # Check if session exists and user has access
    mentorship_sessions = load_mentorship_sessions()
    
    if session_id not in mentorship_sessions:
        flash('Session not found', 'danger')
        return redirect(url_for('index'))
    
    session_data = mentorship_sessions[session_id]
    
    # Check if user is part of this session
    user_role = session.get('role')
    if (user_role == 'student' and session_data['student_id'] != session.get('student_id')) or \
       (user_role == 'mentor' and session_data['mentor_id'] != session.get('mentor_id')):
        flash('You do not have access to this video call', 'danger')
        return redirect(url_for('index'))
    
    # Check if session is scheduled or active
    if session_data['status'] not in ['scheduled', 'active']:
        flash('This session is not currently active', 'danger')
        return redirect(url_for('index'))
    
    # Update session status to active if it was scheduled
    if session_data['status'] == 'scheduled':
        session_data['status'] = 'active'
        mentorship_sessions[session_id] = session_data
        save_mentorship_sessions(mentorship_sessions)
    
    return render_template('video_call.html', session_data=session_data)

# Socket.IO event handlers
@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    
    # Add system message for user joining
    username = session.get('name', session.get('user', 'Anonymous'))
    message = {
        'user': 'System',
        'text': f"{username} has joined the chat",
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Save message to chat history
    chat_messages = load_chat_messages()
    if room not in chat_messages:
        chat_messages[room] = []
    
    chat_messages[room].append(message)
    save_chat_messages(chat_messages)
    
    # Broadcast to room
    emit('message', message, room=room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    
    # Add system message for user leaving
    username = session.get('name', session.get('user', 'Anonymous'))
    message = {
        'user': 'System',
        'text': f"{username} has left the chat",
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Save message to chat history
    chat_messages = load_chat_messages()
    if room not in chat_messages:
        chat_messages[room] = []
    
    chat_messages[room].append(message)
    save_chat_messages(chat_messages)
    
    # Broadcast to room
    emit('message', message, room=room)

@socketio.on('message')
def on_message(data):
    room = data['room']
    text = data['text']
    
    # Create message
    username = session.get('name', session.get('user', 'Anonymous'))
    message = {
        'user': username,
        'text': text,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Save message to chat history
    chat_messages = load_chat_messages()
    if room not in chat_messages:
        chat_messages[room] = []
    
    chat_messages[room].append(message)
    save_chat_messages(chat_messages)
    
    # Broadcast to room
    emit('message', message, room=room)

# Custom template filters
@app.template_filter('format_datetime')
def format_datetime(value, format='%Y-%m-%d %H:%M:%S'):
    """Format a datetime string."""
    return value

@app.template_filter('format_currency')
def format_currency(value):
    """Format a value as currency."""
    return f"${value:.2f}"

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)


import os
import eventlet
import eventlet.wsgi

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    import eventlet
    import eventlet.wsgi
    eventlet.monkey_patch()
    socketio.run(app, host="0.0.0.0", port=port)




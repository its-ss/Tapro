import os
import secrets
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
import bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
CORS(app, origins=os.getenv('FRONTEND_URL', 'http://localhost:3000').split(','), supports_credentials=True)
jwt = JWTManager(app)

# MongoDB connection
mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/tapro')
try:
    client = MongoClient(mongo_uri)
    # Try to get database from URI, fall back to 'tapro'
    db = client.get_database() if '/' in mongo_uri.split('@')[-1] else client.get_database('tapro')
    # If still no database, use default
    if db is None or db.name == '':
        db = client['tapro']
    # Test connection
    client.admin.command('ping')
    print(f"MongoDB connection successful! Database: {db.name}")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    # Try with explicit database name
    try:
        client = MongoClient(mongo_uri)
        db = client['tapro']
        client.admin.command('ping')
        print(f"MongoDB connection successful with fallback! Database: {db.name}")
    except Exception as e2:
        print(f"MongoDB fallback connection also failed: {e2}")
        db = None

# Collections
users_collection = db['users'] if db is not None else None
startups_collection = db['startups'] if db is not None else None
investors_collection = db['investors'] if db is not None else None
messages_collection = db['messages'] if db is not None else None
conversations_collection = db['conversations'] if db is not None else None
posts_collection = db['posts'] if db is not None else None
password_resets_collection = db['password_resets'] if db is not None else None

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    # Convert any ObjectId fields
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()
        elif isinstance(value, list):
            doc[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
    return doc

def get_object_id(id_string):
    """Safely convert string to ObjectId"""
    try:
        return ObjectId(id_string)
    except (InvalidId, TypeError):
        return None

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# JWT token blocklist (for logout)
token_blocklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in token_blocklist

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    data = request.get_json()

    # Validate required fields
    required_fields = ['email', 'password', 'fullName']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    email = data['email'].lower().strip()
    password = data['password']

    # Check if user already exists
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 409

    # Validate password strength
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Create user document
    user_doc = {
        'email': email,
        'password': hash_password(password),
        'fullName': data['fullName'],
        'profileImage': data.get('profileImage', ''),
        'bio': data.get('bio', ''),
        'location': data.get('location', ''),
        'phone': data.get('phone', ''),
        'role': data.get('role', ''),
        'interests': data.get('interests', []),
        'skills': data.get('skills', []),
        'workExperience': data.get('workExperience', []),
        'education': data.get('education', []),
        'certificates': data.get('certificates', []),
        'website': data.get('website', ''),
        'linkedin': data.get('linkedin', ''),
        'twitter': data.get('twitter', ''),
        'github': data.get('github', ''),
        'lookingFor': data.get('lookingFor', ''),
        'availability': data.get('availability', ''),
        'mentorshipFocus': data.get('mentorshipFocus', []),
        'achievements': data.get('achievements', []),
        'startupIds': [],
        'savedStartups': [],
        'savedInvestors': [],
        'following': [],
        'followers': [],
        'isOnboarded': False,
        'verified': False,
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }

    result = users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Create tokens
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    # Remove password from response
    user_doc.pop('password')
    user_doc['id'] = user_id
    user_doc['_id'] = user_id

    return jsonify({
        'message': 'Registration successful',
        'user': serialize_doc(user_doc),
        'accessToken': access_token,
        'refreshToken': refresh_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    data = request.get_json()
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Find user
    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Check password
    if not check_password(password, user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    user_id = str(user['_id'])

    # Create tokens
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    # Remove password from response
    user.pop('password')

    return jsonify({
        'message': 'Login successful',
        'user': serialize_doc(user),
        'accessToken': access_token,
        'refreshToken': refresh_token
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user by blacklisting their token"""
    jti = get_jwt()['jti']
    token_blocklist.add(jti)
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'accessToken': access_token}), 200

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset token"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    data = request.get_json()
    email = data.get('email', '').lower().strip()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = users_collection.find_one({'email': email})
    if not user:
        # Don't reveal if email exists
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Store reset token
    password_resets_collection.delete_many({'email': email})  # Remove old tokens
    password_resets_collection.insert_one({
        'email': email,
        'token': reset_token,
        'expiresAt': expires_at,
        'createdAt': datetime.utcnow()
    })

    # In production, send email here
    # For development, return the token
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    print(f"Password reset link for {email}: {reset_link}")

    return jsonify({
        'message': 'If the email exists, a reset link has been sent',
        'resetToken': reset_token  # Remove in production
    }), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Find valid reset token
    reset_doc = password_resets_collection.find_one({
        'token': token,
        'expiresAt': {'$gt': datetime.utcnow()}
    })

    if not reset_doc:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    # Update password
    users_collection.update_one(
        {'email': reset_doc['email']},
        {'$set': {
            'password': hash_password(new_password),
            'updatedAt': datetime.utcnow()
        }}
    )

    # Delete used token
    password_resets_collection.delete_one({'_id': reset_doc['_id']})

    return jsonify({'message': 'Password reset successful'}), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': get_object_id(user_id)})

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.pop('password', None)
    return jsonify({'user': serialize_doc(user)}), 200

@app.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for logged in user"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()

    current_password = data.get('currentPassword', '')
    new_password = data.get('newPassword', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    # Get user
    user = users_collection.find_one({'_id': get_object_id(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Verify current password
    if not check_password(current_password, user['password']):
        return jsonify({'error': 'Current password is incorrect'}), 401

    # Update password
    users_collection.update_one(
        {'_id': get_object_id(user_id)},
        {'$set': {
            'password': hash_password(new_password),
            'updatedAt': datetime.utcnow()
        }}
    )

    return jsonify({'message': 'Password changed successfully'}), 200

# ==================== USER ROUTES ====================

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user profile by ID"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    obj_id = get_object_id(user_id)
    if not obj_id:
        return jsonify({'error': 'Invalid user ID'}), 400

    user = users_collection.find_one({'_id': obj_id})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.pop('password', None)
    return jsonify(serialize_doc(user)), 200

@app.route('/api/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user profile"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    obj_id = get_object_id(user_id)
    if not obj_id:
        return jsonify({'error': 'Invalid user ID'}), 400

    data = request.get_json()

    # Remove fields that shouldn't be updated directly
    data.pop('_id', None)
    data.pop('id', None)
    data.pop('password', None)
    data.pop('email', None)  # Don't allow email change here
    data['updatedAt'] = datetime.utcnow()

    result = users_collection.update_one(
        {'_id': obj_id},
        {'$set': data}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'Profile updated successfully'}), 200

@app.route('/api/users/<user_id>/onboarding', methods=['POST'])
@jwt_required()
def save_onboarding(user_id):
    """Save user onboarding data"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    obj_id = get_object_id(user_id)
    if not obj_id:
        return jsonify({'error': 'Invalid user ID'}), 400

    data = request.get_json()
    data['isOnboarded'] = True
    data['updatedAt'] = datetime.utcnow()

    # Remove protected fields
    data.pop('_id', None)
    data.pop('id', None)
    data.pop('password', None)

    result = users_collection.update_one(
        {'_id': obj_id},
        {'$set': data}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'Onboarding completed successfully'}), 200

@app.route('/api/users/<user_id>/startups', methods=['GET'])
def get_user_startups(user_id):
    """Get all startups owned by a user"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    obj_id = get_object_id(user_id)
    if not obj_id:
        return jsonify({'error': 'Invalid user ID'}), 400

    startups = list(startups_collection.find({'founderId': user_id}))
    return jsonify([serialize_doc(s) for s in startups]), 200

# ==================== STARTUP ROUTES ====================

@app.route('/api/startup/submit', methods=['POST'])
@jwt_required()
def submit_startup():
    """Create a new startup"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()

    # Add metadata
    data['founderId'] = user_id
    data['createdAt'] = datetime.utcnow()
    data['updatedAt'] = datetime.utcnow()
    data['verified'] = False

    result = startups_collection.insert_one(data)
    startup_id = str(result.inserted_id)

    # Add startup ID to user's startupIds
    users_collection.update_one(
        {'_id': get_object_id(user_id)},
        {'$push': {'startupIds': startup_id}}
    )

    return jsonify({
        'message': 'Startup created successfully',
        'startupId': startup_id
    }), 201

@app.route('/api/startups/<startup_id>', methods=['GET'])
def get_startup(startup_id):
    """Get startup by ID"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    obj_id = get_object_id(startup_id)
    if not obj_id:
        return jsonify({'error': 'Invalid startup ID'}), 400

    startup = startups_collection.find_one({'_id': obj_id})
    if not startup:
        return jsonify({'error': 'Startup not found'}), 404

    return jsonify(serialize_doc(startup)), 200

@app.route('/api/startups/<startup_id>', methods=['PUT'])
@jwt_required()
def update_startup(startup_id):
    """Update startup"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(startup_id)
    if not obj_id:
        return jsonify({'error': 'Invalid startup ID'}), 400

    # Check ownership
    startup = startups_collection.find_one({'_id': obj_id})
    if not startup:
        return jsonify({'error': 'Startup not found'}), 404

    if startup.get('founderId') != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    data.pop('_id', None)
    data.pop('id', None)
    data.pop('founderId', None)  # Can't change founder
    data['updatedAt'] = datetime.utcnow()

    startups_collection.update_one(
        {'_id': obj_id},
        {'$set': data}
    )

    return jsonify({'message': 'Startup updated successfully'}), 200

# ==================== INVESTOR ROUTES ====================

@app.route('/api/investor/register', methods=['POST'])
@jwt_required()
def register_investor():
    """Register as an investor"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()

    # Check if already registered as investor
    existing = investors_collection.find_one({'userId': user_id})
    if existing:
        return jsonify({'error': 'Already registered as investor'}), 409

    # Add metadata
    data['userId'] = user_id
    data['createdAt'] = datetime.utcnow()
    data['updatedAt'] = datetime.utcnow()
    data['verified'] = False
    data['portfolio'] = data.get('portfolio', [])
    data['savedStartups'] = []
    data['following'] = []
    data['followers'] = []

    result = investors_collection.insert_one(data)
    investor_id = str(result.inserted_id)

    return jsonify({
        'message': 'Investor registration successful',
        'investorId': investor_id
    }), 201

@app.route('/api/investors/<investor_id>', methods=['GET'])
def get_investor(investor_id):
    """Get investor by ID"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    obj_id = get_object_id(investor_id)
    if not obj_id:
        return jsonify({'error': 'Invalid investor ID'}), 400

    investor = investors_collection.find_one({'_id': obj_id})
    if not investor:
        return jsonify({'error': 'Investor not found'}), 404

    return jsonify(serialize_doc(investor)), 200

@app.route('/api/investors/<investor_id>', methods=['PUT'])
@jwt_required()
def update_investor(investor_id):
    """Update investor profile"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(investor_id)
    if not obj_id:
        return jsonify({'error': 'Invalid investor ID'}), 400

    # Check ownership
    investor = investors_collection.find_one({'_id': obj_id})
    if not investor:
        return jsonify({'error': 'Investor not found'}), 404

    if investor.get('userId') != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    data.pop('_id', None)
    data.pop('id', None)
    data.pop('userId', None)
    data['updatedAt'] = datetime.utcnow()

    investors_collection.update_one(
        {'_id': obj_id},
        {'$set': data}
    )

    return jsonify({'message': 'Investor profile updated successfully'}), 200

@app.route('/api/investors/me', methods=['GET'])
@jwt_required()
def get_my_investor_profile():
    """Get current user's investor profile"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    investor = investors_collection.find_one({'userId': user_id})

    if not investor:
        return jsonify({'error': 'Investor profile not found'}), 404

    return jsonify(serialize_doc(investor)), 200

# ==================== DISCOVERY ROUTES ====================

@app.route('/api/discover', methods=['POST'])
def discover():
    """Discover startups, investors, or users with pagination"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    data = request.get_json()
    collection_type = data.get('type')  # 'startup', 'investor', 'users'
    last_doc_id = data.get('lastDocId')
    limit = min(int(data.get('limit', 10)), 50)  # Max 50
    search = data.get('search', '')
    filters = data.get('filters', {})

    # Select collection
    if collection_type == 'startup':
        collection = startups_collection
    elif collection_type == 'investor':
        collection = investors_collection
    elif collection_type == 'users':
        collection = users_collection
    else:
        return jsonify({'error': 'Invalid type'}), 400

    # Build query
    query = {}

    # Add search if provided
    if search:
        if collection_type == 'startup':
            query['$or'] = [
                {'startupName': {'$regex': search, '$options': 'i'}},
                {'tagline': {'$regex': search, '$options': 'i'}},
                {'about': {'$regex': search, '$options': 'i'}}
            ]
        elif collection_type == 'investor':
            query['$or'] = [
                {'fullName': {'$regex': search, '$options': 'i'}},
                {'title': {'$regex': search, '$options': 'i'}},
                {'about': {'$regex': search, '$options': 'i'}}
            ]
        else:  # users
            query['$or'] = [
                {'fullName': {'$regex': search, '$options': 'i'}},
                {'bio': {'$regex': search, '$options': 'i'}},
                {'role': {'$regex': search, '$options': 'i'}}
            ]

    # Add filters
    if filters.get('location'):
        query['location'] = {'$regex': filters['location'], '$options': 'i'}
    if filters.get('category'):
        query['category'] = {'$in': [filters['category']]}

    # Pagination using _id
    if last_doc_id:
        obj_id = get_object_id(last_doc_id)
        if obj_id:
            query['_id'] = {'$gt': obj_id}

    # Execute query
    cursor = collection.find(query).sort('_id', 1).limit(limit)

    results = []
    last_id = None

    for doc in cursor:
        # Remove password from users
        doc.pop('password', None)
        serialized = serialize_doc(doc)
        results.append(serialized)
        last_id = serialized['id']

    return jsonify({
        'data': results,
        'lastDocId': last_id
    }), 200

# ==================== STARRED/SAVED ROUTES ====================

@app.route('/api/starred', methods=['GET', 'POST'])
@jwt_required()
def get_starred_items():
    """Get user's starred items"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()

    # Support both GET and POST
    if request.method == 'GET':
        item_type = request.args.get('type')
        last_doc_id = request.args.get('lastDocId')
        limit = min(int(request.args.get('limit', 10)), 50)
    else:
        data = request.get_json() or {}
        item_type = data.get('type')
        last_doc_id = data.get('lastDocId')
        limit = min(int(data.get('limit', 10)), 50)

    # Get user's saved items
    user = users_collection.find_one({'_id': get_object_id(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # If no type specified, return both startups and investors
    if not item_type:
        saved_startups = user.get('savedStartups', [])
        saved_investors = user.get('savedInvestors', [])

        # Fetch all starred items
        starred_items = []
        for startup_id in saved_startups[:limit]:
            obj_id = get_object_id(startup_id)
            if obj_id:
                doc = startups_collection.find_one({'_id': obj_id})
                if doc:
                    item = serialize_doc(doc)
                    item['itemType'] = 'startup'
                    starred_items.append(item)

        for investor_id in saved_investors[:limit]:
            obj_id = get_object_id(investor_id)
            if obj_id:
                doc = investors_collection.find_one({'_id': obj_id})
                if doc:
                    item = serialize_doc(doc)
                    item['itemType'] = 'investor'
                    starred_items.append(item)

        return jsonify({
            'starred': starred_items,
            'data': starred_items,
            'lastDocId': None
        }), 200

    if item_type not in ['startup', 'investor']:
        return jsonify({'error': 'Invalid type'}), 400

    saved_field = 'savedStartups' if item_type == 'startup' else 'savedInvestors'
    saved_ids = user.get(saved_field, [])

    if not saved_ids:
        return jsonify({'data': [], 'lastDocId': None}), 200

    # Pagination
    start_index = 0
    if last_doc_id and last_doc_id in saved_ids:
        start_index = saved_ids.index(last_doc_id) + 1

    next_ids = saved_ids[start_index:start_index + limit]

    # Fetch documents
    collection = startups_collection if item_type == 'startup' else investors_collection
    documents = []

    for doc_id in next_ids:
        obj_id = get_object_id(doc_id)
        if obj_id:
            doc = collection.find_one({'_id': obj_id})
            if doc:
                documents.append(serialize_doc(doc))

    new_last_id = next_ids[-1] if next_ids else None

    return jsonify({
        'data': documents,
        'lastDocId': new_last_id
    }), 200

@app.route('/api/star', methods=['POST'])
@jwt_required()
def star_item():
    """Star/save an item"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get('itemId')
    # Support both 'type' and 'itemType' for compatibility
    item_type = data.get('itemType') or data.get('type')

    if not item_id or item_type not in ['startup', 'investor', 'user']:
        return jsonify({'error': 'Missing itemId or invalid itemType'}), 400

    # Users are starred as 'savedUsers', startups as 'savedStartups', etc.
    if item_type == 'user':
        field = 'savedUsers'
    elif item_type == 'startup':
        field = 'savedStartups'
    else:
        field = 'savedInvestors'

    users_collection.update_one(
        {'_id': get_object_id(user_id)},
        {'$addToSet': {field: item_id}}
    )

    return jsonify({'message': 'Starred successfully'}), 200

@app.route('/api/unstar', methods=['POST'])
@jwt_required()
def unstar_item():
    """Unstar/unsave an item"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get('itemId')
    # Support both 'type' and 'itemType' for compatibility
    item_type = data.get('itemType') or data.get('type')

    if not item_id or item_type not in ['startup', 'investor', 'user']:
        return jsonify({'error': 'Missing itemId or invalid itemType'}), 400

    # Users are starred as 'savedUsers', startups as 'savedStartups', etc.
    if item_type == 'user':
        field = 'savedUsers'
    elif item_type == 'startup':
        field = 'savedStartups'
    else:
        field = 'savedInvestors'

    users_collection.update_one(
        {'_id': get_object_id(user_id)},
        {'$pull': {field: item_id}}
    )

    return jsonify({'message': 'Unstarred successfully'}), 200

# ==================== FOLLOW ROUTES ====================

@app.route('/api/follow', methods=['POST'])
@jwt_required()
def follow_user():
    """Follow a user, startup, or investor"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()
    target_id = data.get('targetId')
    target_type = data.get('type')  # 'user', 'startup', 'investor'

    if not target_id:
        return jsonify({'error': 'Target ID is required'}), 400

    # Add to current user's following
    users_collection.update_one(
        {'_id': get_object_id(user_id)},
        {'$addToSet': {'following': {'id': target_id, 'type': target_type}}}
    )

    # Add current user to target's followers (if it's a user)
    if target_type == 'user':
        users_collection.update_one(
            {'_id': get_object_id(target_id)},
            {'$addToSet': {'followers': user_id}}
        )

    return jsonify({'message': 'Followed successfully'}), 200

@app.route('/api/unfollow', methods=['POST'])
@jwt_required()
def unfollow_user():
    """Unfollow a user, startup, or investor"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()
    target_id = data.get('targetId')
    target_type = data.get('type')

    if not target_id:
        return jsonify({'error': 'Target ID is required'}), 400

    # Remove from current user's following
    users_collection.update_one(
        {'_id': get_object_id(user_id)},
        {'$pull': {'following': {'id': target_id, 'type': target_type}}}
    )

    # Remove current user from target's followers (if it's a user)
    if target_type == 'user':
        users_collection.update_one(
            {'_id': get_object_id(target_id)},
            {'$pull': {'followers': user_id}}
        )

    return jsonify({'message': 'Unfollowed successfully'}), 200

# ==================== MESSAGING ROUTES ====================

@app.route('/api/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for current user"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()

    # Find all conversations where user is a participant
    conversations = list(conversations_collection.find({
        'participants': user_id
    }).sort('updatedAt', -1))

    # Enrich with participant info and last message
    enriched = []
    for conv in conversations:
        # Get other participant's info
        other_id = [p for p in conv['participants'] if p != user_id][0]
        other_user = users_collection.find_one({'_id': get_object_id(other_id)})

        conv_data = serialize_doc(conv)
        conv_data['otherUser'] = {
            'id': other_id,
            'fullName': other_user.get('fullName', 'Unknown') if other_user else 'Unknown',
            'profileImage': other_user.get('profileImage', '') if other_user else ''
        }
        enriched.append(conv_data)

    return jsonify({'conversations': enriched}), 200

@app.route('/api/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    """Create or get existing conversation"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()
    other_user_id = data.get('userId')

    if not other_user_id:
        return jsonify({'error': 'User ID is required'}), 400

    if user_id == other_user_id:
        return jsonify({'error': 'Cannot create conversation with yourself'}), 400

    # Check if conversation already exists
    existing = conversations_collection.find_one({
        'participants': {'$all': [user_id, other_user_id]}
    })

    if existing:
        return jsonify({
            'conversation': serialize_doc(existing),
            'existing': True
        }), 200

    # Create new conversation
    conv_doc = {
        'participants': [user_id, other_user_id],
        'lastMessage': None,
        'unreadCount': {user_id: 0, other_user_id: 0},
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }

    result = conversations_collection.insert_one(conv_doc)
    conv_doc['_id'] = result.inserted_id

    return jsonify({
        'conversation': serialize_doc(conv_doc),
        'existing': False
    }), 201

@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    """Get messages in a conversation"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(conversation_id)

    if not obj_id:
        return jsonify({'error': 'Invalid conversation ID'}), 400

    # Verify user is participant
    conv = conversations_collection.find_one({'_id': obj_id})
    if not conv or user_id not in conv.get('participants', []):
        return jsonify({'error': 'Conversation not found'}), 404

    # Get messages
    limit = min(int(request.args.get('limit', 50)), 100)
    before = request.args.get('before')  # For pagination

    query = {'conversationId': conversation_id}
    if before:
        before_id = get_object_id(before)
        if before_id:
            query['_id'] = {'$lt': before_id}

    messages = list(messages_collection.find(query).sort('_id', -1).limit(limit))
    messages.reverse()  # Chronological order

    # Mark as read
    conversations_collection.update_one(
        {'_id': obj_id},
        {'$set': {f'unreadCount.{user_id}': 0}}
    )

    return jsonify({
        'messages': [serialize_doc(m) for m in messages]
    }), 200

@app.route('/api/conversations/<conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    """Send a message in a conversation"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(conversation_id)

    if not obj_id:
        return jsonify({'error': 'Invalid conversation ID'}), 400

    # Verify user is participant
    conv = conversations_collection.find_one({'_id': obj_id})
    if not conv or user_id not in conv.get('participants', []):
        return jsonify({'error': 'Conversation not found'}), 404

    data = request.get_json()
    content = data.get('content', '').strip()

    if not content:
        return jsonify({'error': 'Message content is required'}), 400

    # Create message
    message_doc = {
        'conversationId': conversation_id,
        'senderId': user_id,
        'content': content,
        'createdAt': datetime.utcnow(),
        'read': False
    }

    result = messages_collection.insert_one(message_doc)
    message_doc['_id'] = result.inserted_id

    # Update conversation
    other_user_id = [p for p in conv['participants'] if p != user_id][0]
    conversations_collection.update_one(
        {'_id': obj_id},
        {
            '$set': {
                'lastMessage': {
                    'content': content[:100],  # Truncate for preview
                    'senderId': user_id,
                    'createdAt': datetime.utcnow()
                },
                'updatedAt': datetime.utcnow()
            },
            '$inc': {f'unreadCount.{other_user_id}': 1}
        }
    )

    return jsonify({
        'message': serialize_doc(message_doc)
    }), 201

# ==================== POSTS/FEED ROUTES ====================

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get feed posts"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    limit = min(int(request.args.get('limit', 20)), 50)
    before = request.args.get('before')
    post_type = request.args.get('type', '').strip()

    query = {}
    if before:
        before_id = get_object_id(before)
        if before_id:
            query['_id'] = {'$lt': before_id}

    # Filter by post type if specified
    if post_type:
        # Map type to possible hashtag patterns
        type_to_hashtags = {
            'funding': ['#Funding', '#FundingNews', '#funding'],
            'announcement': ['#Announcement', '#announcement'],
            'insight': ['#Insight', '#insight'],
            'thought': ['#Thought', '#thought', '#LearningJourney']
        }
        hashtag_patterns = type_to_hashtags.get(post_type, [])

        # Query matches either the type field or hashtags
        query['$or'] = [
            {'type': post_type},
            {'hashtags': {'$in': hashtag_patterns}}
        ]

    posts = list(posts_collection.find(query).sort('_id', -1).limit(limit))

    # Get current user for isLiked check
    current_user_id = None
    try:
        from flask_jwt_extended import get_jwt_identity
        current_user_id = get_jwt_identity()
    except:
        pass

    # Enrich with author info and transform likes/comments
    enriched = []
    for post in posts:
        author = users_collection.find_one({'_id': get_object_id(post.get('authorId'))})
        post_data = serialize_doc(post)

        # Transform likes array to count and isLiked
        likes_array = post.get('likes', [])
        post_data['likes'] = len(likes_array) if isinstance(likes_array, list) else 0
        post_data['isLiked'] = current_user_id in [str(uid) for uid in likes_array] if current_user_id else False

        # Transform comments to include count
        comments_array = post.get('comments', [])
        post_data['commentsCount'] = len(comments_array) if isinstance(comments_array, list) else 0

        # Transform bookmarks
        bookmarks_array = post.get('bookmarks', [])
        post_data['isBookmarked'] = current_user_id in [str(uid) for uid in bookmarks_array] if current_user_id else False

        if author:
            post_data['author'] = {
                'id': str(author['_id']),
                'name': author.get('fullName', 'Unknown'),
                'avatar': author.get('profileImage', '/assets/default.jpg'),
                'role': author.get('role', ''),
                'isVerified': author.get('isVerified', False)
            }
        else:
            post_data['author'] = {
                'id': post.get('authorId', ''),
                'name': 'Unknown',
                'avatar': '/assets/default.jpg',
                'role': '',
                'isVerified': False
            }
        enriched.append(post_data)

    return jsonify({'posts': enriched}), 200

@app.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Post content is required'}), 400

    post_doc = {
        'authorId': user_id,
        'content': content,
        'type': data.get('type', 'thought'),  # Store post type
        'hashtags': data.get('hashtags', []),
        'images': data.get('images', []),
        'likes': [],
        'comments': [],
        'shares': 0,
        'bookmarks': [],
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }

    result = posts_collection.insert_one(post_doc)
    post_doc['_id'] = result.inserted_id

    # Get author info
    author = users_collection.find_one({'_id': get_object_id(user_id)})
    post_data = serialize_doc(post_doc)
    if author:
        post_data['author'] = {
            'id': user_id,
            'fullName': author.get('fullName', 'Unknown'),
            'profileImage': author.get('profileImage', ''),
            'role': author.get('role', '')
        }

    return jsonify({'post': post_data}), 201

@app.route('/api/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    """Like or unlike a post"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(post_id)

    if not obj_id:
        return jsonify({'error': 'Invalid post ID'}), 400

    post = posts_collection.find_one({'_id': obj_id})
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if user_id in post.get('likes', []):
        # Unlike
        posts_collection.update_one(
            {'_id': obj_id},
            {'$pull': {'likes': user_id}}
        )
        return jsonify({'message': 'Unliked', 'liked': False}), 200
    else:
        # Like
        posts_collection.update_one(
            {'_id': obj_id},
            {'$addToSet': {'likes': user_id}}
        )
        return jsonify({'message': 'Liked', 'liked': True}), 200

@app.route('/api/posts/<post_id>/comment', methods=['POST'])
@jwt_required()
def comment_post(post_id):
    """Add comment to a post"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(post_id)

    if not obj_id:
        return jsonify({'error': 'Invalid post ID'}), 400

    data = request.get_json()
    content = data.get('content', '').strip()

    if not content:
        return jsonify({'error': 'Comment content is required'}), 400

    comment = {
        'id': str(ObjectId()),
        'authorId': user_id,
        'content': content,
        'createdAt': datetime.utcnow()
    }

    # Get author info
    author = users_collection.find_one({'_id': get_object_id(user_id)})
    if author:
        comment['author'] = {
            'fullName': author.get('fullName', 'Unknown'),
            'profileImage': author.get('profileImage', '')
        }

    posts_collection.update_one(
        {'_id': obj_id},
        {'$push': {'comments': comment}}
    )

    return jsonify({'comment': comment}), 201

@app.route('/api/posts/<post_id>/bookmark', methods=['POST'])
@jwt_required()
def bookmark_post(post_id):
    """Bookmark or unbookmark a post"""
    if db is None:
        return jsonify({'error': 'Database not connected'}), 500

    user_id = get_jwt_identity()
    obj_id = get_object_id(post_id)

    if not obj_id:
        return jsonify({'error': 'Invalid post ID'}), 400

    post = posts_collection.find_one({'_id': obj_id})
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if user_id in post.get('bookmarks', []):
        # Remove bookmark
        posts_collection.update_one(
            {'_id': obj_id},
            {'$pull': {'bookmarks': user_id}}
        )
        return jsonify({'message': 'Bookmark removed', 'bookmarked': False}), 200
    else:
        # Add bookmark
        posts_collection.update_one(
            {'_id': obj_id},
            {'$addToSet': {'bookmarks': user_id}}
        )
        return jsonify({'message': 'Bookmarked', 'bookmarked': True}), 200

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    db_status = 'connected' if db is not None else 'disconnected'
    return jsonify({
        'status': 'healthy',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# ==================== RUN APP ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

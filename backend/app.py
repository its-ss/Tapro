import os
from datetime import datetime
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)  # Allow CORS for all domains


db = None
try : 
    key_path = os.path.join(os.path.dirname(__file__),'firebase_key.json')  # Path to your downloaded service account key
    cred=credentials.Certificate(key_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase connection Suck-seed.")
except Exception as e:
    print(f"Error initializing firebase:{e}")


@app.route('/submit', methods=['POST'])
def submit_form():
    data = request.json

    try:
        # Save to a collection named 'users'
        db.collection('users').add(data)
        return jsonify({"message": "Form submitted & saved to Firebase!"}), 200
    except Exception as e:
        print("Error saving to Firebase:", e)
        return jsonify({"message": "Failed to save data", "error": str(e)}), 500
    


# 🛠️ Submit Startup Route
@app.route('/api/startup/submit', methods=['POST'])
def submit_startup():
    try:
        
        data = request.get_json()

        if not data or 'founderId' not in data:
            return jsonify({"error": "Missing founderId or data"}), 400

        founder_id = data['founderId']
        print("✅ Received data from:", founder_id)

        # Add server timestamps
        
        data['createdAt'] = datetime.utcnow().isoformat()
        data['updatedAt'] = datetime.utcnow().isoformat()

        # Create startup document
        startup_ref = db.collection('startup').document()
        startup_id = startup_ref.id
        data['startupId'] = startup_id
        startup_ref.set(data)

        # Update user with startupId
        user_query = db.collection("users").where("uid", "==", founder_id).limit(1).stream()
        user_doc = next(user_query, None)

        if user_doc:
            user_ref = db.collection("users").document(user_doc.id)
            user_ref.update({
                "startupIds": firestore.ArrayUnion([startup_id])
            })
            print(f"📌 Added startupId to user {founder_id}")
        else:
            print(f"⚠️ No user found with uid = {founder_id}")

        return jsonify({"message": "Startup submitted and linked!", "startupId": startup_id}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/investor/register', methods=['POST'])
def register_investor():
    try:
        data = request.get_json()

        if not data or 'email' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        data['createdAt'] = datetime.utcnow().isoformat()

        # Generate a unique investor document
        doc_ref = db.collection('investor').document()
        data['investorId'] = doc_ref.id
        doc_ref.set(data)

        return jsonify({"message": "Investor registered successfully", "investorId": doc_ref.id}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/discover', methods=['POST'])
def discover():
    try:
        data = request.get_json()
        print("🚀 /api/discover called with:", data)

        collection_type = data.get('type')  # 'startup', 'investor', 'users'
        last_doc_id = data.get('lastDocId')
        last_created_at = data.get('lastCreatedAt')
        limit = int(data.get('limit', 10))

        if collection_type not in ['startup', 'investor', 'users']:
            return jsonify({'error': 'Invalid type'}), 400

        col_ref = db.collection(collection_type)

        # Fetch document to start after
        if last_doc_id:
            last_doc = db.collection(collection_type).document(last_doc_id).get()
            if last_doc.exists:
                query = col_ref.order_by('createdAt').order_by('__name__').start_after({
                    'createdAt': last_doc.get('createdAt'),
                    '__name__': last_doc.id
                }).limit(limit)
            else:
                query = col_ref.order_by('createdAt').order_by('__name__').limit(limit)
        else:
            query = col_ref.order_by('createdAt').order_by('__name__').limit(limit)


        docs = query.stream()
        results = []
        last_id = None

        for doc in docs:
            doc_data = doc.to_dict()
            doc_data['id'] = doc.id
            results.append(doc_data)
            last_id = doc.id

        return jsonify({'data': results, 'lastDocId': last_id}), 200

    except Exception as e:
        print("❌ Error in /api/discover:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/starred', methods=['POST'])
def get_starred_items():
    try:
        data = request.get_json()
        uid = data.get('uid')
        item_type = data.get('type')  # 'startup' or 'investor'
        last_doc_id = data.get('lastDocId')
        limit = int(data.get('limit', 10))

        if not uid or item_type not in ['startup', 'investor']:
            return jsonify({'error': 'Missing uid or invalid type'}), 400

        user_ref = db.collection('users').document(uid)
        user_snapshot = user_ref.get()

        if not user_snapshot.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_snapshot.to_dict()
        saved_field = 'savedStartups' if item_type == 'startup' else 'savedInvestors'
        saved_ids = user_data.get(saved_field, [])

        if not saved_ids:
            return jsonify({'data': [], 'lastDocId': None}), 200

        # Pagination: slice IDs
        start_index = 0
        if last_doc_id and last_doc_id in saved_ids:
            start_index = saved_ids.index(last_doc_id) + 1

        next_ids = saved_ids[start_index:start_index + limit]
        documents = []

        for doc_id in next_ids:
            doc = db.collection(item_type).document(doc_id).get()
            if doc.exists:
                doc_data = doc.to_dict()
                doc_data['id'] = doc.id
                documents.append(doc_data)

        new_last_id = next_ids[-1] if next_ids else None
        return jsonify({'data': documents, 'lastDocId': new_last_id}), 200

    except Exception as e:
        print("❌ Error in /api/starred:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/unstarred', methods=['POST'])
def unstar_item():
    try:
        data = request.get_json()
        uid = data.get('uid')
        item_id = data.get('itemId')
        item_type = data.get('type')  # 'startup' or 'investor'

        if not uid or not item_id or item_type not in ['startup', 'investor']:
            return jsonify({'error': 'Missing fields or invalid type'}), 400

        field = 'savedStartups' if item_type == 'startup' else 'savedInvestors'
        user_ref = db.collection('users').document(uid)

        user_ref.update({
            field: firestore.ArrayRemove([item_id])
        })

        return jsonify({'message': 'Unstarred successfully'}), 200

    except Exception as e:
        print("❌ Error in /api/unstarred:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """
    Fetching a single user document from the 'users' collection in Firestore.
    The user_id from the URL is used as the document ID.
    
    try:
        # Reference the document in the 'users' collection
        user_ref = db.collection('users').document(user_id)
        
        # Get the document snapshot
        doc = user_ref.get()

        if doc.exists:
            # If the document exists, convert it to a dictionary and return as JSON
            user_data = doc.to_dict()
            return jsonify(user_data), 200
        else:
            # If no document is found, return a 404 error
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        # For any other errors, return a 500 internal server error
        return jsonify({"error": str(e)}), 500
        """
     # Check if the database connection failed during startup
    if db is None:
        return jsonify({"error": "Server is not connected to the database"}), 500
    
    try:
        user_ref = db.collection('users').document(user_id)
        doc = user_ref.get()

        if doc.exists:
            user_data = doc.to_dict()
            return jsonify(user_data), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        # Return any other specific errors
        return jsonify({"error": str(e)}), 500

# --- NEW: Route to UPDATE a user's profile ---
@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    if db is None:
        return jsonify({"error": "Server is not connected to the database"}), 500
    try:
        user_ref = db.collection('users').document(user_id)
        # request.get_json() gets the data sent from the React frontend
        user_data = request.get_json()
        # .set() with merge=True updates fields without overwriting the whole document
        user_ref.set(user_data, merge=True)
        return jsonify({"success": True, "message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- NEW: Route to get all startups for a specific user ---
@app.route('/api/users/<user_id>/startups', methods=['GET'])
def get_user_startups(user_id):
    if db is None:
        return jsonify({"error": "Server is not connected to the database"}), 500
    try:
        startups_ref = db.collection('startups').where('ownerId', '==', user_id).stream()
        startups = []
        for startup in startups_ref:
            startup_data = startup.to_dict()
            startup_data['id'] = startup.id # Add the document ID to the object
            startups.append(startup_data)
        return jsonify(startups), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- NEW: Route to UPDATE a specific startup ---
@app.route('/api/startups/<startup_id>', methods=['PUT'])
def update_startup(startup_id):
    if db is None:
        return jsonify({"error": "Server is not connected to the database"}), 500
    try:
        startup_ref = db.collection('startups').document(startup_id)
        startup_data = request.get_json()
        startup_ref.set(startup_data, merge=True)
        return jsonify({"success": True, "message": "Startup updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == '__main__':
    app.run(debug=True, port=5000)
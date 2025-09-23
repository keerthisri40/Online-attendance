# backend/server.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import db_utils 
import numpy as np
import torch
import cv2
from facenet_pytorch import MTCNN, InceptionResnetV1
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity

# --- MODEL INITIALIZATION ---
print("🔌 Initializing FaceNet models...")
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, device=device, keep_all=False)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
print(f"✅ Models loaded successfully on {device}.")

# --- LOAD KNOWN FACES INTO MEMORY ON STARTUP ---
print("👤 Loading known faces from database...")
KNOWN_FACE_EMBEDDINGS, KNOWN_FACE_REG_NOS = db_utils.load_known_embeddings_facenet()
print(f"✅ {len(KNOWN_FACE_REG_NOS)} faces loaded into memory.")

app = Flask(__name__)
CORS(app)

# --- API ENDPOINTS ---

@app.route('/api/signup', methods=['POST'])
def handle_signup():
    data = request.get_json()
    try:
        if db_utils.find_user_by_email(data.get('email')): return jsonify({'message': 'User with this email already exists.'}), 409
        new_user = db_utils.create_user(data)
        if not new_user: raise Exception("Could not create user.")
        return jsonify(new_user)
    except Exception as e:
        print(f"An error occurred in handle_signup: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/login', methods=['POST'])
def handle_login():
    data = request.get_json()
    user_id = data.get('userId')
    password = data.get('password')
    role = data.get('role')
    if not all([user_id, password, role]): return jsonify({'message': 'Missing userId, password, or role'}), 400
    try:
        verified_user = db_utils.verify_user_credentials(user_id, password, role)
        if verified_user: return jsonify(verified_user)
        else: return jsonify({'message': 'Invalid credentials or role'}), 401
    except Exception as e:
        print(f"An error occurred in handle_login: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/create-session', methods=['POST'])
def handle_create_session():
    """Handles creation of a new session."""
    data = request.get_json()
    if not data or not data.get('sessionName') or not data.get('subject'):
        return jsonify({'message': 'Session Name and Subject are required.'}), 400
    try:
        new_session = db_utils.create_session(data)
        if new_session:
            return jsonify(new_session), 201
        else:
            return jsonify({'message': 'Failed to create session.'}), 500
    except Exception as e:
        print(f"🔴 Error in /api/create-session route: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/students-without-faces', methods=['GET'])
def get_unenrolled_students():
    try:
        students = db_utils.get_students_without_faces()
        return jsonify(students)
    except Exception as e:
        print(f"🔴 Error in /api/students-without-faces route: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/student-dashboard/<reg_no>', methods=['GET'])
def get_student_dashboard(reg_no):
    try:
        data = db_utils.get_student_dashboard_data(reg_no)
        if data:
            return jsonify(data)
        else:
            return jsonify({'message': 'No attendance data found for this student.'}), 404
    except Exception as e:
        print(f"🔴 Error in /api/student-dashboard route: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/register-face', methods=['POST'])
def handle_face_registration():
    files = request.files.getlist('images[]')
    name = request.form.get('name')
    reg_no = request.form.get('reg_no')
    if not all([files, name, reg_no]): return jsonify({'message': 'Missing images, name, or registration number'}), 400
    embeddings = []
    for file in files:
        try:
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            face_tensor = mtcnn(img_rgb)
            if face_tensor is not None:
                embedding = resnet(face_tensor.unsqueeze(0).to(device)).detach().cpu().numpy()
                embeddings.append(embedding)
        except Exception as e:
            print(f"🔴 Error processing an image file: {e}")
            continue
    if not embeddings: return jsonify({'message': 'No valid faces could be detected in any of the uploaded images.'}), 400
    final_embedding = np.mean(embeddings, axis=0)
    success = db_utils.add_face_embedding(name, reg_no, final_embedding)
    if success: return jsonify({'message': f'Face for {name} registered successfully!'}), 201
    else: return jsonify({'message': 'Failed to save face to the database.'}), 500

@app.route('/api/delete-face/<reg_no>', methods=['DELETE'])
def handle_delete_face(reg_no):
    try:
        success = db_utils.delete_face(reg_no)
        if success:
            return jsonify({'message': f'Face for registration number {reg_no} deleted successfully.'})
        else:
            return jsonify({'message': 'Face not found or could not be deleted.'}), 404
    except Exception as e:
        print(f"🔴 Error in /api/delete-face route: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/students', methods=['GET'])
def handle_get_all_students():
    try:
        students = db_utils.get_all_students()
        return jsonify(students)
    except Exception as e:
        print(f"🔴 Error in /api/students route: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

@app.route('/api/mark-attendance-session', methods=['POST'])
def handle_attendance_session():
    if 'image' not in request.files: return jsonify({'message': 'No image file found'}), 400
    file = request.files['image']
    session_name = request.form.get('sessionName')
    if not session_name: return jsonify({'message': 'Missing session name'}), 400
    try:
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        face_tensor = mtcnn(img_rgb)
        if face_tensor is None: return jsonify({'status': 'no_face', 'message': 'No face detected.'})

        unknown_embedding = resnet(face_tensor.unsqueeze(0).to(device)).detach().cpu().numpy()
        if len(KNOWN_FACE_EMBEDDINGS) > 0:
            similarities = cosine_similarity(unknown_embedding, KNOWN_FACE_EMBEDDINGS)[0]
            best_match_index = np.argmax(similarities)
            max_similarity = similarities[best_match_index]

            if max_similarity > 0.6: 
                reg_no = KNOWN_FACE_REG_NOS[best_match_index]
                student_name, message = db_utils.log_attendance(reg_no, session_name)
                if student_name: return jsonify({'status': 'success', 'message': f'{student_name}: {message}'})
                else: return jsonify({'status': 'error', 'message': message})
            else:
                return jsonify({'status': 'not_recognized', 'message': 'Face not recognized.'})
        else:
            return jsonify({'status': 'not_recognized', 'message': 'No faces enrolled in the system.'})
    except Exception as e:
        print(f"🔴 Error during attendance marking: {e}")
        return jsonify({'message': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
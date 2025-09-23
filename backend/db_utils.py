# backend/db_utils.py
import psycopg2
import psycopg2.extras
import numpy as np
import os
import bcrypt 
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def get_db_connection():
    """Establishes a connection to the Supabase PostgreSQL database."""
    try:
        conn_string = os.getenv("SUPABASE_URI") 
        conn = psycopg2.connect(conn_string)
        return conn
    except (psycopg2.OperationalError, KeyError) as e:
        print(f"🔴 Could not connect to the database: {e}")
        return None

# --- AUTHENTICATION & USER FUNCTIONS ---

def create_user(data):
    """Creates a new user in the database with a hashed password."""
    conn = get_db_connection()
    if not conn: return None
    try:
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                INSERT INTO users ("firstName", "lastName", email, phone, role, department, "registrationNumber", password)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, "firstName", "lastName", email, phone, role, department, "registrationNumber";
            """
            cur.execute(sql, (
                data.get('firstName'), data.get('lastName'), data.get('email'), 
                data.get('phone'), data.get('role'), data.get('department'),
                data.get('registrationNumber'), hashed_password.decode('utf-8')
            ))
            new_user_data = cur.fetchone()
            conn.commit()
            return dict(new_user_data) if new_user_data else None
    except Exception as e:
        print(f"🔴 Error creating user: {e}")
        if conn: conn.rollback()
        return None
    finally:
        if conn: conn.close()

def find_user_by_email(email):
    """Finds a user by their email to check for duplicates."""
    conn = get_db_connection()
    if not conn: return None
    user_data = None
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user_data = cur.fetchone()
    except Exception as e:
        print(f"🔴 Error finding user by email: {e}")
    finally:
        if conn: conn.close()
    return dict(user_data) if user_data else None

def verify_user_credentials(user_id, password, role):
    """Verifies a user's credentials AND their role against the database."""
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                SELECT id, "firstName", "lastName", email, phone, role, department, "registrationNumber", password 
                FROM users WHERE (email = %s OR "registrationNumber" = %s) AND role = %s;
            """
            cur.execute(sql, (user_id, user_id, role))
            user_data = cur.fetchone()
        if not user_data: return None 
        hashed_password = user_data['password'].encode('utf-8')
        if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
            user_info = dict(user_data)
            del user_info['password']
            return user_info
        else:
            return None
    except Exception as e:
        print(f"🔴 Error verifying credentials: {e}")
        return None
    finally:
        if conn: conn.close()

def get_students_without_faces():
    """Retrieves a list of students who have not yet had their face enrolled."""
    conn = get_db_connection()
    if not conn: return []
    students = []
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                SELECT u.id, u."firstName", u."lastName", u."registrationNumber", u.department
                FROM users u LEFT JOIN faces f ON u."registrationNumber" = f.reg_no
                WHERE u.role = 'student' AND f.id IS NULL;
            """
            cur.execute(sql)
            rows = cur.fetchall()
            for row in rows: students.append(dict(row))
    except Exception as e:
        print(f"🔴 Error fetching unenrolled students: {e}")
    finally:
        if conn: conn.close()
    return students

# --- SESSION MANAGEMENT ---

# In backend/db_utils.py

def create_session(data):
    """Inserts a new session into the database."""
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                INSERT INTO sessions (session_name, subject, department, year, section, faculty_email)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *;
            """
            cur.execute(sql, (
                data.get('sessionName'), data.get('subject'), data.get('department'),
                data.get('year'), data.get('section'), data.get('facultyEmail')
            ))
            new_session = cur.fetchone()
            conn.commit()
            return dict(new_session) if new_session else None
    except Exception as e:
        print(f"🔴 Error creating session: {e}")
        conn.rollback()
        return None
    finally:
        if conn: conn.close()

# --- ATTENDANCE & FACE RECOGNITION ---

def log_attendance(reg_no, session_name):
    """Checks if a student is already marked for the session today, and if not, marks them present."""
    conn = get_db_connection()
    if not conn: return None, "Database connection failed."
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute('SELECT "firstName", "lastName" FROM users WHERE "registrationNumber" = %s', (reg_no,))
            user = cur.fetchone()
            if not user: return None, f"No student found with registration number {reg_no}."
            student_name = f"{user['firstName']} {user['lastName']}"

            cur.execute("SELECT id FROM attendance WHERE reg_no = %s AND date = %s AND session_name = %s", (reg_no, today_str, session_name))
            if cur.fetchone(): return student_name, "Already marked for this session today."

            cur.execute(
                """INSERT INTO attendance (name, reg_no, time, date, status, mode, session_name) VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (student_name, reg_no, time_str, today_str, 'Present', 'In-Person', session_name)
            )
            conn.commit()
            return student_name, "Attendance marked successfully!"
    except Exception as e:
        print(f"🔴 Error logging attendance: {e}")
        conn.rollback()
        return None, "An error occurred while marking attendance."
    finally:
        if conn: conn.close()

def add_face_embedding(name, reg_no, embedding):
    """Inserts or updates a face record in the database."""
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            embedding_bytes = embedding.tobytes()
            cur.execute("SELECT id FROM faces WHERE reg_no = %s", (reg_no,))
            if cur.fetchone():
                cur.execute("UPDATE faces SET name = %s, embedding = %s WHERE reg_no = %s", (name, embedding_bytes, reg_no))
            else:
                cur.execute("INSERT INTO faces (name, reg_no, embedding) VALUES (%s, %s, %s)", (name, reg_no, embedding_bytes))
            conn.commit()
            return True
    except Exception as e:
        print(f"🔴 Error saving face to database: {e}")
        conn.rollback()
        return False
    finally:
        if conn: conn.close()

def load_known_embeddings_facenet():
    """Loads all known face embeddings for the facenet-pytorch model from the 'faces' table."""
    conn = get_db_connection()
    if not conn: return [], []
    known_embeddings, known_reg_nos = [], []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT reg_no, embedding FROM faces")
            data = cur.fetchall()
            for reg_no, embedding_blob in data:
                embedding = np.frombuffer(embedding_blob, dtype=np.float32).reshape(1, -1)
                known_embeddings.append(embedding)
                known_reg_nos.append(reg_no)
            print(f"✅ Loaded {len(known_reg_nos)} known faces for recognition.")
    except Exception as e:
        print(f"🔴 Error loading facenet embeddings: {e}")
    finally:
        if conn: conn.close()
    if not known_embeddings: return np.array([]), []
    return np.vstack(known_embeddings), known_reg_nos

# --- DASHBOARD DATA FUNCTION ---

def get_student_dashboard_data(reg_no):
    """Calculates attendance stats by fetching total class counts from the 'sessions' table."""
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT subject, total_classes FROM sessions;")
            session_rows = cur.fetchall()
            if not session_rows:
                raise Exception("No sessions found. Please populate the 'sessions' table.")
            
            subject_totals = {row['subject']: row['total_classes'] for row in session_rows}

            sql = "SELECT session_name FROM attendance WHERE reg_no = %s AND status = 'Present';"
            cur.execute(sql, (reg_no,))
            records = cur.fetchall()

            if not records: 
                total_classes_possible = sum(subject_totals.values())
                subject_wise_final = []
                for subject, total in subject_totals.items():
                     subject_wise_final.append({"subjectName": subject, "attended": 0, "total": total, "percentage": 0})
                return {
                    "overallStats": {"overallPercentage": 0, "classesAttended": 0, "classesMissed": total_classes_possible, "totalSubjects": len(subject_totals)},
                    "subjectWise": subject_wise_final
                }

            subject_wise_attended = {}
            for record in records:
                session_base_name = record['session_name'].split(' - ')[0]
                subject_wise_attended[session_base_name] = subject_wise_attended.get(session_base_name, 0) + 1
            
            subject_wise_final, total_classes_attended, total_classes_possible = [], 0, 0
            for subject, total in subject_totals.items():
                attended = subject_wise_attended.get(subject, 0)
                percentage = round((attended / total) * 100, 1) if total > 0 else 0
                subject_wise_final.append({
                    "subjectName": subject, "attended": attended, "total": total, "percentage": percentage
                })
                total_classes_attended += attended
                total_classes_possible += total
            
            overall_percentage = round((total_classes_attended / total_classes_possible) * 100) if total_classes_possible > 0 else 0
            
            dashboard_data = {
                "overallStats": {
                    "overallPercentage": overall_percentage,
                    "classesAttended": total_classes_attended,
                    "classesMissed": total_classes_possible - total_classes_attended,
                    "totalSubjects": len(subject_totals)
                },
                "subjectWise": subject_wise_final
            }
            return dashboard_data
    except Exception as e:
        print(f"🔴 Error getting dashboard data: {e}")
        return None
    finally:
        if conn: conn.close()
# Add this new function to backend/db_utils.py

def delete_face(reg_no):
    """Deletes a face record from the database based on the registration number."""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM faces WHERE reg_no = %s", (reg_no,))
            # Check if a row was actually deleted
            deleted_rows = cur.rowcount
            conn.commit()
            
            # Return True if 1 row was deleted, otherwise False
            return deleted_rows > 0
    except Exception as e:
        print(f"🔴 Error deleting face: {e}")
        conn.rollback()
        return False
    finally:
        if conn:
            conn.close()
# Add this new function to backend/db_utils.py

def get_all_students():
    """Retrieves all students and checks if they have a face enrolled."""
    conn = get_db_connection()
    if not conn: return []
    students = []
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # Join users with faces to see who is enrolled
            sql = """
                SELECT 
                    u.id, 
                    u."firstName", 
                    u."lastName", 
                    u."registrationNumber", 
                    u.department, 
                    u.email,
                    CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS enrolled
                FROM users u
                LEFT JOIN faces f ON u."registrationNumber" = f.reg_no
                WHERE u.role = 'student';
            """
            cur.execute(sql)
            rows = cur.fetchall()
            for row in rows:
                # Combine firstName and lastName into a single 'name' field for the frontend
                student_data = dict(row)
                student_data['name'] = f"{student_data.pop('firstName')} {student_data.pop('lastName')}"
                students.append(student_data)
    except Exception as e:
        print(f"🔴 Error fetching all students: {e}")
    finally:
        if conn: conn.close()
    return students
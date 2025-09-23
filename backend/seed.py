# backend/seed.py

import psycopg2
import psycopg2.extras
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_db_connection():
    """Establishes a connection to the Supabase PostgreSQL database."""
    conn_string = os.getenv("SUPABASE_URI")
    conn = psycopg2.connect(conn_string)
    return conn

def seed_users():
    """Inserts predefined admin and faculty users into the database."""
    
    # --- DEFINE YOUR ADMIN AND FACULTY USERS HERE ---
    users_to_create = [
        {
            "firstName": "Admin", "lastName": "User", "email": "admin@university.edu",
            "phone": "0000000000", "role": "admin", "department": "Administration",
            "registrationNumber": None, "password": "adminpassword123" # Use a strong password!
        },
        {
            "firstName": "John", "lastName": "Smith", "email": "john.smith@university.edu",
            "phone": "1111111111", "role": "faculty", "department": "CSE",
            "registrationNumber": None, "password": "facultypassword123" # Use a strong password!
        },
         {
            "firstName": "John", "lastName": "Smith", "email": "john@university.edu",
            "phone": "111111111", "role": "faculty", "department": "CSE",
            "registrationNumber": None, "password": "faculty123" # Use a strong password!
        }
    ]

    conn = get_db_connection()
    if not conn:
        print("🔴 Could not connect to database. Aborting seed.")
        return

    try:
        with conn.cursor() as cur:
            for user in users_to_create:
                print(f"Attempting to seed user: {user['email']}...")
                
                # Check if user already exists
                cur.execute("SELECT id FROM users WHERE email = %s", (user['email'],))
                if cur.fetchone():
                    print(f"🟡 User {user['email']} already exists. Skipping.")
                    continue

                # Hash the password
                hashed_password = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt())
                
                # Insert the new user
                sql = """
                    INSERT INTO users ("firstName", "lastName", email, phone, role, department, "registrationNumber", password)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """
                cur.execute(sql, (
                    user['firstName'], user['lastName'], user['email'], user['phone'],
                    user['role'], user['department'], user['registrationNumber'],
                    hashed_password.decode('utf-8')
                ))
                print(f"✅ User {user['email']} created successfully.")
            
            conn.commit()
            print("\nDatabase seeding complete!")

    except Exception as e:
        print(f"🔴 An error occurred: {e}")
        conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    seed_users()
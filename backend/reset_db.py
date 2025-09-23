# reset_db.py
from db_utils import get_db_connection

def create_tables():
    """ Connect to the PostgreSQL database server and create tables """
    conn = None
    try:
        # Get a database connection
        conn = get_db_connection()
        if conn is None:
            print("🔴 Could not connect to the database. Aborting.")
            return

        # Create a cursor
        cur = conn.cursor()

        # Drop existing tables to start fresh (optional, good for resetting)
        print("Dropping existing tables (if they exist)...")
        cur.execute("DROP TABLE IF EXISTS attendance;")
        cur.execute("DROP TABLE IF EXISTS faces;")

        # Create the 'faces' table
        print("Creating 'faces' table...")
        cur.execute('''
            CREATE TABLE faces (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                reg_no TEXT NOT NULL UNIQUE,
                embedding BYTEA NOT NULL
            )
        ''')

        # Create the 'attendance' table
        print("Creating 'attendance' table...")
        cur.execute('''
            CREATE TABLE attendance (
                id SERIAL PRIMARY KEY,
                reg_no TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                time TEXT NOT NULL,
                date TEXT NOT NULL,
                mode TEXT NOT NULL
            )
        ''')

        # Commit the changes to the database
        conn.commit()

        # Close communication with the database
        cur.close()
        print("✅ Successfully created 'faces' and 'attendance' tables.")

    except Exception as error:
        print(f"🔴 Error: {error}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    create_tables()
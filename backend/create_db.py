# create_db.py
import sqlite3
import os

# Create the data directory if it doesn't exist
if not os.path.exists('data'):
    os.makedirs('data')

conn = sqlite3.connect('data/attendance1.db')
cursor = conn.cursor()

# Create the 'faces' table to store student embeddings
cursor.execute('''
    CREATE TABLE IF NOT EXISTS faces (
        reg_no TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        embedding BLOB NOT NULL
    )
''')

# Create the 'attendance' table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reg_no TEXT,
        name TEXT,
        type TEXT NOT NULL, -- 'in' or 'out'
        time TEXT,
        date TEXT
    )
''')

print("[INFO] Database and tables ('faces', 'attendance') created successfully.")
conn.commit()
conn.close()
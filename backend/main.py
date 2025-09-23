# main.py
import cv2
import torch
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import pyttsx3
from sklearn.metrics.pairwise import cosine_similarity
import db_utils  # <-- IMPORT YOUR NEW UTILS

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Initialize FaceNet models
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, device=device)
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Initialize TTS
engine = pyttsx3.init()

# --- DATABASE LOGIC REPLACED ---
# Load face embeddings from Supabase using your utility function
print("[INFO] Loading known faces from Supabase...")
known_embeddings, known_names, known_regs = db_utils.load_known_embeddings()

if len(known_names) == 0:
    print("[ERROR] No faces loaded from the database. Exiting.")
    exit()

# Start webcam
cap = cv2.VideoCapture(0)
print("[INFO] Showing webcam. It will auto-exit after marking attendance.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face = mtcnn(img)

    if face is not None:
        face_embedding = model(face.unsqueeze(0).to(device)).detach().cpu().numpy()

        # Compare with known embeddings
        similarities = cosine_similarity(face_embedding, known_embeddings)[0]
        best_match_idx = np.argmax(similarities)
        
        if similarities[best_match_idx] > 0.6:  # Threshold
            name = known_names[best_match_idx]
            reg_no = known_regs[best_match_idx]

            # --- DATABASE LOGIC REPLACED ---
            # Check if already marked using your utility function
            if db_utils.check_if_marked(reg_no):
                print(f"[INFO] Hello {name}, your attendance has already been marked for today.")
                engine.say(f"Hello {name}, your attendance is already marked.")
                engine.runAndWait()
                break
            else:
               # We add "offline" because this script uses the local webcam
                db_utils.mark_attendance(name, reg_no, "offline")
                
                print(f"[INFO] Hello {name}, your attendance has been marked.")
                engine.say(f"Hello {name}, your attendance has been marked.")
                engine.runAndWait()
                break
        else:
            # Unknown face
            cv2.putText(frame, "Unknown", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
    cv2.imshow("Smart Attendance", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # Press ESC to quit
        break

cap.release()
cv2.destroyAllWindows()
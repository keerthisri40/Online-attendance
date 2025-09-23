# student_db.py
import cv2
import torch
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import time
from db_utils import get_db_connection

# --- INITIALIZATION ---
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, device=device, keep_all=False)
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)
SAMPLE_COUNT = 50

# --- MAIN FUNCTION ---
def register_new_face():
    name = input("Enter the person's name: ")
    reg_no = input("Enter the person's registration number: ")

    if not name or not reg_no:
        print("🔴 Name and registration number cannot be empty.")
        return

    cap = cv2.VideoCapture(0)
    print("✅ Webcam opened. Please look at the camera and hold still.")

    embeddings_list = []
    last_capture_time = time.time()

    while len(embeddings_list) < SAMPLE_COUNT:
        ret, frame = cap.read()
        if not ret:
            print("🔴 Failed to capture frame.")
            break

        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_tensor = mtcnn(img_rgb)

        current_time = time.time()
        if face_tensor is not None and (current_time - last_capture_time) > 0.1:
            embedding = model(face_tensor.unsqueeze(0).to(device)).detach().cpu().numpy()
            embeddings_list.append(embedding)
            last_capture_time = current_time
            print(f"📸 Sample {len(embeddings_list)}/{SAMPLE_COUNT} captured.")

        progress_text = f"Samples: {len(embeddings_list)} / {SAMPLE_COUNT}"
        cv2.putText(frame, progress_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.imshow('Register Face', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Registration cancelled.")
            cap.release()
            cv2.destroyAllWindows()
            return

    cap.release()
    cv2.destroyAllWindows()

    if len(embeddings_list) < SAMPLE_COUNT:
        print("🔴 Could not collect enough samples. Please try again.")
        return

    conn = get_db_connection()
    if not conn:
        return

    try:
        final_embedding = np.mean(embeddings_list, axis=0)
        with conn.cursor() as cur:
            # Use %s placeholders and embedding.tobytes() for PostgreSQL
            cur.execute(
                "INSERT INTO faces (name, reg_no, embedding) VALUES (%s, %s, %s) ON CONFLICT (reg_no) DO UPDATE SET name = EXCLUDED.name, embedding = EXCLUDED.embedding",
                (name, reg_no, final_embedding.tobytes())
            )
        conn.commit()
        print(f"\n✅ Success! Face for {name} ({reg_no}) saved successfully!")
    except Exception as e:
        print(f"🔴 Could not save to database: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    register_new_face()
import cv2
import mediapipe as mp
from deepface import DeepFace
import numpy as np
import threading
from flask import Flask, Response

# Initialize Flask app
app = Flask(__name__)

# Initialize FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

# Initialize OpenCV Video Capture
cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

# Emotion Buffer
emotion_buffer = []
buffer_size = 5
frame_skip = 3
frame_count = 0
current_emotion = "No Face Detected"

# Emotion Mapping
deep_emotions = {
    "happy": ["joyful", "excited", "content"],
    "sad": ["depressed", "gloomy", "melancholy"],
    "angry": ["frustrated", "irritated", "outraged"],
    "fear": ["anxious", "nervous", "panicked"],
    "surprise": ["shocked", "startled", "amazed"],
    "neutral": ["calm", "composed", "relaxed"]
}

# Emotion Detection in Thread
def process_emotion(frame):
    global current_emotion
    try:
        analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        detected = analysis[0]['dominant_emotion']
        blended = np.random.choice(deep_emotions.get(detected, [detected]), p=[0.6, 0.3, 0.1] if detected in deep_emotions else None)
        emotion_buffer.append(blended)
        if len(emotion_buffer) > buffer_size:
            emotion_buffer.pop(0)
        current_emotion = max(set(emotion_buffer), key=emotion_buffer.count)
    except:
        current_emotion = "No Face Detected"

# Frame Generator
def generate_frames():
    global frame_count
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame_count += 1
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)
        ih, iw, _ = frame.shape
        face_detected = False

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                face_detected = True
                x_min, y_min = iw, ih
                x_max, y_max = 0, 0

                for lm in face_landmarks.landmark:
                    x, y = int(lm.x * iw), int(lm.y * ih)
                    x_min, y_min = min(x, x_min), min(y, y_min)
                    x_max, y_max = max(x, x_max), max(y, y_max)

                for idx in [33, 133, 362, 263, 13, 14]:
                    lm = face_landmarks.landmark[idx]
                    x, y = int(lm.x * iw), int(lm.y * ih)
                    cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

                face_crop = frame[y_min:y_max, x_min:x_max]
                if frame_count % frame_skip == 0 and face_crop.size > 0:
                    threading.Thread(target=process_emotion, args=(face_crop,)).start()

        label = f"Emotion: {current_emotion}" if face_detected else "No Face Detected"
        cv2.putText(frame, label, (30, 50), cv2.FONT_HERSHEY_COMPLEX, 0.7, (0, 255, 0), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# Flask Route for MJPEG Stream
@app.route('/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Run Server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn.functional as F
import numpy as np
import logging
from model import TransformerModel  # Ensure this is the real model path

# Config
MODEL_PATH = 'transformer_model.pt'
NUM_LANDMARKS = 478
INPUT_DIM = 3
EMOTIONS = ['anger', 'contempt', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask setup
app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Allow only the frontend to access

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
try:
    model = TransformerModel().to(device)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()
    logger.info("Transformer model loaded successfully.")
except Exception as e:
    logger.critical(f"Model loading failed: {e}")
    raise e

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'landmarks' not in data:
            return jsonify({'error': 'Missing landmarks'}), 400

        landmarks = data['landmarks']
        if not isinstance(landmarks, list) or len(landmarks) != NUM_LANDMARKS:
            return jsonify({'error': f'Expected {NUM_LANDMARKS} landmarks'}), 400

        # Preprocess input
        try:
            points = np.array([[pt['x'], pt['y'], pt['z']] for pt in landmarks], dtype=np.float32)
            points -= points[0]  # Normalize based on first point
            points = np.expand_dims(points, axis=0)
            points_tensor = torch.tensor(points, dtype=torch.float32).to(device)
        except Exception as e:
            logger.error(f"Invalid input format: {e}")
            return jsonify({'error': 'Invalid landmark format'}), 400

        # Run inference
        with torch.no_grad():
            outputs = model(points_tensor)
            probs = F.softmax(outputs, dim=1)
            pred_idx = torch.argmax(probs, dim=1).item()
            confidence = probs[0][pred_idx].item()

        return jsonify({
            'emotion': EMOTIONS[pred_idx],
            'confidence': round(confidence, 4),
            'all_emotions': {
                EMOTIONS[i]: round(float(score), 4) for i, score in enumerate(probs[0].cpu().numpy())
            }
        })

    except Exception as e:
        logger.exception("Unexpected server error")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': True})

if __name__ == '__main__':
    logger.info("Starting Flask server on port 8000")
    app.run(host='0.0.0.0', port=8000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Define the EmotionTransformer model
class EmotionTransformer(nn.Module):
    def __init__(self, input_dim, hidden_dim, n_layers, n_heads, dropout, n_classes):
        super().__init__()
        self.input_proj = nn.Linear(input_dim, hidden_dim)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=n_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.fc = nn.Linear(hidden_dim, n_classes)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        x = self.input_proj(x)
        x = x.unsqueeze(1)
        x = self.transformer(x)
        x = x.squeeze(1)
        x = self.dropout(x)
        x = self.fc(x)
        return x

# Load model weights and preprocessing data
def load_model():
    model = EmotionTransformer(
        input_dim=468 * 3,
        hidden_dim=128,
        n_layers=1,
        n_heads=8,
        dropout=0.3,
        n_classes=6
    )
    model.load_state_dict(torch.load('backend/emotion_model.pth'))
    model.eval()
    return model

# Load mean, std, and label encoder
mean = np.load('backend/mean.npy')
std = np.load('backend/std.npy')
label_encoder = np.load('backend/label_encoder.npy', allow_pickle=True)

model = load_model()

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print(f"Received data: {data}")

        # Validate the data contains 'landmarks' key with 1 array
        if not data or 'landmarks' not in data or not isinstance(data['landmarks'], dict):
            error_msg = f"Invalid data format. Expected 'landmarks' key with a single object, got: {data.get('landmarks')}"
            print(error_msg)
            return jsonify({'error': error_msg}), 400

        landmark = data['landmarks']
        if not isinstance(landmark, dict) or 'index' not in landmark or 'points' not in landmark:
            error_msg = f"Invalid landmark format. Expected dict with 'index' and 'points' keys, got: {landmark}"
            print(error_msg)
            return jsonify({'error': error_msg}), 400

        points = landmark['points']
        if not isinstance(points, list) or len(points) < 468:
            error_msg = f"Landmark has {len(points)} points, expected at least 468"
            print(error_msg)
            return jsonify({'error': error_msg}), 400

        # Take first 468 points and extract x, y, z
        features = []
        for point in points[:468]:
            if not isinstance(point, dict) or not all(key in point for key in ['x', 'y', 'z']):
                error_msg = f"Invalid point format: {point}"
                print(error_msg)
                return jsonify({'error': error_msg}), 400
            features.extend([point['x'], point['y'], point['z']])

        # Convert to numpy array and validate length
        features = np.array(features)
        print(f"Feature vector length: {len(features)}")
        if len(features) != 468 * 3:
            error_msg = f"Feature vector has {len(features)} elements, expected {468 * 3}"
            print(error_msg)
            return jsonify({'error': error_msg}), 400

        # Normalize features
        features = (features - mean) / std

        # Convert to tensor
        features_tensor = torch.FloatTensor(features).unsqueeze(0)

        # Make prediction
        with torch.no_grad():
            outputs = model(features_tensor)
            _, predicted = torch.max(outputs.data, 1)

        # Decode the predicted class
        predicted_class = label_encoder[predicted.item()]
        print(f"Predicted Emotion: {predicted_class}")

        # Return the prediction as JSON
        return jsonify({
            'status': 'success',
            'emotion': predicted_class
        })

    except Exception as e:
        error_msg = f"Error in prediction: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
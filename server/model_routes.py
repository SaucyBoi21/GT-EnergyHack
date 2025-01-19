from flask import Flask, request, jsonify
from flask_cors import CORS  # Add this import
import joblib
import numpy as np
import os

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Add this line to enable CORS for all routes

# Construct the full path to the model file
model_path = os.path.join('random_forest_model.pkl')

# Load the trained model using joblib
try:
    model = joblib.load(model_path)
except FileNotFoundError:
    print(f"Error: Model file not found at {model_path}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data or 'inputs' not in data:
            return jsonify({'error': 'Invalid input data'}), 400

        # Parse inputs into a NumPy array
        print(data)
        inputs = np.array(data['inputs'])

        # Make predictions
        predictions = model.predict(inputs)

        # Return the predictions as JSON
        return jsonify({'predictions': predictions.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
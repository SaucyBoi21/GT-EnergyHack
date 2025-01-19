from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import traceback

app = Flask(__name__)
# Simplify CORS to allow everything
CORS(app)

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
    print("\n=== New Prediction Request ===")
    print(f"Method: {request.method}")
    print(f"Content-Type: {request.content_type}")
    print(f"Raw Data: {request.get_data(as_text=True)}")
    
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        # Get JSON data from the request
        data = request.get_json(force=True)  # Try to force JSON parsing
        print(f"Parsed JSON data: {data}")
        
        if not data or 'inputs' not in data:
            return jsonify({'error': 'Invalid input data', 'received': data}), 400

        # Parse inputs into a NumPy array
        print(data)
        inputs = np.array(data['inputs'])
        print(f"Converted inputs: {inputs}")

        # Make predictions
        predictions = model.predict(inputs)
        print(f"Generated predictions: {predictions}")

        result = {'predictions': predictions.tolist()}
        print(f"Sending response: {result}")
        return jsonify(result)

    except Exception as e:
        print("Error occurred:")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("Server starting on http://127.0.0.1:5000")
    app.run(debug=True, port=5000, host='127.0.0.1')
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np

# Initialize the Flask app
app = Flask(__name__)

# Load the trained TensorFlow model
model = tf.keras.models.load_model('path_to_your_model')

@app.route('api/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data or 'inputs' not in data:
            return jsonify({'error': 'Invalid input data'}), 400

        # Parse inputs into a NumPy array
        inputs = np.array(data['inputs'])

        # Make predictions
        predictions = model.predict(inputs)

        # Return the predictions as JSON
        return jsonify({'predictions': predictions.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

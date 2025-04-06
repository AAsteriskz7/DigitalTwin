from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Load saved pipeline
model = None

def load_model():
    global model
    if model is None:
        model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
        with open(model_path, "rb") as f:
            model = pickle.load(f)
    return model

def calculate_percentiles(person_data, predicted_age):
    # Load training data
    training_data_path = os.path.join(os.path.dirname(__file__), "merged.csv")
    training_data = pd.read_csv(training_data_path)
    
    percentiles = {}
    
    # --- Physical Health: activity ↑, sedentary ↓ ---
    phys_good = ["freq_moderate_activity", "freq_intense_activity"]
    phys_bad = ["mins_sedentary"]
    if all(f in training_data.columns for f in phys_good + phys_bad):
        good_vals = []
        for f in phys_good:
            val = person_data[f]
            dist = training_data[f]
            good_vals.append((dist <= val).mean() * 100)  # higher is better

        for f in phys_bad:
            val = person_data[f]
            dist = training_data[f]
            good_vals.append((dist >= val).mean() * 100)  # lower is better

        physical_score = np.mean(good_vals)
        percentiles["Physical Activity"] = {
            "percentile": round(physical_score, 1)
        }

    # --- Sleep Score (higher sleep = better) ---
    sleep_features = ["sleep_weekdays", "sleep_weekends"]
    if all(f in training_data.columns for f in sleep_features):
        sleep_vals = []
        for f in sleep_features:
            val = person_data[f]
            dist = training_data[f]
            sleep_vals.append((dist <= val).mean() * 100)
        sleep_score = np.mean(sleep_vals)
        percentiles["Sleep Quality"] = {
            "percentile": round(sleep_score, 1)
        }

    # --- Smokers Score (lower values = healthier) ---
    smoke_features = ["smoked_100_cigarettes", "smoke", "tobacco"]
    if all(f in training_data.columns for f in smoke_features):
        smoker_vals = []
        for f in smoke_features:
            val = float(person_data[f])
            dist = pd.to_numeric(training_data[f], errors='coerce').fillna(0)
            smoker_vals.append((dist >= val).mean() * 100)  # lower value = better, so invert
        smokers_score = np.mean(smoker_vals)
        percentiles["Smoking Habits"] = {
            "percentile": round(smokers_score, 1)
        }

    # --- Blood Pressure (lower = healthier) ---
    if "blood_pressure" in training_data.columns:
        val = float(person_data["blood_pressure"])
        dist = pd.to_numeric(training_data["blood_pressure"], errors='coerce')
        bp_percentile = (dist >= val).mean() * 100
        percentiles["Blood Pressure"] = {
            "percentile": round(bp_percentile, 1)
        }

    # --- Cholesterol (lower = healthier) ---
    if "cholesterol" in training_data.columns:
        val = float(person_data["cholesterol"])
        dist = pd.to_numeric(training_data["cholesterol"], errors='coerce')
        chol_percentile = (dist >= val).mean() * 100
        percentiles["Cholesterol"] = {
            "percentile": round(chol_percentile, 1)
        }

    # --- BMI (lower within healthy range = better) ---
    if "BMI" in training_data.columns and "BMI" in person_data:
        val = person_data["BMI"]
        dist = training_data["BMI"]
        bmi_percentile = (dist >= val).mean() * 100  # lower BMI is generally healthier
        percentiles["BMI"] = {
            "percentile": round(bmi_percentile, 1)
        }
    
    return percentiles

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Server is running", "message": "Hello from backend"})

@app.route('/test', methods=['POST'])
def test_endpoint():
    data = request.get_json()
    print("Received data:", data)
    return jsonify({"status": "success", "received": data})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from request
        data = request.get_json()
        print("Received prediction request:", data)
        
        # Calculate BMI if not provided
        if 'BMI' not in data or not data['BMI']:
            weight = float(data["weight"])
            height = float(data["height"])
            data["BMI"] = weight / ((height / 100) ** 2)
        
        # Convert to DataFrame for model prediction
        person_df = pd.DataFrame([data])
        
        # Load model and predict
        pipeline = load_model()
        predicted_age = float(pipeline.predict(person_df)[0])
        
        # Calculate percentiles
        percentiles = calculate_percentiles(data, predicted_age)
        
        # Return prediction and percentiles
        return jsonify({
            "status": "success",
            "predicted_age": round(predicted_age, 1),
            "percentiles": percentiles
        })
    
    except Exception as e:
        import traceback
        print("Error in prediction:", str(e))
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
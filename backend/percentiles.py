import pandas as pd
import numpy as np
import pickle

# Load saved pipeline
with open("./backend/model.pkl", "rb") as f:
    pipeline = pickle.load(f)

# Sample input
sample_data = {
    "Gender": "1",
    "blood_pressure": "2.0",
    "cholesterol": "2.0",
    "diabetes": "2.0",
    "mins_sedentary": 300.0,
    "freq_moderate_activity": 5.0,
    "freq_intense_activity": 5.0,
    "smoked_100_cigarettes": "2.0",
    "smoke": "3.0",
    "tobacco": "2.0",
    "sleep_weekdays": 7.0,
    "sleep_weekends": 9.0,
    "weight": 70.0,
    "height": 165.0,
    "BMI": None
}

# Calculate BMI
weight = sample_data["weight"]
height = sample_data["height"]
sample_data["BMI"] = weight / ((height / 100) ** 2)

# Convert to DataFrame
person_df = pd.DataFrame([sample_data])

# Predict biological age
predicted_age = pipeline.predict(person_df)[0]
print(f"Predicted biological age: {predicted_age:.2f}")
print("\nInput data:")
print(person_df.T)

# Load training data
training_data = pd.read_csv("./backend/merged.csv")

print("\nHealth-Oriented Percentile Rankings:")
print("--------------------------------------")

# --- Physical Health: activity ↑, sedentary ↓ ---
phys_good = ["freq_moderate_activity", "freq_intense_activity"]
phys_bad = ["mins_sedentary"]
if all(f in training_data.columns for f in phys_good + phys_bad):
    good_vals = []
    for f in phys_good:
        val = sample_data[f]
        dist = training_data[f]
        good_vals.append((dist <= val).mean() * 100)  # higher = better

    for f in phys_bad:
        val = sample_data[f]
        dist = training_data[f]
        good_vals.append((dist >= val).mean() * 100)  # lower = better

    physical_score = np.mean(good_vals)
    print(f"Physical Activity Score: {physical_score:.1f}% (higher = more active, less sedentary)")

# --- Sleep Score (higher sleep = better) ---
sleep_features = ["sleep_weekdays", "sleep_weekends"]
if all(f in training_data.columns for f in sleep_features):
    sleep_vals = []
    for f in sleep_features:
        val = sample_data[f]
        dist = training_data[f]
        sleep_vals.append((dist <= val).mean() * 100)
    sleep_score = np.mean(sleep_vals)
    print(f"Sleep Score: {sleep_score:.1f}% (higher = more sleep)")

# --- Smokers Score (lower values = healthier) ---
smoke_features = ["smoked_100_cigarettes", "smoke", "tobacco"]
if all(f in training_data.columns for f in smoke_features):
    smoker_vals = []
    for f in smoke_features:
        val = float(sample_data[f])
        dist = pd.to_numeric(training_data[f], errors='coerce').fillna(0)
        smoker_vals.append((dist >= val).mean() * 100)  # lower = healthier
    smokers_score = np.mean(smoker_vals)
    print(f"Smokers Score: {smokers_score:.1f}% (higher = smoked less)")

# --- Blood Pressure (lower = healthier) ---
if "blood_pressure" in training_data.columns:
    val = float(sample_data["blood_pressure"])
    dist = pd.to_numeric(training_data["blood_pressure"], errors='coerce')
    percentile = (dist >= val).mean() * 100
    print(f"Blood Pressure Score: {percentile:.1f}% (higher = healthier)")

# --- Cholesterol (lower = healthier) ---
if "cholesterol" in training_data.columns:
    val = float(sample_data["cholesterol"])
    dist = pd.to_numeric(training_data["cholesterol"], errors='coerce')
    percentile = (dist >= val).mean() * 100
    print(f"Cholesterol Score: {percentile:.1f}% (higher = healthier)")

# --- Alcohol (lower frequency = healthier) ---
if "freq_alcohol" in training_data.columns:
    val = sample_data["freq_alcohol"]
    dist = pd.to_numeric(training_data["freq_alcohol"], errors='coerce')
    percentile = (dist >= val).mean() * 100
    print(f"Alcohol Use Score: {percentile:.1f}% (higher = drink less frequently)")

# --- BMI (lower within healthy range = better) ---
if "BMI" in training_data.columns:
    val = sample_data["BMI"]
    dist = training_data["BMI"]
    percentile = (dist >= val).mean() * 100
    print(f"BMI Score: {percentile:.1f}% (higher = healthier BMI)")
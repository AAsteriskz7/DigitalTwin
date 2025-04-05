import pandas as pd
import numpy as np
import pickle

# Load saved pipeline
with open("./backend/model.pkl", "rb") as f:
    pipeline = pickle.load(f)

# Define fixed values for each feature that can be easily modified
sample_data = {
    "Gender": "1",
    "blood_pressure": "1",
    "cholesterol": "1",
    "diabetes": "1",
    "mins_sedentary": 480,
    "freq_moderate_activity": 30,
    "freq_intense_activity": 15,
    "smoked_100_cigarettes": "1",
    "smoke": "1",
    "tobacco": "1",
    "weight_loss": "1",
    "freq_alcohol": 2,
    "freq_physical_activity": 3,
    "sleep_weekdays": 7.5,
    "sleep_weekends": 8.0,
    "weight": 180.0,
    "height": 70.0,
    "BMI": None
}

# Calculate BMI
weight = sample_data["weight"]
height = sample_data["height"]
sample_data["BMI"] = 703 * weight / (height ** 2)

# Convert to DataFrame
person_df = pd.DataFrame([sample_data])

# Predict biological age
predicted_age = pipeline.predict(person_df)[0]
print(f"Predicted biological age: {predicted_age:.2f}")
print("\nInput data:")
print(person_df.T)

# Load original training data to calculate percentiles
training_data = pd.read_csv("./backend/merged.csv")

# Identify categorical and numerical features
categorical_features = ['Gender', 'blood_pressure', 'cholesterol', 'diabetes', 
                        'smoked_100_cigarettes', 'smoke', 'tobacco', 'weight_loss']
numerical_features = [col for col in sample_data.keys() 
                    if col not in categorical_features and col != 'BMI']

# [HIGHLIGHT] Convert "Missing" entries to NaN and convert categorical features to numeric.
for col in categorical_features:
    if col in training_data.columns:
        training_data[col] = pd.to_numeric(training_data[col], errors='coerce')

print("\nPercentile Rankings (compared to population):")
print("----------------------------------------------")

# For numerical features
for feature in numerical_features:
    if feature in training_data.columns:
        value = sample_data[feature]
        percentile = 100 * (training_data[feature] <= value).mean()
        print(f"{feature}: {value} (Percentile: {percentile:.1f}%)")

# For categorical features
for feature in categorical_features:
    if feature in training_data.columns:
        value = sample_data[feature]
        try:
            # [HIGHLIGHT] Convert sample categorical value to float for proper comparison.
            numeric_value = float(value)
            percentage = 100 * (training_data[feature] == numeric_value).mean()
            print(f"{feature}: {value} (Percentage of population with same value: {percentage:.1f}%)")
        except ValueError:
            # Fallback to string comparison if conversion fails
            percentage = 100 * (training_data[feature] == value).mean()
            print(f"{feature}: {value} (Percentage of population with same value: {percentage:.1f}%)")

# BMI percentile (calculated field)
if 'BMI' in training_data.columns:
    bmi_value = sample_data['BMI']
    bmi_percentile = 100 * (training_data['BMI'] <= bmi_value).mean()
    print(f"BMI: {bmi_value:.1f} (Percentile: {bmi_percentile:.1f}%)")
else:
    # Calculate BMI for training data if not already present
    training_data['BMI'] = 703 * training_data['weight'] / (training_data['height'] ** 2)
    bmi_value = sample_data['BMI']
    bmi_percentile = 100 * (training_data['BMI'] <= bmi_value).mean()
    print(f"BMI: {bmi_value:.1f} (Percentile: {bmi_percentile:.1f}%)")
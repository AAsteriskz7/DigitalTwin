import pandas as pd
import numpy as np

input_files = [
    "./backend/csv/alcohol.csv",
    "./backend/csv/blood_cholesterol.csv",
    "./backend/csv/demographics.csv",
    "./backend/csv/diabetes.csv",
    "./backend/csv/physical_activity.csv",
    "./backend/csv/sleep.csv",
    "./backend/csv/smoking.csv",
    "./backend/csv/tobacco.csv",
    "./backend/csv/weight.csv",
]

output_file = "./backend/merged.csv"

column_rename_map = {
    "SEQN": "ID",
    "RIDAGEYR": "Age",
    "ALQ121": "freq_alcohol",
    "BPQ020": "blood_pressure",
    "BPQ080": "cholesterol",
    "DIQ010": "diabetes",
    "PAD790Q": "freq_moderate_activity",
    "PAD810Q": "freq_intense_activity",
    "PAD680": "mins_sedentary",
    "SLD012": "sleep_weekdays",
    "SLD013": "sleep_weekends",
    "SMQ020": "smoked_100_cigarettes",
    "SMQ040": "smoke",
    "SMQ681": "tobacco",
    "WHD010": "weight",
    "WHQ070": "weight_loss",
    "WHD020": "RIAGENDR": "Gender",
    "height",
}

# Read CSV files with dtype=str so that invalid markers (e.g. ".") remain as strings.
merged_df = pd.read_csv(input_files[0], dtype=str)
for f in input_files[1:]:
    df = pd.read_csv(f, dtype=str)
    merged_df = pd.merge(merged_df, df, on="SEQN", how="inner")

# Keep only the columns specified in the rename map and rename them.
merged_df = merged_df[list(column_rename_map.keys())]
merged_df.rename(columns=column_rename_map, inplace=True)

# Define invalid codes for each column based on comments.
invalid_codes = {
    "Gender": [".",],
    "Age": [".",],
    "freq_alcohol": ["77", "99", "."],
    "blood_pressure": ["7.0", "9.0", "."],
    "cholesterol": ["7.0", "9.0", "."],
    "diabetes": ["7.0", "9.0", "."],
    "freq_moderate_activity": ["7777", "9999", "."],
    "freq_intense_activity": ["7777", "9999", "."],
    "mins_sedentary": ["7777", "9999", "."],
    "sleep_weekdays": ["."],
    "sleep_weekends": ["."],
    "smoked_100_cigarettes": ["7.0", "9.0", "."],
    "smoke": ["7.0", "9.0", "."],
    "tobacco": ["7.0", "9.0", "."],
    "weight": ["7777", "9999", "."],
    "weight_loss": ["7.0", "9.0", "."],
    "height": ["7777", "9999", "."],
}

# Define categorical and numeric columns
categorical_cols = ["Gender", "blood_pressure", "cholesterol", "diabetes", "smoked_100_cigarettes", "smoke", "weight_loss", "tobacco"]
numeric_cols = ["Age", "freq_alcohol", "freq_moderate_activity", "freq_intense_activity", "mins_sedentary", "sleep_weekdays", 
                "sleep_weekends", "weight", "height"]

# Replace invalid codes with NaN and convert the columns to appropriate types
for col, codes in invalid_codes.items():
    if col in merged_df.columns:
        merged_df[col] = merged_df[col].replace(codes, np.nan)
        
# Convert to appropriate type AFTER replacing invalid values
for col in merged_df.columns:
    if col == "ID":  # Skip ID column
        continue
    elif col in numeric_cols:
        merged_df[col] = pd.to_numeric(merged_df[col], errors="coerce")

# Fill missing values: -1 for numeric, "Missing" for categorical
for col in merged_df.columns:
    if col == "ID":  # Skip ID column
        continue
    elif col in categorical_cols:
        merged_df[col] = merged_df[col].fillna("Missing")
    else:  # Numeric columns
        merged_df[col] = merged_df[col].fillna(-1)

# Compute BMI using weight (lb) and height (in):
# Convert weight to kilograms: weight (kg) = weight (lb) / 2.205
# Convert height to meters: height (m) = height (in) * 0.0254
# Handle cases where weight or height might be -1 (missing)
weight_mask = merged_df["weight"] > 0
height_mask = merged_df["height"] > 0
valid_mask = weight_mask & height_mask

# Initialize BMI column with -1 (missing)
merged_df["BMI"] = -1

# Calculate BMI only for rows with valid weight and height
merged_df.loc[valid_mask, "BMI"] = (
    (merged_df.loc[valid_mask, "weight"] / 2.205) / 
    ((merged_df.loc[valid_mask, "height"] * 0.0254) ** 2)
)

# Optionally drop the original weight and height columns.
merged_df.drop(["weight", "height"], axis=1, inplace=True)

# Save the cleaned merged DataFrame (with BMI) to CSV.
merged_df.to_csv(output_file, index=False)
print(f"Merged CSV saved as {output_file}")
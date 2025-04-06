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
    "RIAGENDR": "Gender",
    "RIDAGEYR": "Age",
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
    "WHD020": "height"
}

merged_df = pd.read_csv(input_files[0], dtype=str)
for f in input_files[1:]:
    df = pd.read_csv(f, dtype=str)
    merged_df = pd.merge(merged_df, df, on="SEQN", how="inner")

merged_df = merged_df[list(column_rename_map.keys())]
merged_df.rename(columns=column_rename_map, inplace=True)

invalid_codes = {
    "Gender": [".",],
    "Age": [".",],
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
    "height": ["7777", "9999", "."],
}

categorical_cols = [
    "Gender", "blood_pressure", "cholesterol", "diabetes",
    "smoked_100_cigarettes", "smoke", "tobacco"
]
numeric_cols = [
    "Age", "freq_moderate_activity", "freq_intense_activity",
    "mins_sedentary", "sleep_weekdays", "sleep_weekends", "weight", "height"
]

for col, codes in invalid_codes.items():
    if col in merged_df.columns:
        merged_df[col] = merged_df[col].replace(codes, np.nan)
        
for col in merged_df.columns:
    if col == "ID":
        continue
    elif col in numeric_cols:
        merged_df[col] = pd.to_numeric(merged_df[col], errors="coerce")

for col in merged_df.columns:
    if col == "ID":
        continue
    elif col in categorical_cols:
        if col in ["smoked_100_cigarettes", "tobacco"]:
            merged_df[col] = merged_df[col].fillna("2.0")
        elif col == "smoke":
            merged_df[col] = merged_df[col].fillna("3.0")
        else:
            merged_df[col] = merged_df[col].fillna("Missing")
    else:
        merged_df[col] = merged_df[col].fillna(-1)

for col in categorical_cols:
    merged_df[col] = merged_df[col].astype(str)

weight_mask = merged_df["weight"] > 0
height_mask = merged_df["height"] > 0
valid_mask = weight_mask & height_mask

merged_df["BMI"] = -1
merged_df.loc[valid_mask, "BMI"] = (
    merged_df.loc[valid_mask, "weight"] / ((merged_df.loc[valid_mask, "height"] / 100) ** 2)
)


merged_df.to_csv(output_file, index=False)
print(f"Merged CSV saved as {output_file}")
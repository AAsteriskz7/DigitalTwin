import pandas as pd
import numpy as np
import os

# File mapping: {input xpt name (without _L.xpt): output csv name}
file_map = {
    "ALQ": "alcohol.csv",
    "BPQ": "blood_cholesterol.csv",
    "DEMO": "demographics.csv",
    "DIQ": "diabetes.csv",
    "PAQ": "physical_activity.csv",
    "SLQ": "sleep.csv",
    "SMQ": "smoking.csv",
    "SMQRTU": "tobacco.csv",
    "WHQ": "weight.csv",
}

input_dir = "./backend/xpt/"
output_dir = "./backend/csv/"
os.makedirs(output_dir, exist_ok=True)

for prefix, output_file in file_map.items():
    input_path = os.path.join(input_dir, f"{prefix}_L.xpt")
    output_path = os.path.join(output_dir, output_file)

    df = pd.read_sas(input_path)

    # Replace tiny float placeholders for SAS missing values
    df = df.applymap(lambda x: np.nan if isinstance(x, float) and abs(x) < 1e-10 else x)

    df.to_csv(output_path, index=False)
    print(f"Saved: {output_path}")
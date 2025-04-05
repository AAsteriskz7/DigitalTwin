import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from xgboost import XGBRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle

# Load the merged CSV file (assumed to be created from your previous code)
df = pd.read_csv("./backend/merged.csv")
initial_count = len(df)

# No need to drop NA rows since we've filled them with -1 or "Missing"
# But we will still drop any unforeseen NAs
df = df.dropna()

# Identify categorical columns based on data types and values
categorical_cols = ['Gender', 'blood_pressure', 'cholesterol', 'diabetes', 'smoked_100_cigarettes', 'smoke', 'tobacco', 'weight_loss']
# Ensure categorical columns are treated as category type
for col in categorical_cols:
    if col in df.columns:
        df[col] = df[col].astype('category')

# Print value counts for categorical columns to verify "Missing" values
for col in categorical_cols:
    if col in df.columns:
        print(f"\nValue counts for {col}:")
        print(df[col].value_counts())

# Define the target and features.
# Exclude 'Age' (target) and 'ID' (identifier) from features.
X = df.drop(["Age", "ID"], axis=1)
y = df["Age"]

# Get numerical columns
numerical_cols = [col for col in X.columns if col not in categorical_cols]

# Create preprocessor for categorical and numerical features
# Using handle_unknown='ignore' to handle any new categories at prediction time
preprocessor = ColumnTransformer(
    transformers=[
        ('num', 'passthrough', numerical_cols),
        ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_cols)
    ],
    remainder='drop'
)

# Split data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train the pipeline
# XGBoost naturally handles -1 values as a special case
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', XGBRegressor(
        random_state=42, 
        n_estimators=100,
        learning_rate=0.1,
        missing=-1
    ))
])

pipeline.fit(X_train, y_train)

# Extract the trained model from pipeline
model = pipeline.named_steps['model']

# Predict Age on the test set
y_pred = pipeline.predict(X_test)

# Calculate RMSE (Root Mean Squared Error)
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
print("\nRMSE:", rmse)

# Get feature names after one-hot encoding
cat_features = pipeline.named_steps['preprocessor'].transformers_[1][1].get_feature_names_out(categorical_cols)
all_features = numerical_cols + list(cat_features)

# Print feature importances with proper names
print("\nFeature Importances:")
importances = model.feature_importances_
for feature, importance in zip(all_features, importances):
    print(f"{feature}: {importance:.4f}")

# Save the trained pipeline to a file
model_filename = "./backend/model.pkl"
with open(model_filename, "wb") as f:
    pickle.dump(pipeline, f)
print(f"\nModel saved as {model_filename}")
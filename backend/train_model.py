import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from xgboost import XGBRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle

df = pd.read_csv("./merged.csv")
initial_count = len(df)

df = df.dropna()

categorical_cols = ['Gender', 'blood_pressure', 'cholesterol', 'diabetes', 
                    'smoked_100_cigarettes', 'smoke', 'tobacco']

for col in categorical_cols:
    if col in df.columns:
        df[col] = df[col].astype(str).replace("nan", "Missing")
        df[col] = df[col].astype('category')

for col in categorical_cols:
    if col in df.columns:
        print(f"\nValue counts for {col}:")
        print(df[col].value_counts())

X = df.drop(["Age", "ID", "height", "weight"], axis=1)
y = df["Age"]

numerical_cols = [col for col in X.columns if col not in categorical_cols]

preprocessor = ColumnTransformer(
    transformers=[
        ('num', 'passthrough', numerical_cols),
        ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_cols)
    ],
    remainder='drop'
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

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

model = pipeline.named_steps['model']

y_pred = pipeline.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
print("\nRMSE:", rmse)

cat_features = pipeline.named_steps['preprocessor'].transformers_[1][1].get_feature_names_out(categorical_cols)
all_features = numerical_cols + list(cat_features)

print("\nFeature Importances:")
importances = model.feature_importances_
for feature, importance in zip(all_features, importances):
    print(f"{feature}: {importance:.4f}")

model_filename = "./model.pkl"
with open(model_filename, "wb") as f:
    pickle.dump(pipeline, f)
print(f"\nModel saved as {model_filename}")

n_examples = 5
X_val_examples = X_test.iloc[:n_examples]
y_true_examples = y_test.iloc[:n_examples]
y_pred_examples = y_pred[:n_examples]

print("\nValidation set examples (first {} rows):".format(n_examples))
for i in range(n_examples):
    print(f"\nExample {i+1}:")
    print("Input features:")
    print(X_val_examples.iloc[i].to_dict())
    print(f"True Age: {y_true_examples.iloc[i]}")
    print(f"Predicted Age: {y_pred_examples[i]:.2f}")
import pandas as pd

df = pd.read_sas("DEMO_L.xpt")
print(df.head())
print(len(df))

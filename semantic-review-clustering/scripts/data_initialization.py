import pandas as pd
from google.colab import drive

def initDataFrame():
  drive.mount('/content/drive')
  df = pd.read_csv(
    "/content/drive/MyDrive/WhatsApp_reviews.csv")
  return df
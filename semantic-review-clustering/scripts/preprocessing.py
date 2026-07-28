import re

def preProcessDataset(df):

  # Drop Columns

  # Dropping rows with nullable for columm: content
  df = df.dropna(subset=["content"])
  df = df[df["content"].str.strip() != ""]

  # Remove rows with content < 4 words
  df["content"] = df["content"].apply(clean_text)
  df = df[df["content"].str.split().str.len() >= 4]

  # Dropping rows with duplicates for columm: content
  df = df.drop_duplicates(subset=["content"])  
  df = df.reset_index(drop=True)

  return df


def clean_text(t):
    t = str(t).strip()
    t = re.sub(r'http\S+|www\.\S+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t
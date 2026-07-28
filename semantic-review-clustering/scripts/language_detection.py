import fasttext

model = fasttext.load_model("lid.176.ftz")

def languageDetection(text):
    text = str(text)
    text = text.replace("\n", " ").replace("\r", " ")
    label, _ = model.predict(text)
    return label[0].replace("__label__", "")

def applyLanguageDetection(df):
  df["language"] = df["content"].apply(languageDetection)
  return df
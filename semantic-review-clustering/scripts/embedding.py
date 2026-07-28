from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-mpnet-base-v2")

def embedData(data):
  embeddings = model.encode(
    data.tolist(),
    normalize_embeddings=True,
    show_progress_bar=True
  )
  return embeddings
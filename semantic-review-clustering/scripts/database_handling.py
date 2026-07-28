import chromadb

def handleDatabase(df, embeddings):

    client = chromadb.Client()
    try:
        client.delete_collection("reviews")
    except:
        pass

    collection = client.get_or_create_collection("reviews")

    ids = df["reviewId"].astype(str).tolist()
    list_embeddings = embeddings.tolist()

    metadatas = [
        {
            "score": int(row["score"]),
            "content": row["content"],
            "language": row["language"]
        }
        for _, row in df.iterrows()
    ]

    batch_size = 5000

    for i in range(0, len(ids), batch_size):
        collection.add(
            ids=ids[i:i + batch_size],
            embeddings=list_embeddings[i:i + batch_size],
            metadatas=metadatas[i:i + batch_size]
        )

    print(f"Inserted {len(ids)} reviews.")
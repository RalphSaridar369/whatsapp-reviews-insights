# WhatsApp Review Clustering

A pipeline that clusters WhatsApp reviews by topic to surface common themes and user feedback patterns.

## What it does

- **Language detection** — flags each review's language to handle multilingual data
- **Embedding** — converts review text into vector embeddings using sentence-transformers
- **Vector storage** — stores embeddings in ChromaDB
- **Topic clustering** — clusters reviews using BERTopic (UMAP for dimensionality reduction + HDBSCAN for clustering)
- **Cluster summarization** — generates a natural-language description for each topic using an LLM
- **Export** — outputs cluster info and average scores to an Excel file

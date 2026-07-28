from bertopic.representation import KeyBERTInspired, MaximalMarginalRelevance
from bertopic import BERTopic
from embedding import model

def createTopicModel(umap_model, hdbscan_model, vectorizer_model, ctfidf_model):
  representation_model = {
      "KeyBERT": KeyBERTInspired(),
      "MMR": MaximalMarginalRelevance(diversity=0.3),
  }

  topic_model = BERTopic(
      embedding_model=model,
      umap_model=umap_model,
      hdbscan_model=hdbscan_model,
      vectorizer_model=vectorizer_model,
      ctfidf_model=ctfidf_model,
      representation_model=representation_model,
      calculate_probabilities=False,
      verbose=True,
  )

  return topic_model
# Using: HDBSCAN
from bertopic.vectorizers import ClassTfidfTransformer
from umap import UMAP
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS

def clusterData():
  umap_model = UMAP(
      n_neighbors=20,
      n_components=10,
      min_dist=0.0,
      metric="cosine",
      random_state=42
  )

  # min_cluster_size controls how many topics you end up with.
  # Bigger min_cluster_size -> fewer, larger clusters. Tune this to land in 50-100.
  hdbscan_model = HDBSCAN(
      min_cluster_size=15,
      min_samples=1,
      cluster_selection_method="eom",
      cluster_selection_epsilon=0.15,
      prediction_data=True
  )

  domain_generic = [
      # App name + misspellings/variants (very common in scraped reviews)
      'whatsapp', 'whatsap', 'whastapp', 'whatsaap', 'whatsup', 'whattsapp',
      'wa', 'whatsapp\'s', 'meta',
      'app', 'apps', 'application', 'applications',

      # Core generic nouns/verbs about the product (appear in nearly every review regardless of topic)
      'message', 'messages', 'messaging', 'messaged', 'msg', 'msgs',
      'chat', 'chats', 'chatting', 'chatted',
      'call', 'calls', 'calling', 'called', 'caller',
      'video', 'voice', 'text', 'texts', 'texting', 'texted',
      'group', 'groups', 'contact', 'contacts', 'status',
      'send', 'sending', 'sent', 'receive', 'receiving', 'received',
      'notification', 'notifications', 'notify',

      # Generic usage verbs (say nothing about WHAT the issue/praise is)
      'use', 'using', 'used', 'user', 'users', 'usage',
      'download', 'downloading', 'downloaded', 'install', 'installing', 'installed',
      'update', 'updating', 'updated', 'version',
      'open', 'opening', 'opened', 'work', 'working', 'works',

      # Backup / account generic terms (only strip if not analyzing these specifically)
      'backup', 'restore', 'account', 'number', 'phone number',
      'verify', 'verification', 'otp', 'sim',

      # Platform / device generic terms (only useful if you're not analyzing platform-specific issues)
      'phone', 'mobile', 'device', 'android', 'ios', 'iphone', 'smartphone',
      'store', 'playstore', 'google', 'apple', 'web', 'desktop', 'pc', 'laptop',

      # Time fillers, very common in reviews, add no topic signal
      'day', 'days', 'time', 'times', 'now', 'today', 'daily', 'always', 'every',
      'year', 'years', 'month', 'months', 'hour', 'hours', 'minute', 'minutes', 'second', 'seconds',

      # Generic filler / hedge words common in review text
      'like', 'just', 'really', 'very', 'much', 'lot', 'lots',
      'thing', 'things', 'way', 'ways', 'people', 'friend', 'friends', 'family',
      'thank', 'thanks', 'please', 'pls', 'plz',

      # Sentiment adjectives
      'good', 'nice', 'best', 'great', 'awesome', 'excellent', 'super', 'superb',
      'love', 'loved', 'loving', 'amazing', 'wow', 'fine', 'ok', 'okay', 'nyc',
      'wonderful', 'perfect', 'fantastic', 'cool', 'bad', 'worst', 'poor',
  ]

  # Contraction fragments that survive tokenization (e.g. "haven't" -> "haven", "t")
  contraction_fragments = [
      've', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn',
      'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan',
      'shouldn', 'wasn', 'weren', 'won', 'wouldn', 't', 's', 're', 'll', 'd', 'm'
  ]

  all_stopwords = list(set(domain_generic) | set(ENGLISH_STOP_WORDS) | set(contraction_fragments))

  vectorizer_model = CountVectorizer(stop_words=all_stopwords, ngram_range=(1, 2), min_df=2)
  ctfidf_model = ClassTfidfTransformer(reduce_frequent_words=True)

  return umap_model, hdbscan_model, vectorizer_model, ctfidf_model

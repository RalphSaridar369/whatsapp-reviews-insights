# Reviews Clustering

A pipeline for semantically clustering app reviews (e.g. WhatsApp Play Store reviews) using multilingual sentence embeddings, UMAP dimensionality reduction, HDBSCAN clustering, and BERTopic — with LLM-generated cluster descriptions and an Excel report as the final output.

## What it does

Given a raw dataset of app reviews (`reviewId`, `content`, `score`), the notebook:

1. Cleans and deduplicates the data
2. Detects the language of each review
3. Embeds review text into dense vectors
4. Stores the embeddings in a vector database
5. Clusters semantically similar reviews together using BERTopic (UMAP + HDBSCAN)
6. Generates a human-readable description for each cluster/topic via an LLM
7. Computes the average rating per cluster
8. Exports the full analysis to an `.xlsx` report

The goal is to turn thousands of unstructured, multi-language user reviews into a small set of interpretable themes (e.g. "account access issues," "positive feedback on performance," "spam/ad complaints") ranked by size and average score.

## Pipeline

The notebook itself only *orchestrates* the pipeline — each step calls one function from a helper module that lives outside the notebook, at `/content/drive/MyDrive/Colab_Notebooks/reviews_clustering_python_files/` (mounted Google Drive). The notebook does not contain the internal source of these modules, so the descriptions below combine what's directly visible in the notebook (function calls, comments, printed/cell outputs) with the standard behavior of the libraries each step relies on. Where a detail is inferred rather than shown explicitly, it's noted as such.

### Step 0 — Environment setup
```python
!pip install numpy==1.26.4 --force-reinstall
!pip install umap-learn hdbscan
!pip install fasttext-wheel --no-cache-dir
!wget https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz
!pip install sentence-transformers chromadb bertopic
```
Installs every library the pipeline depends on and downloads `lid.176.ftz`, Facebook's pretrained FastText language-identification model (176 languages), used later in Step 3. `numpy` is pinned to `1.26.4` because several of these libraries (UMAP, HDBSCAN, sentence-transformers) are sensitive to NumPy's ABI and can break on newer 2.x releases. The Drive helper-module path is then appended to `sys.path` so the custom modules (`data_initialization`, `preprocessing`, etc.) can be imported like normal Python packages.

### Step 1 — Load the data
```python
from data_initialization import initDataFrame
df = initDataFrame()
```
Loads the raw review dataset into a pandas DataFrame. In the reference run, `initDataFrame()` returns 10,000 rows with three columns: `reviewId` (unique string ID), `content` (the review text), and `score` (1–5 star rating). The notebook inspects this with `df.head()`, `df.info()`, and `df.columns` to confirm the shape and types before doing anything else — a sanity check rather than a transformation step.

### Step 2 — Preprocessing
```python
from preprocessing import preProcessDataset
df = preProcessDataset(df)
```
Cleans the raw DataFrame. Per the author's own note in the notebook, this covers:
- **Removing duplicates** — identical reviews collapsed to one row
- **Removing nullables** — rows with missing `content` (the `info()` output shows 1 null out of 10,000 in `content`) are dropped
- **Removing useless columns** — any columns not needed downstream (only `reviewId`, `content`, `score` are used later)

This is a data-quality step: clustering and embedding are sensitive to empty strings, near-duplicate spam, and null values, so cleaning happens before any NLP work.

### Step 3 — Language detection
```python
from language_detection import applyLanguageDetection
df = applyLanguageDetection(df)
```
Adds a `language` column to the DataFrame, most likely computed by running each review's `content` through the FastText `lid.176.ftz` model downloaded in Step 0 (FastText's language-ID model is the standard tool for this, and it's the only language-related asset installed in the notebook). The author explicitly flags in a markdown cell that this step exists because the dataset turned out to be **multilingual** — the resulting `value_counts()` shows the reviews span roughly 40 languages (English dominant at ~3,699 of 3,927 remaining rows, followed by Italian, Indonesian, Spanish, German, Arabic, Farsi, and many others with only a handful of reviews each). Having a `language` tag lets later steps or reviewers filter/interpret clusters with language in mind, since a multilingual embedding model is used rather than an English-only one.

### Step 4 — Embedding
```python
from embedding import embedData
embeddings = embedData(df["content"])
```
Converts each review's text into a dense numeric vector using a `sentence-transformers` model (the notebook's dependency list and the HuggingFace model-download logs in Step 0's execution confirm a sentence-transformers checkpoint is loaded). The output is a NumPy array of shape `(3927, 768)` — one 768-dimensional embedding per review, consistent with a base-sized transformer (e.g. an `all-mpnet-base-v2`-class or multilingual equivalent model, given the multilingual dataset). The notebook validates the embeddings afterward by checking their value range (`min ≈ -0.216`, `max ≈ 0.211`, `std ≈ 0.036`) and spot-checking cosine similarity between a few review pairs — a quick smoke test that the vectors are meaningful (similar reviews should have higher cosine similarity) before spending time clustering them.

### Step 5 — Store in a vector database
```python
from database_handling import handleDatabase
handleDatabase(df, embeddings)
```
Persists each review (its metadata plus its embedding) into a vector database — `chromadb`, per the installed dependency. The cell output confirms `Inserted 3927 reviews.` This makes the embeddings queryable/reusable later (e.g. semantic search, nearest-neighbor lookups, or avoiding recomputing embeddings on reruns) independent of the in-memory clustering that follows.

### Step 6 — Build the clustering models
```python
from clustering import clusterData
umap_model, hdbscan_model, vectorizer_model, ctfidf_model = clusterData()
```
Constructs (but doesn't yet fit) the four components BERTopic needs:
- **UMAP** — reduces the 768-dimensional embeddings to a lower-dimensional space where density-based clustering works well (HDBSCAN struggles in very high dimensions)
- **HDBSCAN** — the density-based clustering algorithm that actually groups reviews and naturally produces an "outlier" cluster (`-1`) for points that don't belong anywhere
- **Vectorizer model** (`CountVectorizer`-style) — builds the vocabulary used to describe each topic with keywords
- **c-TF-IDF model** — BERTopic's class-based TF-IDF, which scores words by how distinctive they are to *each cluster* rather than to each document, producing the keyword list per topic

#### 1. UMAP — Dimensionality Reduction

```python
umap_model = UMAP(
    n_neighbors=20,
    n_components=10,
    min_dist=0.0,
    metric="cosine",
    random_state=42
)
```

UMAP takes the 768-dimensional sentence embeddings and compresses them into a smaller space that preserves local structure well enough for density-based clustering to work.

| Parameter | Meaning | Why this value |
|---|---|---|
| `n_neighbors=20` | How many nearby points UMAP looks at when learning the local shape of the data. Small values (e.g. 5) focus on very fine-grained local structure; large values (e.g. 50+) favor global structure. | 20 is a common middle-ground for text embeddings — enough neighbors to smooth out noise in individual reviews, but not so many that small, meaningful topic clusters get blended into bigger ones. |
| `n_components=10` | The number of dimensions UMAP reduces down to (768 → 10). | 10 is a standard choice for BERTopic pipelines: high enough to retain topic-relevant structure, low enough that HDBSCAN (which degrades in high dimensions) can still find density-based clusters reliably. |
| `min_dist=0.0` | How tightly UMAP is allowed to pack points that are similar. `0.0` lets genuinely similar points sit right on top of each other. | Setting this to `0.0` is the standard BERTopic recommendation — it produces tighter, denser clusters in the reduced space, which is exactly what HDBSCAN needs to detect clusters by density. A higher `min_dist` would spread points out and make dense clusters harder to detect. |
| `metric="cosine"` | The distance function UMAP uses to compare points. | Sentence embeddings encode meaning mainly through *direction*, not magnitude, so cosine similarity (angle between vectors) is the standard metric for text embeddings — matching how the embeddings were validated in Step 0's cosine similarity smoke test. |
| `random_state=42` | Seed for UMAP's internal randomness (it uses stochastic optimization). | Fixes the seed so that reduction results — and therefore downstream clusters and topics — are reproducible across reruns. |

---

#### 2. HDBSCAN — Density-Based Clustering

```python
hdbscan_model = HDBSCAN(
    min_cluster_size=15,
    min_samples=1,
    cluster_selection_method="eom",
    cluster_selection_epsilon=0.15,
    prediction_data=True
)
```

HDBSCAN groups the UMAP-reduced points into clusters based on density, without requiring you to specify the number of clusters in advance. Points that don't belong to any dense region become "outliers" (labeled `-1`).

| Parameter | Meaning | Why this value |
|---|---|---|
| `min_cluster_size=15` | The minimum number of reviews required for a group to count as a valid cluster/topic. | This is the main lever for controlling how many topics you end up with. A larger value forces smaller clusters to merge or become outliers, producing fewer, broader topics; a smaller value allows more, narrower topics. The comment in the code notes this is the parameter to tune to land in the 50–100 topic range. |
| `min_samples=1` | Controls how conservative HDBSCAN is about calling a point "noise" (outlier). Low values make the algorithm more lenient — it needs less evidence of density to include a point in a cluster. | `1` is a permissive setting, meaning fewer reviews get discarded as outliers compared to the HDBSCAN default (which typically equals `min_cluster_size`). This favors assigning more reviews to *some* topic rather than leaving them unclustered — useful when you want broad topic coverage of the review set rather than only very "obvious" clusters. |
| `cluster_selection_method="eom"` | The strategy HDBSCAN uses to decide which clusters in its internal hierarchy to keep. `"eom"` (Excess of Mass) selects the most stable clusters across the density hierarchy, versus `"leaf"`, which selects the most fine-grained leaf clusters. | `"eom"` is the standard/default choice and tends to produce a smaller number of well-separated, stable topics rather than over-splitting into many small leaf-level clusters — good for interpretable topic modeling. |
| `cluster_selection_epsilon=0.15` | A distance threshold that merges clusters that are closer together than this value, preventing HDBSCAN from over-splitting near-duplicate or highly similar clusters. | Adding a nonzero epsilon is a common BERTopic tuning trick to reduce topic fragmentation — without it, EOM selection can sometimes produce many near-duplicate micro-topics; `0.15` merges those while still keeping genuinely distinct topics separate. |
| `prediction_data=True` | Tells HDBSCAN to retain the extra internal data structures needed to later predict cluster membership for *new*, unseen points (not just the points it was trained on). | Required by BERTopic so that after the model is fit, it can assign topics to new reviews (e.g. via `.transform()`) without having to refit the entire clustering model from scratch. |

---

#### 3. CountVectorizer — Topic Vocabulary Builder

```python
vectorizer_model = CountVectorizer(
    stop_words=all_stopwords,
    ngram_range=(1, 2),
    min_df=2
)
```

This doesn't affect clustering itself — it controls which words are eligible to appear in the keyword lists that describe each topic afterward.

| Parameter | Meaning | Why this value |
|---|---|---|
| `stop_words=all_stopwords` | A custom list of words to exclude entirely from topic keyword generation. | This is the union of three sets: (1) domain-generic terms like "whatsapp," "message," "call" that appear in nearly every review regardless of topic and would otherwise dominate every topic's keywords uselessly; (2) scikit-learn's standard English stop words (the, and, is, etc.); (3) contraction fragments (e.g., "haven," "t," "s") that result from tokenizing words like "haven't" into "haven" + "t." Removing all of these forces the topic keywords to reflect what's actually *distinctive* about each topic rather than words common to the whole corpus. |
| `ngram_range=(1, 2)` | Allows both single words (unigrams) and two-word phrases (bigrams) to be candidate keywords. | Bigrams often capture more specific, interpretable topic signals than single words alone — e.g. "battery drain" or "storage full" is far more informative than "battery" and "full" as separate keywords. |
| `min_df=2` | A word/phrase must appear in at least 2 different reviews to be considered part of the vocabulary. | Filters out one-off typos, rare terms, and noise that would otherwise clutter topic keyword lists without adding generalizable signal. |

---

#### 3b. The Custom Stop Word List (`all_stopwords`)

```python
domain_generic = [...]
contraction_fragments = [...]
all_stopwords = list(set(domain_generic) | set(ENGLISH_STOP_WORDS) | set(contraction_fragments))
```

This is worth its own breakdown, since it's doing more work than a typical stop word list — it's purpose-built for *this* dataset (WhatsApp reviews) rather than generic English text. The goal throughout is the same: prevent words that appear in nearly every review, regardless of topic, from crowding out the words that actually distinguish one topic from another.

| Category | Examples | Why it's excluded |
|---|---|---|
| **App name + misspellings** | `whatsapp`, `whatsap`, `whastapp`, `wa`, `meta` | Every single review is *about* WhatsApp, so the app's name (and its common typos/variants scraped from real user text) carries zero topic-distinguishing signal — it would top every topic's keyword list otherwise. |
| **Generic product nouns/verbs** | `message`, `chat`, `call`, `video`, `group`, `contact`, `status`, `send`, `notification` | These describe *what the app does* in general, not what a specific review is complaining/praising about. A review about slow message delivery and one about group video call bugs would both surface "message"/"call" as top keywords without adding useful distinction. |
| **Generic usage verbs** | `use`, `download`, `install`, `update`, `open`, `work`/`working` | Verbs describing the act of using an app in general — present in almost any app review regardless of subject matter. |
| **Backup/account terms** | `backup`, `restore`, `account`, `number`, `verify`, `otp`, `sim` | Flagged in the code as conditional — useful to *keep* if you specifically want to analyze backup/verification issues as their own topic, but excluded here because the goal is broader topic separation, not drilling into this one area. |
| **Platform/device terms** | `phone`, `android`, `ios`, `iphone`, `playstore`, `google`, `apple`, `desktop` | Similarly conditional — relevant if you want platform-specific topics (e.g. "iOS bugs" vs "Android bugs"), but excluded here so platform mentions don't dominate keyword lists over the actual issue being described. |
| **Time fillers** | `day`, `time`, `now`, `today`, `year`, `month`, `hour`, `minute` | Extremely common in review text ("it's been working great for months," "crashes every day") but carry no topical meaning on their own. |
| **Filler/hedge words** | `like`, `just`, `really`, `very`, `much`, `thing`, `way`, `people`, `thanks`, `please` | Common conversational padding in informal review writing — high frequency, no topic signal. |
| **Sentiment adjectives** | `good`, `great`, `awesome`, `love`, `amazing`, `bad`, `worst`, `poor` | These reflect *polarity* (positive/negative sentiment), not *topic*. Removing them stops every topic's keywords from being dominated by generic praise/complaint words, so keywords instead reflect *what* is being praised or complained about (a separate concern from sentiment analysis). |

#### `contraction_fragments`

```python
['ve', 'ain', 'aren', 'couldn', ..., 't', 's', 're', 'll', 'd', 'm']
```

When `CountVectorizer` tokenizes text, it typically splits on punctuation — so contractions like `haven't`, `can't`, `it's`, `I'll` get split into two tokens (e.g. `haven` + `t`, `it` + `s`). Without this list, those meaningless leftover fragments (`t`, `s`, `ve`, `haven`, `aren`, etc.) would appear as if they were real standalone words and pollute topic keyword lists. This list specifically mops up that tokenization artifact.

#### Why the union (`|`) of three sets?

```python
all_stopwords = list(set(domain_generic) | set(ENGLISH_STOP_WORDS) | set(contraction_fragments))
```

- `set(...)` converts each list to a set to dedupe and make the union operation efficient.
- `|` is a set union — the final stop word list is everything in *any* of the three lists, combined.
- The three sources cover three different failure modes: **domain-specific noise** (`domain_generic`), **generic English noise** (`ENGLISH_STOP_WORDS`, sklearn's built-in list of words like "the," "and," "is"), and **tokenization artifacts** (`contraction_fragments`). Combining them ensures the vectorizer's vocabulary is clean on all three fronts before c-TF-IDF ever scores a word.

---

#### 4. ClassTfidfTransformer — c-TF-IDF Scoring

```python
ctfidf_model = ClassTfidfTransformer(reduce_frequent_words=True)
```

This is BERTopic's "class-based" TF-IDF: instead of scoring words by how important they are to one *document*, it scores them by how important they are to one *cluster* (treating each cluster's combined text as a single "document") relative to all other clusters. This produces the final ranked keyword list per topic.

| Parameter | Meaning | Why this value |
|---|---|---|
| `reduce_frequent_words=True` | Applies an additional dampening (square-root scaling) to words that occur very frequently across many topics, reducing their influence on keyword rankings even if they weren't fully removed by the stop word list. | Acts as a second layer of defense against generic words leaking into topic keywords — catches terms that are common but weren't explicitly listed in `domain_generic`, keeping topic keyword lists sharper and more distinctive. |

---

### Summary

- **UMAP** shrinks 768-D embeddings to 10-D so density-based clustering is feasible.
- **HDBSCAN** finds the actual topic clusters based on density, with `min_cluster_size` as the primary knob for how many topics you get, and an outlier class (`-1`) for reviews that don't fit anywhere.
- **CountVectorizer** decides which words/phrases are even allowed to be candidate topic keywords, using a large custom stop-word list (see section 3b) that combines app-specific noise, generic English stop words, and tokenization artifacts — tailored to this WhatsApp review dataset.
- **ClassTfidfTransformer** ranks those candidate words per topic using class-based TF-IDF, with extra dampening for words that are frequent across many topics.

Together, these four components are the building blocks BERTopic assembles into its pipeline — they're constructed here but not yet `.fit()` on the actual embeddings.


### Step 7 — Fit the topic model
```python
from topic_modeling import createTopicModel
topic_model = createTopicModel(umap_model, hdbscan_model, vectorizer_model, ctfidf_model)

topics, _ = topic_model.fit_transform(df['content'].tolist(), embeddings)
df['cluster'] = topics
```
Wraps the four models from Step 6 into a configured `BERTopic` instance, then fits it on the review texts using the **precomputed embeddings** from Step 4 (so BERTopic doesn't re-embed the text itself). `fit_transform` runs the full pipeline — UMAP reduction, HDBSCAN clustering, then c-TF-IDF keyword extraction — and returns a topic ID per review, which is stored back into `df['cluster']`. The execution log shows this completing in three sub-stages: dimensionality reduction (~49s), clustering (near-instant on the reduced space), and representation/keyword fine-tuning (~6s). The reference run produced **67 topics** (66 real clusters plus the `-1` outlier group, which is the largest single group at 684 reviews).

`topic_model.get_topic_info()` is then used to pull a summary table with each topic's ID, size (`Count`), auto-generated `Name` (built from its top keywords, e.g. `0_hai_ho_mera_ke`), and keyword `Representation` — this becomes the base of the final report.

### Step 8 — Describe each cluster
```python
from describe_cluster import describeCluster
topic_info["description"] = topic_info["Topic"].apply(
    lambda topic_id: describeCluster(topic_model, topic_id)
)
```
BERTopic's auto-generated topic names are just concatenated keywords (e.g. `1_express_share_ideas_messenger`), which aren't very readable on their own. This step sends each topic's keywords/representative documents to an LLM via the `openai` client to generate a short, human-readable label — e.g. topic `-1` becomes *"Miscellaneous / no clear single theme,"* topic `0` becomes *"Account access issues and app malfunctions,"* topic `3` becomes *"Positive feedback about app performance and features."* This is the step that turns statistical clusters into something a non-technical stakeholder can skim and understand. It requires a valid OpenAI API key/credentials to be configured wherever `describe_cluster.py` initializes the client.

Separately, `avg_scores = df.groupby('cluster')['score'].mean()` computes each cluster's average star rating and merges it into `topic_info`, so every topic ends up with size, keywords, an LLM description, *and* an average sentiment score — letting you immediately spot, for example, that "account access issues" clusters skew low (avg ≈ 3.5) while "positive feedback" clusters skew high (avg ≈ 4.7).

### Step 9 — Export to Excel
```python
from handle_xlsx import writeToXlsx
writeToXlsx(topic_info, df)
```
Writes the final results to an `.xlsx` workbook using `openpyxl` — in the reference run, saved to `/content/drive/MyDrive/whatsapp_analysis/whatsapp_review_clusters_semantic.xlsx`. Based on the DataFrames passed in, the output most likely contains one sheet with the per-topic summary (`topic_info`: ID, count, keywords, description, avg score) and another with the full per-review data (`df`, including each review's assigned `cluster`) — turning the whole analysis into a shareable, non-technical deliverable.

## Tech stack

- **Data handling:** `pandas`, `numpy`
- **Language detection:** `fasttext` (`lid.176.ftz` language identification model)
- **Embeddings:** `sentence-transformers`
- **Vector database:** `chromadb`
- **Dimensionality reduction:** `umap-learn`
- **Clustering:** `hdbscan`
- **Topic modeling:** `bertopic`
- **Cluster description generation:** `openai`
- **Report output:** `openpyxl`

## Requirements

This notebook is designed to run in **Google Colab** with Google Drive mounted, since it:
- Appends a Google Drive path to `sys.path` to import the custom pipeline modules
- Reads input data and writes the final report to Google Drive

Install dependencies (as done in the notebook):

```bash
pip install numpy==1.26.4 --force-reinstall
pip install umap-learn hdbscan
pip install fasttext-wheel --no-cache-dir
wget https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz
pip install sentence-transformers chromadb bertopic openai openpyxl
```

An OpenAI API key must be configured for the cluster-description step (`describe_cluster.py`).

## Input data

The source dataset (10,000 rows in the reference run) has three columns:

| Column | Type | Description |
|---|---|---|
| `reviewId` | string | Unique review identifier |
| `content` | string | Review text |
| `score` | int | Star rating given by the reviewer |

After preprocessing and language filtering, the reference run retained 3,927 reviews (predominantly English, with dozens of other languages present).

## Output

A `.xlsx` file (e.g. `whatsapp_review_clusters_semantic.xlsx`) containing:
- The full set of reviews with their assigned `cluster` label
- A topic summary table with, per cluster: topic ID, review count, top keywords, LLM-generated description, and average rating

Cluster `-1` is reserved by HDBSCAN/BERTopic for outliers/noise (reviews that don't fit clearly into any topic).

## Notes

- The dataset used in the reference run is app-store reviews for WhatsApp; the pipeline is generic enough to apply to any short-text review dataset with `content` and `score` fields.
- Embeddings are 768-dimensional, consistent with a `sentence-transformers` base model.
- The reference run produced 67 distinct topics (including the outlier topic).

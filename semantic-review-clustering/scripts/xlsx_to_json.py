import pandas as pd
import json
import ast
# pip install pandas openpyxl

clusters_df = pd.read_excel("../Results.xlsx","Cluster Summary")

clusters_df = clusters_df[["Topic", "Count", "Representation", "description", "avg_score"]]
clusters_df["Representation"] = clusters_df["Representation"].apply(ast.literal_eval)

clusters_data = clusters_df.to_dict(orient="records")

with open("clusters.json", "w", encoding="utf-8") as f:
    json.dump(clusters_data, f, indent=4, ensure_ascii=False)


reviews_df = pd.read_excel("../Results.xlsx", sheet_name="All Reviews")

result = []

for topic, group in reviews_df.groupby("cluster"):
    reviews = group[["content", "score"]].rename(
        columns={"content": "review", "score": "score"}
    ).to_dict(orient="records")

    result.append({
        "topic": int(topic),
        "reviews": reviews
    })

with open("reviews.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=4, ensure_ascii=False)

print("Excel converted to JSON successfully!")

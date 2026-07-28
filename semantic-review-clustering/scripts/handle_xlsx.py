import os
import pandas as pd

def writeToXlsx(topic_info, df):
  output_dir = '/content/drive/MyDrive/whatsapp_analysis'
  os.makedirs(output_dir, exist_ok=True)

  output_path = os.path.join(output_dir, 'whatsapp_review_clusters_semantic.xlsx')

  with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
      topic_info.to_excel(writer, sheet_name='Cluster Summary', index=False)
      df[['cluster', 'content', 'score']].to_excel(writer, sheet_name='All Reviews', index=False)

  print(f"Saved to {output_path}")
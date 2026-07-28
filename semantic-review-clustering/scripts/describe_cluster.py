from openai import OpenAI

client = OpenAI(api_key="OPEN_API_KEY")

def describeCluster(topic_model, topic_id):
    if topic_id == -1:
        return "Miscellaneous / no clear single theme"

    docs = topic_model.get_representative_docs(topic_id)[:5]
    reviews_text = "\n".join(f"- {d}" for d in docs)

    prompt = f"""You are an expert at labeling data.
The following are customer reviews of WhatsApp on the Play Store and App store, all grouped into one cluster because they discuss the same thing.

Reviews:
{reviews_text}

Describe in 5-10 words what these reviews have in common — a short, neutral title for this group.
Don't be opinionated or vague (avoid things like "okay and good" or "WhatsApp is a good app but...").
Just state what specific topic/issue/feature they're about.
Examples of good titles: "Accounts getting banned without explanation", "App crashes on startup", "Request for a dark mode option".

Respond with ONLY the title, nothing else."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",   # or "gpt-4o-mini" for a cheaper/faster option, quality is still good
        messages=[{"role": "user", "content": prompt}],
        max_tokens=30,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()
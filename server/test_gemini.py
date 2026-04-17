# test_gemini.py
import google.genai as genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

response = client.interactions.create(
    model=model,
    input="Say hello in one sentence.",
)

output_text = None
if getattr(response, "outputs", None):
    first_output = response.outputs[0]
    if getattr(first_output, "content", None):
        first_content = first_output.content[0]
        output_text = getattr(first_content, "text", None)

print(output_text if output_text is not None else response)
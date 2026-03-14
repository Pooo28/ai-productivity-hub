import time
from firecrawl import FirecrawlApp
import os
from dotenv import load_dotenv

load_dotenv()
try:
    app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
except TypeError:
    app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))

print("Starting search...")
start = time.time()
res = app.search("React jobs in Remote")
time_taken = time.time() - start
print(f"Time taken: {time_taken:.2f} seconds")
print(f"Results type: {type(res)}")
if isinstance(res, dict):
    print("Found data:", len(res.get('data', {}).get('web', [])) if isinstance(res.get('data'), dict) else len(res.get('web', [])))
else:
    print("Found data:", len(getattr(res, 'web', [])))

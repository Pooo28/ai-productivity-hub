import os
from firecrawl import FirecrawlApp
from dotenv import load_dotenv

load_dotenv()

app = FirecrawlApp(api_key=os.getenv('FIRECRAWL_API_KEY'), version='v0')
query = 'React developer job listings'
print(f"Searching for: {query}")
try:
    res = app.search(query)
    print("Full result keys:", res.keys() if isinstance(res, dict) else dir(res))
    
    data = []
    if isinstance(res, dict):
        data = res.get('data', {}).get('web', []) or res.get('web', [])
    else:
        data = getattr(res, 'web', [])
        
    print(f"Count: {len(data)}")
    if data:
        print("First result title:", data[0].get('title') if isinstance(data[0], dict) else getattr(data[0], 'title', 'N/A'))
except Exception as e:
    print(f"Error: {e}")

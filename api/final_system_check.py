import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def test_endpoint(name, path, method="POST", data=None):
    print(f"\n--- Testing {name} ({path}) ---")
    try:
        url = f"{BASE_URL}{path}"
        start_time = time.time()
        if method == "POST":
            response = requests.post(url, json=data or {}, timeout=30)
        else:
            response = requests.get(url, timeout=30)
        duration = time.time() - start_time
        
        print(f"Status: {response.status_code}")
        print(f"Duration: {duration:.2f}s")
        
        if response.status_code == 200:
            print("Response: PASS")
            # Sample output
            content = response.text
            if len(content) > 150:
                print(f"Content Preview: {content[:150]}...")
            else:
                print(f"Content: {content}")
            return True
        else:
            print(f"Response: FAIL - {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Response: ERROR - {str(e)}")
        return False

print("=== STARTING COMPREHENSIVE SYSTEM CHECK ===")

results = []

# 1. Health
results.append(("Health", test_endpoint("Health Check", "/api/health", method="GET")))

# 2. YouTube
results.append(("YouTube", test_endpoint("YouTube Summarizer", "/api/youtube-summary", data={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})))

# 3. Notes
results.append(("Notes", test_endpoint("Notes Summarizer", "/api/summarize", data={"content": "The AI Productivity Hub is now unified under a light lavender theme. Verification is underway."})))

# 4. Jobs
results.append(("Jobs", test_endpoint("Job Search", "/api/job-search", data={"role": "React Developer", "location": "Remote"})))

# 5. Schedule
results.append(("Schedule", test_endpoint("Schedule Suggest", "/api/schedule-suggest", data={"tasks": [{"title": "Verify UI Fixes", "deadline": "Today"}, {"title": "Cleanup Test Scripts", "deadline": "Tomorrow"}]})))

print("\n=== FINAL VERIFICATION SUMMARY ===")
all_pass = True
for name, passed in results:
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{name:15}: {status}")
    if not passed: all_pass = False

if all_pass:
    print("\nSYSTEM STATUS: OPERATIONAL")
else:
    print("\nSYSTEM STATUS: DEGRADED")

print("=== CHECK COMPLETE ===")

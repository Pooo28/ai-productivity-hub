import os
import sys

# Add the project root and api directory to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'api'))

try:
    from api.index import app
    print("Successfully imported Flask app from api/index.py")
    
    print("\nRegistered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods)}]")
        
except Exception as e:
    print(f"FAILED to import app: {e}")
    import traceback
    traceback.print_exc()

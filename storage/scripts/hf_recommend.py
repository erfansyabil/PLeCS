#!/usr/bin/env python3
"""
Bridge script to call the PLeCS Hugging Face Space.
Usage: python hf_recommend.py <form_level> <interests> <background> <learning_goal> <catalog_file_or_json>
"""
import sys
import json
import os

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

import warnings
warnings.filterwarnings("ignore")

import io
sys.stderr = io.StringIO()

from gradio_client import Client

def get_recommendations(form_level, interests, background, learning_goal, catalog_json):
    """Call the HF Space and return recommendations."""
    client = Client("ethe1k/plecs-recommender", verbose=False)
    result = client.predict(
        form_level,
        interests,
        background,
        learning_goal,
        catalog_json,
        api_name="/generate_learning_path"
    )
    return result

if __name__ == "__main__":
    if len(sys.argv) != 6:
        print(json.dumps({"success": False, "error": "Expected 5 arguments"}))
        sys.exit(1)
    
    form_level = sys.argv[1]
    interests = sys.argv[2]
    background = sys.argv[3]
    learning_goal = sys.argv[4]
    catalog_arg = sys.argv[5]
    
    # Check if it's a file path or JSON string
    if os.path.exists(catalog_arg):
        with open(catalog_arg, 'r', encoding='utf-8') as f:
            catalog_json = f.read()
    else:
        catalog_json = catalog_arg
    
    try:
        result = get_recommendations(form_level, interests, background, learning_goal, catalog_json)
        
        if isinstance(result, str):
            result = json.loads(result)
        
        sys.stdout.write(json.dumps(result) + "\n")
        sys.stdout.flush()
        
    except Exception as e:
        sys.stdout.write(json.dumps({"success": False, "error": str(e)}) + "\n")
        sys.stdout.flush()
        sys.exit(1)
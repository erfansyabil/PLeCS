#!/usr/bin/env python3
"""
Bridge script to call the PLeCS Hugging Face Space.
Usage: python hf_recommend.py <form_level> <interests> <background> <learning_goal>
"""
import sys
import json
import os

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

from gradio_client import Client

def get_recommendations(form_level, interests, background, learning_goal):
    """Call the HF Space and return recommendations."""
    client = Client("ethe1k/plecs-recommender")
    result = client.predict(
        form_level,
        interests,
        background,
        learning_goal,
        api_name="/generate_learning_path"
    )
    return result

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({"success": False, "error": "Expected 4 arguments"}))
        sys.exit(1)
    
    form_level = sys.argv[1]
    interests = sys.argv[2]
    background = sys.argv[3]
    learning_goal = sys.argv[4]
    
    try:
        result = get_recommendations(form_level, interests, background, learning_goal)
        
        # The result might be a JSON string - parse it if so
        if isinstance(result, str):
            result = json.loads(result)
        
        # Output clean JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
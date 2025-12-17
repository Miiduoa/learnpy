import json
import os
from pathlib import Path
import glob

# Get the directory where this file is located
BASE_DIR = Path(__file__).parent
CONTENT_DIR = BASE_DIR / "content" / "lessons"

def load_lessons():
    """
    Load lessons from JSON files in the content/lessons directory.
    Values are sorted by their filename (or _order field if present).
    """
    lessons = []
    
    # Ensure the directory exists
    if not CONTENT_DIR.exists():
        print(f"Warning: Content directory not found at {CONTENT_DIR}")
        return []

    # Get all .json files
    json_files = sorted(glob.glob(str(CONTENT_DIR / "*.json")))
    
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lesson_data = json.load(f)
                
                # Basic validation
                if 'id' in lesson_data and 'title' in lesson_data:
                    lessons.append(lesson_data)
                else:
                    print(f"Warning: Skipped invalid lesson file {os.path.basename(file_path)} (missing id or title)")
        except Exception as e:
            print(f"Error loading lesson from {os.path.basename(file_path)}: {e}")
            
    # Optional: Sort by a custom order field if you have it, 
    # otherwise they are sorted by filename (EX1-0, EX1-1...) which is usually correct
    # for well-named files.
    # If you need specific ordering logic, implement it here.
    
    return lessons

# Load lessons immediately when module is imported
LESSONS = load_lessons()

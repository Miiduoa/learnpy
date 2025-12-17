# lessons.py
import json
import logging
from pathlib import Path
from typing import List, Dict, Any

# This file contains the curriculum for the Python tutor.
# It now loads lessons from the 'content/lessons' directory.

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_lessons() -> List[Dict[str, Any]]:
    """
    Loads lessons from the content/lessons directory JSON files.
    Sorts them based on the '_order' field.
    """
    current_dir = Path(__file__).parent
    lessons_dir = current_dir / "content" / "lessons"
    
    if not lessons_dir.exists():
        logger.warning(f"Lessons directory not found at {lessons_dir}")
        return []
        
    loaded_lessons = []
    
    try:
        # Iterate over all .json files
        for file_path in lessons_dir.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    lesson_data = json.load(f)
                    # Use filename as fallback ID if not present
                    if "id" not in lesson_data:
                        lesson_data["id"] = file_path.stem
                    loaded_lessons.append(lesson_data)
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding JSON from {file_path}: {e}")
            except Exception as e:
                logger.error(f"Error reading lesson file {file_path}: {e}")
                
        # Sort lessons by _order field (default to infinite if missing to put at end)
        loaded_lessons.sort(key=lambda x: x.get("_order", float('inf')))
        
        logger.info(f"Successfully loaded {len(loaded_lessons)} lessons")
        return loaded_lessons
        
    except Exception as e:
        logger.error(f"Critical error loading lessons: {e}")
        return []

# Initialize the LESSONS list
LESSONS = load_lessons()

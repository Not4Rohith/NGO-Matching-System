"""
Dataset Loading and Preprocessing Module
Reads `ngos.csv`, handles missing fields, tokenizes metadata, and prepares clean records.
"""

import csv
import os
import sys
from typing import List, Dict, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    from .nlp.text_preprocessing import clean_text, tokenize_and_filter
except Exception:
    from nlp.text_preprocessing import clean_text, tokenize_and_filter

DATASET_PATH = os.path.join(os.path.dirname(CURRENT_DIR), 'dataset', 'ngos.csv')

def load_ngos_dataset(filepath: str = None) -> List[Dict[str, Any]]:
    """Loads and normalizes the NGO records from the CSV file."""
    target_path = filepath if filepath else DATASET_PATH
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"NGO dataset not found at {target_path}")

    records = []
    with open(target_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Combine textual features for NLP matching
            full_text = f"{row.get('name', '')} {row.get('category', '')} {row.get('subcategories', '')} {row.get('description', '')} {row.get('keywords', '')}"
            tokens = tokenize_and_filter(full_text)
            
            # Parse urgency levels handled
            urgency_levels = [u.strip() for u in row.get('urgency_levels_handled', '').split(',') if u.strip()]

            record = {
                'id': int(row.get('id', len(records) + 1)),
                'name': row.get('name', '').strip(),
                'category': row.get('category', '').strip(),
                'subcategories': row.get('subcategories', '').strip(),
                'city': row.get('city', '').strip(),
                'state': row.get('state', '').strip(),
                'description': row.get('description', '').strip(),
                'keywords': row.get('keywords', '').strip(),
                'capacity': int(row.get('capacity', 1000) or 1000),
                'urgency_levels_handled': urgency_levels,
                'verified': str(row.get('verified', 'true')).lower() in ('true', '1', 'yes'),
                'rating': float(row.get('rating', 4.5) or 4.5),
                'contact_phone': row.get('contact_phone', '').strip(),
                'contact_email': row.get('contact_email', '').strip(),
                'website': row.get('website', '').strip(),
                'tokens': tokens,
                'searchable_text': clean_text(full_text)
            }
            records.append(record)

    return records

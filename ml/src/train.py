"""
Model Training and Index Builder Module
Precomputes and validates the TF-IDF representation of the NGO knowledge base.
"""

import sys
import os
import json
import time

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from data_preprocessing import load_ngos_dataset
from nlp.feature_extraction import TFIDFExtractor

def train_and_cache_index():
    print("=" * 60)
    print("Training NLP Matcher Model on NGO Knowledge Base...")
    print("=" * 60)

    start_time = time.time()
    ngos = load_ngos_dataset()
    print(f"Loaded {len(ngos)} verified NGO organizations from dataset.")

    tfidf = TFIDFExtractor()
    tokenized_docs = [ngo['tokens'] for ngo in ngos]
    tfidf.fit(tokenized_docs)

    vocab_size = len(tfidf.vocabulary)
    print(f"Constructed TF-IDF feature vocabulary: {vocab_size} distinct terms.")

    cache_dir = os.path.join(CURRENT_DIR, 'cache')
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, 'model_meta.json')

    meta = {
        'total_ngos': len(ngos),
        'vocab_size': vocab_size,
        'categories': list(set(ngo['category'] for ngo in ngos)),
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    }

    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)

    elapsed = round((time.time() - start_time) * 1000, 2)
    print(f"Model indexed successfully in {elapsed}ms! Metadata saved to {cache_file}.")
    return tfidf, ngos

if __name__ == '__main__':
    train_and_cache_index()

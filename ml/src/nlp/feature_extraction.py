"""
Feature Extraction and Similarity Computation
Computes TF-IDF vector representations and Cosine Similarities across documents.
Compatible with pure standard Python (math, collections) for zero-dependency execution.
"""

import math
from collections import Counter
from typing import List, Dict

class TFIDFExtractor:
    def __init__(self):
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.documents: List[List[str]] = []
        self.num_docs: int = 0

    def fit(self, tokenized_docs: List[List[str]]):
        """Builds vocabulary and inverse document frequency (IDF) weights."""
        self.documents = tokenized_docs
        self.num_docs = len(tokenized_docs)
        doc_freq = Counter()

        for doc in tokenized_docs:
            unique_terms = set(doc)
            for term in unique_terms:
                doc_freq[term] += 1

        self.vocabulary = {term: idx for idx, term in enumerate(doc_freq.keys())}
        # Compute smooth IDF: log(1 + (N / (1 + df))) + 1
        for term, df in doc_freq.items():
            self.idf[term] = math.log((1 + self.num_docs) / (1 + df)) + 1.0

    def transform(self, tokens: List[str]) -> Dict[str, float]:
        """Transforms a token list into a sparse normalized TF-IDF vector."""
        if not tokens:
            return {}
        term_counts = Counter(tokens)
        total_tokens = len(tokens)
        vector = {}

        norm_sq = 0.0
        for term, count in term_counts.items():
            if term in self.idf:
                tf = count / total_tokens
                tfidf = tf * self.idf[term]
                vector[term] = tfidf
                norm_sq += tfidf ** 2

        # L2 Normalization
        norm = math.sqrt(norm_sq)
        if norm > 0:
            for term in vector:
                vector[term] /= norm

        return vector

def cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    """Computes cosine similarity between two sparse normalized vectors."""
    if not vec_a or not vec_b:
        return 0.0
    # Since vectors are L2-normalized, dot product is cosine similarity
    dot = 0.0
    # Iterate over smaller vector for speed
    if len(vec_a) > len(vec_b):
        vec_a, vec_b = vec_b, vec_a

    for term, val_a in vec_a.items():
        if term in vec_b:
            dot += val_a * vec_b[term]

    return min(max(dot, 0.0), 1.0)

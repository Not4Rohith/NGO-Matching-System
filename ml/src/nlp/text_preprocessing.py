"""
Text Preprocessing and Urgency Detection Module
Extracts clean tokens, removes noise and stopwords, and detects emergency severity signals.
"""

import re
import string

# Standard English stopwords
STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
    "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
    'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's",
    'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', "should've",
    'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'need', 'please',
    'help', 'needed', 'urgent', 'urgently'
}

# Critical urgency indicators
CRITICAL_KEYWORDS = {
    'critical': ['death', 'dying', 'collapse', 'trapped', 'flood', 'drowning', 'unconscious', 'severe', 'bleeding', 'icu', 'suicide', 'oxygen', 'heart attack', 'fire'],
    'high': ['emergency', 'starving', 'injured', 'broken', 'evacuate', 'ambulance', 'hospital', 'violence', 'assault', 'homeless', 'cyclone', 'earthquake'],
    'medium': ['food', 'medicines', 'clinic', 'water', 'shelter', 'tuition', 'fever', 'supplies', 'puppy', 'stray', 'blankets'],
    'low': ['books', 'stationery', 'tree', 'plantation', 'workshop', 'recycling', 'awareness', 'cleanup']
}

def clean_text(text: str) -> str:
    """Lowercases text, removes URLs, special characters and extra whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'[%s]' % re.escape(string.punctuation), ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize_and_filter(text: str) -> list[str]:
    """Tokenizes cleaned text and removes English stopwords."""
    cleaned = clean_text(text)
    words = cleaned.split()
    return [word for word in words if word not in STOPWORDS and len(word) > 2]

def detect_urgency(text: str) -> str:
    """Infers the urgency level (Critical, High, Medium, Low) based on semantic keywords."""
    lower_text = text.lower()
    for word in CRITICAL_KEYWORDS['critical']:
        if word in lower_text:
            return 'Critical'
    for word in CRITICAL_KEYWORDS['high']:
        if word in lower_text:
            return 'High'
    for word in CRITICAL_KEYWORDS['medium']:
        if word in lower_text:
            return 'Medium'
    return 'Low'

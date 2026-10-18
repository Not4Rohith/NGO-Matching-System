"""
Request Parser Module
Extracts humanitarian intent, category, location references, and urgency from raw request text.
"""

from typing import Dict, Any, List

try:
    from .text_preprocessing import clean_text, tokenize_and_filter, detect_urgency
except Exception:
    from nlp.text_preprocessing import clean_text, tokenize_and_filter, detect_urgency

# Sector keyword maps
CATEGORY_SIGNALS = {
    'Disaster Relief': ['flood', 'earthquake', 'cyclone', 'landslide', 'tsunami', 'disaster', 'calamity', 'rescue', 'trapped', 'evacuation', 'relief kit'],
    'Hunger & Food': ['food', 'hunger', 'hungry', 'starving', 'meals', 'ration', 'groceries', 'malnutrition', 'kitchen', 'cooked food', 'dinner', 'lunch'],
    'Healthcare': ['doctor', 'hospital', 'medicine', 'medicines', 'ambulance', 'blood', 'clinic', 'surgery', 'illness', 'disease', 'fever', 'oxygen', 'icu', 'treatment', 'patient', 'health'],
    'Education': ['school', 'education', 'student', 'children', 'books', 'stationery', 'study', 'teacher', 'classes', 'tuition', 'scholarship', 'literacy'],
    'Animal Welfare': ['dog', 'cat', 'puppy', 'kitten', 'cow', 'cattle', 'animal', 'stray', 'injured animal', 'vet', 'rabies', 'veterinary'],
    'Women Empowerment': ['women', 'domestic violence', 'assault', 'maternal', 'girl child', 'pregnant', 'harassment', 'livelihood', 'artisan', 'widow'],
    'Elderly Care': ['elderly', 'old age', 'senior citizen', 'grandfather', 'grandmother', 'pension', 'hospice', 'dementia'],
    'Clean Water & Sanitation': ['water', 'drinking water', 'toilet', 'sanitation', 'clean water', 'contamination', 'borewell', 'hygiene'],
    'Environment': ['tree', 'trees', 'plantation', 'pollution', 'waste', 'recycling', 'forest', 'climate', 'garbage', 'sapling'],
    'Mental Health': ['depression', 'anxiety', 'suicide', 'mental health', 'counseling', 'therapy', 'distress', 'panic attack']
}

INDIAN_CITIES = [
    'mumbai', 'delhi', 'new delhi', 'bengaluru', 'bangalore', 'chennai', 'kolkata',
    'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'dehradun',
    'bhopal', 'indore', 'patna', 'guwahati', 'dharamshala', 'kochi', 'varanasi', 'surat'
]

def detect_category(text: str) -> str:
    """Classifies text into the most probable NGO humanitarian category."""
    lower = text.lower()
    scores = {}
    for cat, keywords in CATEGORY_SIGNALS.items():
        score = sum(1 for kw in keywords if kw in lower)
        if score > 0:
            scores[cat] = score

    if scores:
        return max(scores, key=scores.get)
    return 'General Aid'

def extract_city(text: str) -> str:
    """Extracts known city names mentioned in the text."""
    lower = text.lower()
    for city in INDIAN_CITIES:
        if city in lower:
            return " ".join(word.capitalize() for word in city.split())
    return ""

def parse_aid_request(title: str, description: str, category_hint: str = "", city_hint: str = "") -> Dict[str, Any]:
    """
    Parses title and description into structured fields:
    - category
    - urgency
    - city
    - tokens
    - cleaned_text
    """
    combined_text = f"{title} {description}"
    cleaned = clean_text(combined_text)
    tokens = tokenize_and_filter(combined_text)

    category = category_hint.strip() if category_hint else detect_category(combined_text)
    city = city_hint.strip() if city_hint else extract_city(combined_text)
    urgency = detect_urgency(combined_text)

    return {
        'title': title,
        'description': description,
        'cleaned_text': cleaned,
        'tokens': tokens,
        'category': category,
        'city': city,
        'urgency': urgency
    }

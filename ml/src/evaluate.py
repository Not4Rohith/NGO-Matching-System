"""
Evaluation & Benchmark Suite
Tests the NGO recommendation engine across diverse simulated crisis and aid requests.
"""

import sys
import os
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from predict import NGOMatcher

TEST_CASES = [
    {
        'name': 'Medical Blood Emergency',
        'request': {
            'title': 'Emergency blood requirement',
            'description': 'Urgent O-negative blood units and ambulance needed for trauma patient after road accident in Mumbai.',
            'category': 'Healthcare',
            'city': 'Mumbai'
        },
        'expected_categories': ['Healthcare', 'Healthcare & Disaster']
    },
    {
        'name': 'Street Animal Rescue',
        'request': {
            'title': 'Injured stray puppy hit by car',
            'description': 'Stray dog with fractured leg bleeding near road in Delhi, needs veterinary surgery and shelter.',
            'category': 'Animal Welfare',
            'city': 'New Delhi'
        },
        'expected_categories': ['Animal Welfare']
    },
    {
        'name': 'Slum Child Education Support',
        'request': {
            'title': 'School books and tuition for children',
            'description': 'Providing free primary school books, pencils, and reading classes for 40 underprivileged kids.',
            'category': 'Education',
            'city': 'Mumbai'
        },
        'expected_categories': ['Education', 'Child Welfare']
    },
    {
        'name': 'Severe Flood Relief',
        'request': {
            'title': 'Severe cyclone and flood evacuation',
            'description': 'People trapped on rooftops due to water logging in Chennai, urgently need rescue boats and dry food.',
            'category': 'Disaster Relief',
            'city': 'Chennai'
        },
        'expected_categories': ['Disaster Relief']
    },
    {
        'name': 'Mental Health Crisis',
        'request': {
            'title': 'Urgent emotional counselling',
            'description': 'Person experiencing severe depression and suicidal thoughts requiring immediate psychological therapist support.',
            'category': 'Mental Health',
            'city': 'Mumbai'
        },
        'expected_categories': ['Mental Health']
    }
]

def run_evaluation():
    print("=" * 65)
    print("RUNNING AID REQUEST MATCHING BENCHMARK & EVALUATION")
    print("=" * 65)

    matcher = NGOMatcher()
    passed = 0

    for idx, test in enumerate(TEST_CASES, 1):
        name = test['name']
        req = test['request']
        expected = test['expected_categories']

        matches = matcher.match(req, top_k=3)
        top_match = matches[0] if matches else None

        is_match_valid = top_match and any(exp.lower() in top_match['category'].lower() or top_match['category'].lower() in exp.lower() for exp in expected)
        
        status = "PASSED" if is_match_valid else "FAILED"
        if is_match_valid:
            passed += 1

        print(f"\n[Test {idx}/{len(TEST_CASES)}] {name} -> {status}")
        print(f"  Query: \"{req['title']}\" ({req['city'] or 'Any City'})")
        if top_match:
            print(f"  Top Match: {top_match['name']} | Category: {top_match['category']} | Score: {top_match['match_score']}%")
            print(f"  Breakdown: Similarity {top_match['breakdown']['text_similarity']}%, Category {top_match['breakdown']['category_match']}%, Location {top_match['breakdown']['location_match']}%")

    accuracy = (passed / len(TEST_CASES)) * 100
    print("\n" + "=" * 65)
    print(f"EVALUATION SUMMARY: {passed}/{len(TEST_CASES)} Tests Passed ({accuracy:.1f}% Top-1 Accuracy)")
    print("=" * 65)
    return passed == len(TEST_CASES)

if __name__ == '__main__':
    run_evaluation()

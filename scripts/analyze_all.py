import json
import re

with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

q_map = {q['_id']: q for q in questions}

print("Loaded files successfully.")

import json
import re

with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

q_map = {q['_id']: q for q in questions}

# Let's inspect each report in detail:
for r in reports:
    rid = r['reportId']
    qid = r['questionId']
    q = q_map.get(qid)
    comment = r['comment']
    qtype = q['questionType']
    qdata = q[qtype]
    
    print(f"=== {rid} (Q: {qid}) ===")
    print(f"Student: {comment}")
    print(f"Type: {qtype}, Answer: {qdata.get('answer')}")
    print(f"Stem: {repr(qdata.get('question'))[:150]}")
    print(f"Sol: {repr(qdata.get('solution'))[:150]}")
    print()

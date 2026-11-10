import json

with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

q_map = {q['_id']: q for q in questions}

def dump_range(start, end):
    for i in range(start, min(end, len(reports))):
        r = reports[i]
        q = q_map.get(r['questionId'])
        qtype = q['questionType']
        qd = q[qtype]
        print(f"=== INDEX {i}: {r['reportId']} ===")
        print(f"QID: {r['questionId']}")
        print(f"Comment: {r['comment']}")
        print(f"Subject: {q.get('subject')}, Chapter: {q.get('chapter')}, Type: {qtype}")
        print(f"Stored Answer: {qd.get('answer')}")
        print(f"Error History: {q.get('errorHistory')}")
        print(f"Q HTML:\n{qd.get('question')}")
        print(f"Sol HTML:\n{qd.get('solution')}")
        print("\n" + "="*50 + "\n")

import sys
start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end = int(sys.argv[2]) if len(sys.argv) > 2 else 5
dump_range(start, end)

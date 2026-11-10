import json
import re

with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

reported_qids = set(r['questionId'] for r in reports)
all_qids = set(q['_id'] for q in questions)
unreported_qids = all_qids - reported_qids

print(f"Total questions: {len(all_qids)}")
print(f"Reported questions: {len(reported_qids)}")
print(f"Unreported questions: {len(unreported_qids)}")

for qid in sorted(unreported_qids):
    q = next(item for item in questions if item['_id'] == qid)
    qtype = q['questionType']
    qd = q.get(qtype, {})
    print(f"\n=== Unreported QID: {qid} ===")
    print(f"Subject: {q.get('subject')}, Chapter: {q.get('chapter')}, Type: {qtype}")
    print(f"Answer: {qd.get('answer')}")
    print(f"Error flag: {q.get('error')}, History: {q.get('errorHistory')}")
    stem = qd.get('question', '')
    sol = qd.get('solution', '')
    print(f"Stem: {stem[:200]}...")
    print(f"Sol: {sol[:200]}...")

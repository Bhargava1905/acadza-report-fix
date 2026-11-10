import json
import re
from html import unescape

with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

q_map = {q['_id']: q for q in questions}

print(f"Total reports: {len(reports)}")
print(f"Total questions: {len(questions)}")

def clean_html(raw_html):
    if not raw_html:
        return ""
    # strip some tags or simplify
    text = re.sub(r'<[^>]+>', ' ', raw_html)
    return ' '.join(unescape(text).split())

with open('reports_overview.txt', 'w', encoding='utf-8') as out:
    for idx, r in enumerate(reports):
        qid = r['questionId']
        q = q_map.get(qid)
        out.write(f"--- #{idx+1} Report {r['reportId']} ---\n")
        out.write(f"Question ID: {qid}\n")
        out.write(f"Student Comment: {r['comment']}\n")
        out.write(f"Reported At: {r['reportedAt']}, Source: {r['source']}\n")
        if not q:
            out.write("QUESTION NOT FOUND IN DATABASE!\n\n")
            continue
        qtype = q.get('questionType')
        qdata = q.get(qtype, {})
        stored_ans = qdata.get('answer')
        stem = qdata.get('question', '')
        sol = qdata.get('solution', '')
        error_hist = q.get('errorHistory', [])
        out.write(f"Subject: {q.get('subject')}, Chapter: {q.get('chapter')}, Type: {qtype}, Level: {q.get('level')}\n")
        out.write(f"Stored Answer: {stored_ans}\n")
        if error_hist:
            out.write(f"Error History: {json.dumps(error_hist)}\n")
        out.write(f"Question (cleaned): {clean_html(stem)[:300]}...\n")
        out.write(f"Solution (cleaned): {clean_html(sol)[:300]}...\n")
        out.write("\n")

print("Saved reports_overview.txt")

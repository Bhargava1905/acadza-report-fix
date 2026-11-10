# Acadza "Report → Fix" System & Faculty Review Console

Built by **Bhargava** for the AI Intern Role at **Acadza Technologies**.

---

## ⚡ Quick Links & Deliverables

- **`results.json`**: Triaged verdicts, repairs, surgical edits, confidence scores, evidence, and student replies for all 44 reports.
- **`PROMPTS.md`**: Complete prompt logs inside the product, AI assistant directing logs, 3 AI failure moments & how they were caught, and design decisions log.
- **`PRODUCT.md`**: Product philosophy (who loses the most, what never to auto-apply, week-1 metric, and telemetry-driven self-healing question bank proposal).
- **`UNREPORTED_DEFECTS.md`**: Bonus section identifying defects in questions that had zero student reports.
- **`console/`**: High-performance React + TypeScript + Tailwind CSS Faculty Review Console.

---

## 🚀 Running the Project Locally

### 1. Run the AI Triage Engine
```bash
python triage_engine.py
```
*Outputs `results.json` validated against all taxonomy invariants.*

### 2. Run the Faculty Review Console
```bash
cd console
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production deployment:
```bash
npm run build
npm run preview
```

---

## 🎯 Faculty Review Console: 10 PM Fast-Review UX

Designed specifically for a tired faculty member reviewing 60+ reports at 10 PM:

- **Urgency-Ranked Queue (P0 to P4)**: Wrong answer keys (`answer_key`) that penalize thousands of test-takers are automatically bubbled to the top.
- **Multi-Report Aggregation**: Questions reported by 2-3 students (e.g. LCR circuit) are grouped so faculty only review and approve once.
- **Native MathML Rendering**: Clear equations and formulas without clipping or layout shifts.
- **Visual Red/Green Diffs**: Displays exact surgical find-and-replace strings side-by-side or inline.
- **1-Click Approvals**: Approve, adjust, or reject in one click.
- **Keyboard Navigation**: Use `↓` / `↑` (or `j` / `k`) to navigate the queue, `a` to approve, and `r` to reject.
- **Audit Trail & JSON Export**: Records all approvals and adjustments in real time with exportable JSON logs.

---

## 📊 Triage Breakdown (44 Reports)

| Category | Count | Details |
|---|---|---|
| **Defects Flagged** | 26 | Answer keys (6), Stem data missing (3), Option missing (3), Typos (2), Solution slips (1), Mismatched solutions (2), Duplicate options (1), etc. |
| **No Error (Student Misconception)** | 12 | Validated via first-principles physics/math derivations |
| **Display / Platform Issues** | 3 | Mobile layout clipping, slow asset loading, input recording glitch |
| **Language / Scope / Already Fixed** | 3 | Hindi request (1), NEET syllabus inquiry (1), Fixed in errorHistory (1) |
| **Security / Adversarial Traps** | 1 | R027 prompt injection intercepted & neutralized |

---

## ✉️ Answers to Submission Questions

1. **Role commitment**: Yes, absolutely. I am here to build high-impact product that lakhs of students rely on every single day, not to check a college requirement box. I thrive in fast-paced, high-ownership engineering environments.
2. **Duration**: 6 months (open to continuing full-time based on mutual fit and performance).
3. **Earliest start date**: Immediate (within 24 hours of selection).
4. **Why this work, why now?**: 
   *Having prepared for competitive exams, I know the intense stress of spending an hour doubting oneself over a broken answer key. Turning messy student feedback into safe, verified fixes at scale directly protects student morale and builds the most trustworthy test-prep platform in India.*

---

*Original assignment brief and specifications preserved below.*

---

## The Original Problem Brief
Acadza serves ~8 lakh JEE/NEET questions to students across India's coaching institutes...
*(Refer to git history or original brief for full background).*

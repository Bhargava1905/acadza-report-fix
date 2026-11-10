# Acadza Product Philosophy: The "Report → Fix" Engine (`PRODUCT.md`)

---

### 1. Who Loses the Most When a Question is Broken?

The obvious answer is "the student who reported it." **That answer is wrong.**

The student who reported the defect has already encountered the error, felt skeptical, and taken action. **The student who loses the most is the quiet, hardworking 17-year-old student who encounters the question next, gets marked wrong, assumes *they* were foolish, spends 45 minutes re-solving it in tears at midnight, and loses faith in their own conceptual ability.**

In high-stakes exams like JEE and NEET where ranks are decided by single marks, an erroneous question damages more than test scores—it destroys self-confidence.

#### How Our Design Reflects This:
1. **P0 Urgency on Answer Keys**: In our console queue, answer key defects (`answer_key`) are forced to the top above cosmetic typos. An unnoticed wrong key hurts thousands of test-takers every hour a mock test runs.
2. **Multi-Report Amplifier**: Questions with multiple reports receive immediate urgency escalation, reflecting compounding student distress.
3. **Compassionate Student Replies**: When a student is wrong, our AI does not simply state "Rejected." It explains *why* (e.g. reminding them to check units or phase formulas) so the student learns from the encounter rather than feeling dismissed.

---

### 2. What We Would NEVER Let the AI Auto-Apply

We would **never** let the AI auto-apply:
1. **Answer Key Changes on Ambiguous Questions**: An answer key change retroactively alters student ranks, percentiles, and cutoffs. If independent verification yields less than $98\%$ mathematical certainty or involves contested interpretations, it must halt for human faculty sign-off.
2. **Authoring New Distractors (`identical_options`)**: When options B and C are identical, creating a replacement option requires pedagogical domain knowledge. An AI hallucinating an invalid distractor can render an entire question unsound.
3. **Syllabus / Chapter Deletions (`syllabus`, `wrong_chapter`)**: Questions marked out of syllabus by students must stay live until an academic head confirms NTA/NCERT guidelines. Auto-deleting valid questions based on student claims artificially shrinks the question bank.

---

### 3. The One Metric We Would Watch in Week 1

> **"Mean Time to Neutralization (MTTN) for P0 Answer Key Defects"**
> *(The elapsed time from the first student report of a wrong answer key to verified deployment in production.)*

- Today, a broken question remains live for days while faculty manually wade through uncurated inboxes.
- By grouping reports, running automated independent solves, and presenting faculty with a **1-click visual diff**, our target is to reduce MTTN from **72 hours to under 15 minutes**.
- A secondary guardrail metric: **"Faculty Rejection Rate of Auto-Proposals"** (must remain $<3\%$, ensuring high faculty trust).

---

### 4. One Idea Beyond This Brief: "Live Telemetry Anomaly Detection"

Why wait for a student to tap "Report error"?

Most students who get burned by a wrong answer key **never report it**—they just exit the test frustrated. 

We propose **Telemetry-Driven Proactive Triage**:
- When a question's selection distribution suddenly deviates from historical cohort baselines (e.g., $82\%$ of top-decile students choose option (A), but the database answer key is (C)), the system flags an **automated internal defect alert**.
- The triage engine independently re-solves the question and places it into the faculty review console *before* the first student complaint is ever typed.
- We shift from a **reactive** support desk to a **self-healing question bank**.

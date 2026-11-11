# Bonus: Unreported Defect Candidates in the Acadza Dataset

As noted in the assignment brief:
> *"Bonus: our data has defects nobody reported. Find them."*

Our audit of all 43 questions in `questions.json` identified the following candidates in questions with zero student reports. These are **not auto-applied**: each requires a subject-matter/faculty check against the live rendering and source record before it becomes a production repair.

---

### 1. Unreported Defect #1: Typos in Stored Solution
- **Question ID**: `68dea657387eea3d0d95f54a`
- **Subject**: Physics | **Chapter**: Geometrical optics and optical instruments
- **Question Type**: `integerQuestion`
- **Stored Answer**: `5`
- **Defect Description**:
  In the official step-by-step solution, there are OCR/typographical errors in mathematical subscript labels:
  ```html
  Equivalent power of the lens system is P_eq = 1 / 0.1 = 10 D = 2 P_eqcu
  Optical power of each lens is P_eqch = 5 D
  ```
  `P_eqcu` and `P_eqch` are garbled typos for `P_each`.
- **Recommended Repair**: `spelling` / `solution_fix`
- **Surgical Edit**:
  `{"field": "solution", "find": "P_{ eqcu }", "replace": "P_{ \\text{each} }"}`

---

### 2. Unreported Defect #2: Notation Inconsistency in Lens Formula
- **Question ID**: `68dea6e6387eea3d0d95f6f8`
- **Subject**: Physics | **Chapter**: Geometrical optics and optical instruments
- **Question Type**: `integerQuestion`
- **Stored Answer**: `16`
- **Defect Description**:
  In the derivation for displacement method:
  `x^2 = D^2 - 4 D F` uses uppercase `F` (which denotes force in standard notation) instead of focal length `f`. The subsequent line abruptly switches back to lowercase: `x = \sqrt{D(D - 4f)}`.
- **Recommended Repair**: `notation`
- **Surgical Edit**:
  `{"field": "solution", "find": "4 D F", "replace": "4 D f"}`

---

### 3. Unreported Defect #3: Markup Leak & Broken Exponent in Capacitor Question
- **Question ID**: `68dea87d387eea3d0d95fbe3`
- **Subject**: Physics | **Chapter**: Electrostatics
- **Question Type**: `scq`
- **Stored Answer**: `A`
- **Defect Description**:
  The question stem contains malformed MathML with empty base tags:
  ```html
  <math><msup><mi></mi><mo>&minus; 1 </mo></msup></math>
  ```
  and cascading unclosed `<mspace linebreak="newline">` tags:
  ```html
  <mspace linebreak="newline">(B) 10 V<br />
  <mspace linebreak="newline">(C) 15 V<br />
  <mspace linebreak="newline">(D) 20 V</mspace></mspace></mspace>
  ```
  This causes awkward spacing and rendering glitches on mobile browsers.
- **Recommended Repair**: `markup_leak`
- **Surgical Edit**:
  Clean up nested `<mspace>` tags and fix `\text{volt}^{-1}` notation.

---

### 4. Unreported Defect #4: Flagged Unreviewed Defect
- **Question ID**: `695ede2a88d7701e561aa9d9`
- **Subject**: Zoology | **Chapter**: Excretory Products and their Elimination
- **Question Type**: `scq`
- **Stored Answer**: `D`
- **Defect Description**:
  Database record contains `error: 1` flag from ingestion, but `errorHistory` is empty `[]`. Redundant escaped apostrophes `&#39;` in Statement-I and Statement-II compromise readability on devices without entity decoders.
- **Recommended Repair**: `noise`

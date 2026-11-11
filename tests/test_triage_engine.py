"""Regression tests for the offline triage runner and its safety gate."""

import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
ENGINE_PATH = ROOT / "triage_engine.py"
SPEC = importlib.util.spec_from_file_location("triage_engine", ENGINE_PATH)
ENGINE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(ENGINE)


class TriageEngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.reports, cls.questions, cls.taxonomy = ENGINE.load_data()
        cls.generated = ENGINE.triage_all(cls.reports, cls.questions, cls.taxonomy)
        cls.committed = json.loads((ROOT / "results.json").read_text(encoding="utf-8"))

    def test_all_source_reports_have_one_result(self):
        self.assertEqual(len(self.reports), 44)
        self.assertEqual(len(self.generated), len(self.reports))
        self.assertEqual(
            {report["reportId"] for report in self.generated},
            {report["reportId"] for report in self.reports},
        )

    def test_generated_output_is_the_committed_output(self):
        self.assertEqual(self.generated, self.committed)

    def test_every_result_satisfies_the_fail_closed_gate(self):
        for result in self.generated:
            with self.subTest(report_id=result["reportId"]):
                ENGINE.validate_result(result, self.questions[result["questionId"]], self.taxonomy)

    def test_every_surgical_find_token_exists_in_the_current_record(self):
        for result in self.generated:
            edit = result["edit"]
            if edit is None:
                continue
            with self.subTest(report_id=result["reportId"]):
                target = ENGINE._edit_target(self.questions[result["questionId"]], edit["field"])
                self.assertIn(edit["find"], target)

    def test_malformed_mcq_answer_has_a_real_patch_target(self):
        result = next(item for item in self.generated if item["reportId"] == "R020")
        self.assertEqual(result["edit"], {
            "field": "answer",
            "find": "A, B, D",
            "replace": '["A", "B", "D"]',
        })

    def test_non_auto_repairs_are_never_auto_applied(self):
        for result in self.generated:
            if result["repair"] is None:
                continue
            repair = self.taxonomy["repairs"][result["repair"]]
            if not repair["auto"]:
                self.assertEqual(result["route"], "faculty_review")

if __name__ == "__main__":
    unittest.main(verbosity=2)

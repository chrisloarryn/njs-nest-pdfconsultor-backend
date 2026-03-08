#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def append_summary(summary_file: str | None, content: str) -> None:
    if not summary_file:
        return
    with Path(summary_file).open("a", encoding="utf-8") as handle:
        handle.write(content.rstrip() + "\n")


def write_output(output_file: str | None, key: str, value: str) -> None:
    if not output_file:
        return
    with Path(output_file).open("a", encoding="utf-8") as handle:
        handle.write(f"{key}={value}\n")


def format_duration(seconds: float) -> str:
    return f"{seconds:.2f}s"


def load_json(path: str) -> dict:
    report = Path(path)
    if not report.exists():
        return {}
    return json.loads(report.read_text(encoding="utf-8"))


def parse_test_report(data: dict) -> dict[str, float | int | list[tuple[str, int, int]]]:
    test_results = data.get("testResults", [])
    start_time = data.get("startTime", 0)
    end_time = max((suite.get("endTime", start_time) for suite in test_results), default=start_time)
    suites = []
    for suite in test_results:
        assertions = suite.get("assertionResults", [])
        failures = sum(1 for assertion in assertions if assertion.get("status") == "failed")
        suites.append((Path(suite.get("name", "unknown")).name, len(assertions), failures))

    return {
        "tests": int(data.get("numTotalTests", 0)),
        "failed": int(data.get("numFailedTests", 0)),
        "skipped": int(data.get("numPendingTests", 0)),
        "suites": int(data.get("numTotalTestSuites", len(test_results))),
        "duration_seconds": max(0.0, float(end_time - start_time) / 1000.0),
        "suite_details": suites,
    }


def summarize_tests(args: argparse.Namespace) -> int:
    vitest = parse_test_report(load_json(args.vitest_json))
    jest = parse_test_report(load_json(args.jest_json))

    totals = {
        "unit_tests": vitest["tests"],
        "unit_failed": vitest["failed"],
        "unit_suites": vitest["suites"],
        "unit_duration_seconds": vitest["duration_seconds"],
        "e2e_tests": jest["tests"],
        "e2e_failed": jest["failed"],
        "e2e_suites": jest["suites"],
        "e2e_duration_seconds": jest["duration_seconds"],
        "total_tests": int(vitest["tests"]) + int(jest["tests"]),
        "total_failed": int(vitest["failed"]) + int(jest["failed"]),
        "total_duration_seconds": float(vitest["duration_seconds"]) + float(jest["duration_seconds"]),
    }

    for key, value in totals.items():
        write_output(args.output_file, key, str(value))

    unit_rows = "\n".join(
        f"| `{suite_name}` | {tests} | {failed} |"
        for suite_name, tests, failed in vitest["suite_details"]
    ) or "| No unit suites found | 0 | 0 |"
    e2e_rows = "\n".join(
        f"| `{suite_name}` | {tests} | {failed} |"
        for suite_name, tests, failed in jest["suite_details"]
    ) or "| No e2e suites found | 0 | 0 |"

    append_summary(
        args.summary_file,
        "\n".join(
            [
                "## Tests",
                "",
                "| Suite | Tests | Failures | Duration |",
                "| --- | ---: | ---: | ---: |",
                f"| Unit (Vitest) | {vitest['tests']} | {vitest['failed']} | {format_duration(float(vitest['duration_seconds']))} |",
                f"| E2E (Jest) | {jest['tests']} | {jest['failed']} | {format_duration(float(jest['duration_seconds']))} |",
                f"| Total | {totals['total_tests']} | {totals['total_failed']} | {format_duration(float(totals['total_duration_seconds']))} |",
                "",
                "| Unit suite | Tests | Failures |",
                "| --- | ---: | ---: |",
                unit_rows,
                "",
                "| E2E suite | Tests | Failures |",
                "| --- | ---: | ---: |",
                e2e_rows,
                "",
            ]
        ),
    )
    return 0


def summarize_coverage(args: argparse.Namespace) -> int:
    report_path = Path(args.coverage_json)
    if not report_path.exists():
        write_output(args.output_file, "line_coverage_pct", "0")
        write_output(args.output_file, "covered_lines", "0")
        write_output(args.output_file, "missed_lines", "0")
        write_output(args.output_file, "coverage_threshold_pct", str(args.minimum_ratio))
        write_output(args.output_file, "gate_passed", "false")
        append_summary(
            args.summary_file,
            "\n".join(
                [
                    "## Coverage",
                    "",
                    "Coverage summary was not generated.",
                    "",
                ]
            ),
        )
        return 0

    report = json.loads(report_path.read_text(encoding="utf-8"))
    lines = report["total"]["lines"]
    threshold = float(args.minimum_ratio)
    gate_passed = float(lines["pct"]) >= threshold

    write_output(args.output_file, "line_coverage_pct", str(lines["pct"]))
    write_output(args.output_file, "covered_lines", str(lines["covered"]))
    write_output(args.output_file, "missed_lines", str(lines["total"] - lines["covered"]))
    write_output(args.output_file, "coverage_threshold_pct", str(threshold))
    write_output(args.output_file, "gate_passed", str(gate_passed).lower())

    append_summary(
        args.summary_file,
        "\n".join(
            [
                "## Coverage",
                "",
                "| Metric | Value |",
                "| --- | --- |",
                f"| Line coverage | {lines['pct']}% |",
                f"| Covered lines | {lines['covered']} |",
                f"| Missed lines | {lines['total'] - lines['covered']} |",
                f"| Threshold | {threshold}% |",
                f"| Gate | {'PASS' if gate_passed else 'FAIL'} |",
                "",
            ]
        ),
    )
    return 0


def summarize_contract(args: argparse.Namespace) -> int:
    report_path = Path(args.junit_xml)
    if not report_path.exists():
        for key in ["contract_tests", "contract_failures", "contract_errors", "contract_skipped", "contract_duration_seconds"]:
            write_output(args.output_file, key, "0")
        append_summary(
            args.summary_file,
            "\n".join(
                [
                    "## Contract Tests",
                    "",
                    "Schemathesis JUnit report was not generated.",
                    "",
                ]
            ),
        )
        return 0

    root = ET.parse(report_path).getroot()
    suites = root.findall("testsuite") if root.tag == "testsuites" else [root]

    totals = {
        "contract_tests": 0,
        "contract_failures": 0,
        "contract_errors": 0,
        "contract_skipped": 0,
        "contract_duration_seconds": 0.0,
    }
    suite_rows = []
    for suite in suites:
        tests = int(float(suite.attrib.get("tests", "0")))
        failures = int(float(suite.attrib.get("failures", "0")))
        errors = int(float(suite.attrib.get("errors", "0")))
        skipped = int(float(suite.attrib.get("skipped", "0")))
        duration = float(suite.attrib.get("time", "0"))
        suite_rows.append((suite.attrib.get("name", "schemathesis"), tests, failures + errors, skipped))
        totals["contract_tests"] += tests
        totals["contract_failures"] += failures
        totals["contract_errors"] += errors
        totals["contract_skipped"] += skipped
        totals["contract_duration_seconds"] += duration

    for key, value in totals.items():
        write_output(args.output_file, key, str(value))

    suite_lines = "\n".join(
        f"| `{name}` | {tests} | {failed} | {skipped} |"
        for name, tests, failed, skipped in suite_rows
    ) or "| `schemathesis` | 0 | 0 | 0 |"

    append_summary(
        args.summary_file,
        "\n".join(
            [
                "## Contract Tests",
                "",
                "| Metric | Value |",
                "| --- | --- |",
                f"| Tests | {totals['contract_tests']} |",
                f"| Failures | {totals['contract_failures']} |",
                f"| Errors | {totals['contract_errors']} |",
                f"| Skipped | {totals['contract_skipped']} |",
                f"| Duration | {format_duration(float(totals['contract_duration_seconds']))} |",
                "",
                "| Suite | Tests | Failed | Skipped |",
                "| --- | ---: | ---: | ---: |",
                suite_lines,
                "",
            ]
        ),
    )
    return 0


def summarize_performance(args: argparse.Namespace) -> int:
    report_path = Path(args.summary_json)
    if not report_path.exists():
        for key in [
            "requests_total",
            "failed_rate_pct",
            "checks_pass_rate_pct",
            "avg_ms",
            "health_p95_ms",
            "bank_p95_ms",
            "bank_p99_ms",
            "throughput_rps",
            "thresholds_failed",
        ]:
            write_output(args.output_file, key, "0")
        append_summary(
            args.summary_file,
            "\n".join(
                [
                    "## Performance Tests",
                    "",
                    "k6 summary was not generated.",
                    "",
                ]
            ),
        )
        return 0

    report = json.loads(report_path.read_text(encoding="utf-8"))
    requests = report.get("requests", {})
    checks = report.get("checks", {})
    durations = report.get("durations_ms", {})
    thresholds = report.get("thresholds", {})

    outputs = {
        "requests_total": requests.get("total", 0),
        "failed_rate_pct": round(float(requests.get("failed_rate", 0)) * 100, 2),
        "checks_pass_rate_pct": round(float(checks.get("pass_rate", 0)) * 100, 2),
        "avg_ms": round(float(durations.get("avg", 0)), 2),
        "health_p95_ms": round(float(durations.get("health_p95", 0)), 2),
        "bank_p95_ms": round(float(durations.get("bank_statements_p95", 0)), 2),
        "bank_p99_ms": round(float(durations.get("bank_statements_p99", 0)), 2),
        "throughput_rps": round(float(requests.get("throughput_rps", 0)), 2),
        "thresholds_failed": len(thresholds.get("failed", [])),
    }

    for key, value in outputs.items():
        write_output(args.output_file, key, str(value))

    failed_threshold_lines = "\n".join(f"- `{entry}`" for entry in thresholds.get("failed", [])) or "- None"
    append_summary(
        args.summary_file,
        "\n".join(
            [
                "## Performance Tests",
                "",
                "| Metric | Value |",
                "| --- | --- |",
                f"| Requests | {outputs['requests_total']} |",
                f"| Failed request rate | {outputs['failed_rate_pct']}% |",
                f"| Check pass rate | {outputs['checks_pass_rate_pct']}% |",
                f"| Average duration | {outputs['avg_ms']}ms |",
                f"| Health p95 | {outputs['health_p95_ms']}ms |",
                f"| Bank statements p95 | {outputs['bank_p95_ms']}ms |",
                f"| Bank statements p99 | {outputs['bank_p99_ms']}ms |",
                f"| Throughput | {outputs['throughput_rps']} req/s |",
                f"| Failed thresholds | {outputs['thresholds_failed']} |",
                "",
                "Failed thresholds:",
                failed_threshold_lines,
                "",
            ]
        ),
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    tests_parser = subparsers.add_parser("tests")
    tests_parser.add_argument("--vitest-json", required=True)
    tests_parser.add_argument("--jest-json", required=True)
    tests_parser.add_argument("--summary-file")
    tests_parser.add_argument("--output-file")
    tests_parser.set_defaults(func=summarize_tests)

    coverage_parser = subparsers.add_parser("coverage")
    coverage_parser.add_argument("--coverage-json", required=True)
    coverage_parser.add_argument("--minimum-ratio", type=float, required=True)
    coverage_parser.add_argument("--summary-file")
    coverage_parser.add_argument("--output-file")
    coverage_parser.set_defaults(func=summarize_coverage)

    contract_parser = subparsers.add_parser("contract")
    contract_parser.add_argument("--junit-xml", required=True)
    contract_parser.add_argument("--summary-file")
    contract_parser.add_argument("--output-file")
    contract_parser.set_defaults(func=summarize_contract)

    performance_parser = subparsers.add_parser("performance")
    performance_parser.add_argument("--summary-json", required=True)
    performance_parser.add_argument("--summary-file")
    performance_parser.add_argument("--output-file")
    performance_parser.set_defaults(func=summarize_performance)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())

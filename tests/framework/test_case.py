"""Test case, assertions, and test result data structures."""
import os
import time
import traceback
from typing import Any, Callable, Dict, List, Optional
from .colors import Colors, c_bold, c_cyan, c_dim, c_fail, c_green, c_pass, c_red, c_skip, c_yellow


class TestResult:
    """Stores the execution outcome of an individual test."""

    def __init__(self, name: str, tier: int, deliverable: str, description: str = ""):
        self.name = name
        self.tier = tier
        self.deliverable = deliverable
        self.description = description
        self.status: str = "PENDING"  # PASS, FAIL, SKIP
        self.duration_ms: float = 0.0
        self.error_message: Optional[str] = None
        self.error_traceback: Optional[str] = None
        self.details: Dict[str, Any] = {}

    def mark_pass(self, duration_ms: float):
        self.status = "PASS"
        self.duration_ms = duration_ms

    def mark_fail(self, error: Exception, duration_ms: float):
        self.status = "FAIL"
        self.duration_ms = duration_ms
        self.error_message = str(error)
        self.error_traceback = traceback.format_exc()

    def mark_skip(self, reason: str):
        self.status = "SKIP"
        self.error_message = reason
        self.duration_ms = 0.0

    def format_line(self, index: int, total: int) -> str:
        dur_str = f"{self.duration_ms:.1f}ms".rjust(8)
        tag = f"[T{self.tier}:{self.deliverable.upper()}]".ljust(10)
        idx_str = f"[{index}/{total}]".rjust(9)

        if self.status == "PASS":
            status_badge = c_pass("PASS")
            return f" {idx_str} {status_badge} {c_cyan(tag)} {self.name} {c_dim(dur_str)}"
        elif self.status == "FAIL":
            status_badge = c_fail("FAIL")
            err_short = f" -> {self.error_message}" if self.error_message else ""
            return f" {idx_str} {status_badge} {c_red(tag)} {c_bold(self.name)} {c_dim(dur_str)}{c_red(err_short)}"
        else:
            status_badge = c_skip("SKIP")
            reason_str = f" ({self.error_message})" if self.error_message else ""
            return f" {idx_str} {status_badge} {c_yellow(tag)} {self.name}{c_dim(reason_str)}"


class Assertions:
    """Standard assertion methods with informative error messages."""

    @staticmethod
    def assert_true(condition: bool, msg: str = "Expected condition to be True"):
        if not condition:
            raise AssertionError(msg)

    @staticmethod
    def assert_false(condition: bool, msg: str = "Expected condition to be False"):
        if condition:
            raise AssertionError(msg)

    @staticmethod
    def assert_equal(actual: Any, expected: Any, msg: Optional[str] = None):
        if actual != expected:
            raise AssertionError(msg or f"Expected {expected!r}, but got {actual!r}")

    @staticmethod
    def assert_not_equal(actual: Any, expected: Any, msg: Optional[str] = None):
        if actual == expected:
            raise AssertionError(msg or f"Expected value not to equal {expected!r}")

    @staticmethod
    def assert_in(item: Any, container: Any, msg: Optional[str] = None):
        if item not in container:
            raise AssertionError(msg or f"Expected {item!r} to be in container")

    @staticmethod
    def assert_greater_equal(actual: Any, threshold: Any, msg: Optional[str] = None):
        if actual < threshold:
            raise AssertionError(msg or f"Expected {actual!r} >= {threshold!r}")

    @staticmethod
    def assert_less_equal(actual: Any, threshold: Any, msg: Optional[str] = None):
        if actual > threshold:
            raise AssertionError(msg or f"Expected {actual!r} <= {threshold!r}")

    @staticmethod
    def assert_is_not_none(value: Any, msg: str = "Expected value not to be None"):
        if value is None:
            raise AssertionError(msg)

    @staticmethod
    def assert_no_console_errors(browser, msg: str = "Expected zero browser console/page errors"):
        errors = browser.console_errors + browser.page_errors
        if errors:
            raise AssertionError(f"{msg}. Errors encountered: {errors}")


class TestCase(Assertions):
    """Abstract base class for individual test implementations."""

    def __init__(self, name: str, tier: int, deliverable: str, description: str = ""):
        self.name = name
        self.tier = tier
        self.deliverable = deliverable
        self.description = description

    def ensure_page(self, browser, file_path: str):
        """Navigates to the file if the browser is not already on it."""
        clean_path = file_path.replace("\\", "/").lower()
        parts = clean_path.split("/")
        key = "/".join(parts[-2:]) if len(parts) >= 2 else parts[-1]
        current_url = (browser.evaluate("window.location.href") or "").lower().replace("\\", "/")
        if key not in current_url:
            browser.navigate(file_path)

    def run(self, context: Dict[str, Any]) -> TestResult:
        result = TestResult(self.name, self.tier, self.deliverable, self.description)
        start = time.perf_counter()
        try:
            self.execute(context)
            elapsed_ms = (time.perf_counter() - start) * 1000.0
            result.mark_pass(elapsed_ms)
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start) * 1000.0
            result.mark_fail(e, elapsed_ms)
        return result

    def execute(self, context: Dict[str, Any]):
        raise NotImplementedError("Subclasses must implement execute(context)")

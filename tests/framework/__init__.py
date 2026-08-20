"""Test framework package."""
from .browser import BrowserSession
from .colors import Colors, c_bold, c_cyan, c_dim, c_fail, c_green, c_pass, c_red, c_skip, c_yellow, colored
from .dom_inspector import DOMInspector
from .markdown_inspector import MarkdownCatalogInspector
from .test_case import Assertions, TestCase, TestResult

__all__ = [
    "BrowserSession",
    "Colors",
    "colored",
    "c_pass",
    "c_fail",
    "c_skip",
    "c_cyan",
    "c_green",
    "c_red",
    "c_yellow",
    "c_dim",
    "c_bold",
    "DOMInspector",
    "MarkdownCatalogInspector",
    "Assertions",
    "TestCase",
    "TestResult",
]

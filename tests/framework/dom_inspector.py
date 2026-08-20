"""Statutory DOM and HTML inspector for standalone single-file web applications."""
import os
import re
from html.parser import HTMLParser
from typing import Any, Dict, List, Optional, Set


class SimpleDOMParser(HTMLParser):
    """Parses HTML into element tags, attributes, and text nodes."""

    def __init__(self):
        super().__init__()
        self.tags: List[str] = []
        self.ids: Set[str] = set()
        self.classes: Set[str] = set()
        self.buttons: List[Dict[str, str]] = []
        self.canvases: List[Dict[str, str]] = []
        self.scripts: List[str] = []
        self.styles: List[str] = []
        self.external_links: List[str] = []
        self.external_scripts: List[str] = []
        self._current_script = None
        self._current_style = None

    def handle_starttag(self, tag: str, attrs: List[tuple]):
        self.tags.append(tag)
        attr_dict = dict(attrs)

        if "id" in attr_dict:
            self.ids.add(attr_dict["id"])

        if "class" in attr_dict:
            for c in attr_dict["class"].split():
                self.classes.add(c)

        if tag == "button":
            self.buttons.append(attr_dict)

        if tag == "canvas":
            self.canvases.append(attr_dict)

        if tag == "link" and attr_dict.get("rel") == "stylesheet":
            href = attr_dict.get("href", "")
            if href:
                self.external_links.append(href)

        if tag == "script":
            src = attr_dict.get("src", "")
            if src:
                self.external_scripts.append(src)
            else:
                self._current_script = []

        if tag == "style":
            self._current_style = []

    def handle_endtag(self, tag: str):
        if tag == "script" and self._current_script is not None:
            self.scripts.append("".join(self._current_script))
            self._current_script = None
        if tag == "style" and self._current_style is not None:
            self.styles.append("".join(self._current_style))
            self._current_style = None

    def handle_data(self, data: str):
        if self._current_script is not None:
            self._current_script.append(data)
        if self._current_style is not None:
            self._current_style.append(data)


class DOMInspector:
    """Provides deep structural, CSS, and JS static analysis of single-file applications."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Target file not found: {file_path}")

        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            self.raw_content = f.read()

        self.parser = SimpleDOMParser()
        self.parser.feed(self.raw_content)

    @property
    def element_ids(self) -> Set[str]:
        return self.parser.ids

    @property
    def element_classes(self) -> Set[str]:
        return self.parser.classes

    @property
    def scripts_code(self) -> str:
        return "\n".join(self.parser.scripts)

    @property
    def styles_code(self) -> str:
        return "\n".join(self.parser.styles)

    def has_id(self, elem_id: str) -> bool:
        return elem_id in self.parser.ids

    def has_class(self, class_name: str) -> bool:
        return class_name in self.parser.classes

    def has_button_with_id(self, btn_id: str) -> bool:
        return any(b.get("id") == btn_id for b in self.parser.buttons)

    def has_button_matching(self, pattern: str) -> bool:
        regex = re.compile(pattern, re.IGNORECASE)
        for b in self.parser.buttons:
            if regex.search(b.get("id", "")) or regex.search(b.get("class", "")) or regex.search(b.get("title", "")):
                return True
        # Also check raw HTML buttons
        btn_matches = re.findall(r"<button[^>]*>(.*?)</button>", self.raw_content, re.DOTALL | re.IGNORECASE)
        return any(regex.search(m) for m in btn_matches)

    def verify_zero_external_dependencies(self) -> Dict[str, Any]:
        """Verify that only Google Fonts (or no CDNs) are imported."""
        disallowed_scripts = []
        for src in self.parser.external_scripts:
            # All external scripts are disallowed for single-file self-contained apps
            disallowed_scripts.append(src)

        disallowed_links = []
        for href in self.parser.external_links:
            # Allow only fonts.googleapis.com / fonts.gstatic.com
            if not ("fonts.googleapis.com" in href or "fonts.gstatic.com" in href):
                disallowed_links.append(href)

        return {
            "is_valid": len(disallowed_scripts) == 0 and len(disallowed_links) == 0,
            "disallowed_scripts": disallowed_scripts,
            "disallowed_links": disallowed_links,
        }

    def verify_color_tokens(self, required_tokens: List[str]) -> Dict[str, bool]:
        """Check presence of CSS color tokens."""
        styles = self.styles_code
        results = {}
        for token in required_tokens:
            results[token] = token.lower() in styles.lower() or token.lower() in self.raw_content.lower()
        return results

    def verify_js_functions(self, function_names: List[str]) -> Dict[str, bool]:
        """Check presence of JS functions or methods."""
        code = self.scripts_code
        results = {}
        for fn in function_names:
            pattern = rf"(function\s+{fn}|{fn}\s*[:=]\s*(?:async\s*)?function|{fn}\s*\([^)]*\)\s*\{{|class\s+\w+.*{fn}|const\s+{fn}\s*=|let\s+{fn}\s*=)"
            results[fn] = bool(re.search(pattern, code)) or (fn in code)
        return results

    def verify_web_audio_api(self) -> bool:
        """Check usage of Web Audio API."""
        code = self.scripts_code
        return "AudioContext" in code or "webkitAudioContext" in code or "createOscillator" in code

    def verify_canvas_rendering(self) -> bool:
        """Check usage of Canvas 2D / WebGL rendering context."""
        code = self.scripts_code
        return "getContext('2d')" in code or "getContext(\"2d\")" in code or "getContext('webgl')" in code

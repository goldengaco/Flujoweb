"""Statutory Markdown Inspector for R5 (80 Innovation Ideas Catalog)."""
import os
import re
from typing import Any, Dict, List, Optional, Set


class MarkdownCatalogInspector:
    """Rigorous structural, domain, and quantitative validator for mulesoft_80_ideas_observabilidad.md."""

    DOMAINS = [
        "Fintech & Real-Time Payments",
        "Healthcare & HL7/FHIR Telemetry",
        "Retail, E-Commerce & Omnichannel",
        "SRE, CloudOps & Hybrid Mesh Observability",
        "Cyber-Defense, Threat Hunting & Zero-Trust",
        "IoT, Public Safety & Smart Buildings",
        "Logistics, Cold Chain & Global Supply Chain",
        "Telecom, 5G Network Slicing & Edge Gateways",
    ]

    REQUIRED_FIELDS = [
        "Domain & Sub-domain",
        "Business Problem & Opportunity",
        "End-to-End Architectural Data Flow",
        "Core Observability Metrics, KPIs & SLO Targets",
        "Commercial Monetization Model / ROI Impact",
        "Implementation Blueprint & Policy Stack",
    ]

    def __init__(self, file_path: str):
        self.file_path = file_path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Markdown catalog not found: {file_path}")

        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            self.raw_text = f.read()
            self.lines = self.raw_text.splitlines()

    @property
    def total_words(self) -> int:
        return len(re.findall(r"\b\w+\b", self.raw_text))

    @property
    def total_lines(self) -> int:
        return len(self.lines)

    def extract_numbered_ideas(self) -> List[Dict[str, Any]]:
        """Extracts all 80 numbered ideas matching '### 01. ...' through '### 80. ...'."""
        pattern = re.compile(
            r"^###\s+(\d{2})\.\s+(.+)$",
            re.MULTILINE,
        )
        matches = list(pattern.finditer(self.raw_text))
        ideas = []

        for i, match in enumerate(matches):
            num = int(match.group(1))
            title = match.group(2).strip()
            start_pos = match.start()
            end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(self.raw_text)
            content = self.raw_text[start_pos:end_pos]

            fields = {}
            for field in self.REQUIRED_FIELDS:
                # Check if the field header exists in the idea block
                field_pattern = rf"-\s+\*\*{re.escape(field)}\*\*:"
                has_field = bool(re.search(field_pattern, content, re.IGNORECASE))
                fields[field] = has_field

            ideas.append({
                "number": num,
                "title": title,
                "content": content,
                "fields": fields,
            })

        return ideas

    def verify_80_ideas_completeness(self) -> Dict[str, Any]:
        ideas = self.extract_numbered_ideas()
        numbers = [i["number"] for i in ideas]
        expected_numbers = list(range(1, 81))
        missing = [n for n in expected_numbers if n not in numbers]
        duplicates = [n for n in set(numbers) if numbers.count(n) > 1]

        return {
            "total_count": len(ideas),
            "is_complete_80": len(ideas) == 80 and len(missing) == 0,
            "missing_numbers": missing,
            "duplicate_numbers": duplicates,
            "first_idea": ideas[0]["title"] if ideas else None,
            "last_idea": ideas[-1]["title"] if ideas else None,
        }

    def verify_domain_coverage(self) -> Dict[str, Any]:
        """Checks if all 8 enterprise domains are present and covered."""
        results = {}
        text_lower = self.raw_text.lower()
        for domain in self.DOMAINS:
            d_clean = domain.split("&")[0].strip().lower()
            present = d_clean in text_lower
            count = len(re.findall(re.escape(domain.split("&")[0].strip()), self.raw_text, re.IGNORECASE))
            results[domain] = {
                "present": present,
                "mention_count": count,
            }

        all_present = all(r["present"] for r in results.values())
        return {
            "all_8_domains_present": all_present,
            "domain_details": results,
        }

    def verify_mandatory_fields_coverage(self) -> Dict[str, Any]:
        ideas = self.extract_numbered_ideas()
        field_coverage = {f: 0 for f in self.REQUIRED_FIELDS}

        for idea in ideas:
            for f in self.REQUIRED_FIELDS:
                if idea["fields"].get(f):
                    field_coverage[f] += 1

        all_100_pct = all(count == len(ideas) and count == 80 for count in field_coverage.values())
        return {
            "all_fields_populated": all_100_pct,
            "coverage_counts": field_coverage,
            "total_ideas_evaluated": len(ideas),
        }

    def verify_architectural_keywords(self) -> Dict[str, int]:
        keywords = [
            "Apigee",
            "MuleSoft",
            "DataWeave",
            "AWS",
            "GCP",
            "Google Cloud",
            "SAP",
            "Object Store",
            "Latency",
            "SLO",
        ]
        return {kw: len(re.findall(r"\b" + re.escape(kw) + r"\b", self.raw_text, re.IGNORECASE)) for kw in keywords}

    def verify_zero_placeholders(self) -> Dict[str, Any]:
        placeholders = [
            r"\[TODO\]",
            r"\[TBD\]",
            r"TODO:",
            r"TBD:",
            r"Lorem ipsum",
            r"fill in later",
            r"\[placeholder\]",
            r"FIXME",
        ]
        findings = []
        for p in placeholders:
            matches = re.findall(p, self.raw_text, re.IGNORECASE)
            if matches:
                findings.append({"pattern": p, "count": len(matches)})

        return {
            "has_no_placeholders": len(findings) == 0,
            "placeholder_findings": findings,
        }

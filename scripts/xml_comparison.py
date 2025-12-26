#!/usr/bin/env python3
"""
Compare two XML documents and write a structural diff report.

Usage:
    python3 scripts/xml_comparison.py path/to/file_a.xml path/to/file_b.xml

The script emits a timestamped report inside <repo>/project/diffs/.
"""

from __future__ import annotations

import argparse
from datetime import datetime
from dataclasses import dataclass
from itertools import zip_longest
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare two XML files and write a structural diff report."
    )
    parser.add_argument("first", help="Path to the first XML file.")
    parser.add_argument("second", help="Path to the second XML file.")
    return parser.parse_args()


HTML_TAG_PATTERN = re.compile(r"<html\b[^>]*>", re.IGNORECASE)
OPTIONAL_NAMESPACES = {
    "g": "http://schemas.google.com/g/2005",
}


@dataclass
class DiffEvent:
    kind: str  # added, removed, changed
    path: str
    detail: str


def add_missing_namespaces(xml_text: str) -> str:
    needed: list[tuple[str, str]] = []
    for prefix, uri in OPTIONAL_NAMESPACES.items():
        if f"xmlns:{prefix}=" in xml_text:
            continue
        if f"<{prefix}:" not in xml_text and f"</{prefix}:" not in xml_text:
            continue
        needed.append((prefix, uri))
    if not needed:
        return xml_text

    match = HTML_TAG_PATTERN.search(xml_text)
    if not match:
        return xml_text

    start_tag = match.group(0)
    insertion = "".join(f' xmlns:{prefix}="{uri}"' for prefix, uri in needed)
    if start_tag.endswith("/>"):
        new_tag = start_tag[:-2] + insertion + " />"
    else:
        new_tag = start_tag[:-1] + insertion + ">"
    return xml_text.replace(start_tag, new_tag, 1)


def load_root(path: Path) -> ET.Element:
    parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))
    text = path.read_text(encoding="utf-8")
    text = add_missing_namespaces(text)
    try:
        return ET.fromstring(text, parser=parser)
    except ET.ParseError as exc:
        raise SystemExit(f"Failed to parse XML file '{path}': {exc}")


def normalized_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(value.split())


def local_name(tag: str | ET.QName | None) -> str:
    if not tag:
        return ""
    if isinstance(tag, ET.QName):
        return tag.localname
    if tag is ET.Comment:
        return "comment"
    if isinstance(tag, str) and tag.startswith("{"):
        return tag.split("}", 1)[1]
    if isinstance(tag, str):
        return tag
    return str(tag)


def describe_node(element: ET.Element | None) -> str:
    if element is None:
        return "node"
    name = local_name(element.tag)
    if name == "comment":
        return "comment"
    if name.lower() == "variable":
        label = element.attrib.get("name", "(unnamed)")
        return f"Variable '{label}'"
    return f"tag <{name}>"


def extend_path(path: str, tag: str | ET.QName | None) -> str:
    name = local_name(tag) or "node"
    if not path:
        return f"/{name}"
    return f"{path}/{name}"


def tag_label(element: ET.Element | None) -> str:
    if element is None:
        return "∅"
    tag = element.tag
    if isinstance(tag, str):
        return tag
    if tag is ET.Comment:
        return "<!--comment-->"
    return str(tag)


def compare_elements(
    first: ET.Element | None,
    second: ET.Element | None,
    path: str,
    events: list[DiffEvent],
) -> None:
    if first is None and second is None:
        return
    if first is None:
        current_path = extend_path(path, second.tag if second is not None else None)
        events.append(
            DiffEvent("added", current_path, f"Added {describe_node(second)}."),
        )
        for child in list(second):
            compare_elements(None, child, current_path, events)
        return
    if second is None:
        current_path = extend_path(path, first.tag if first is not None else None)
        events.append(
            DiffEvent("removed", current_path, f"Removed {describe_node(first)}."),
        )
        return

    current_path = extend_path(path, first.tag)
    if local_name(first.tag) != local_name(second.tag):
        events.append(
            DiffEvent(
                "changed",
                current_path,
                f"Tag changed from <{local_name(first.tag)}> to <{local_name(second.tag)}>.",
            )
        )
        return

    attrs_first = first.attrib
    attrs_second = second.attrib
    for key in sorted(set(attrs_first) - set(attrs_second)):
        events.append(
            DiffEvent("removed", current_path, f"Removed attribute '{key}'."),
        )
    for key in sorted(set(attrs_second) - set(attrs_first)):
        events.append(
            DiffEvent("added", current_path, f"Added attribute '{key}' = '{attrs_second[key]}'."),
        )
    for key in sorted(set(attrs_first) & set(attrs_second)):
        if attrs_first[key] != attrs_second[key]:
            events.append(
                DiffEvent(
                    "changed",
                    current_path,
                    f"Attribute '{key}' changed from '{attrs_first[key]}' to '{attrs_second[key]}'.",
                )
            )

    text_first = normalized_text(first.text)
    text_second = normalized_text(second.text)
    if text_first != text_second and (text_first or text_second):
        events.append(
            DiffEvent(
                "changed",
                current_path,
                "Inner text updated.",
            )
        )

    children_first = list(first)
    children_second = list(second)
    for idx, (left, right) in enumerate(
        zip_longest(children_first, children_second), start=1
    ):
        next_path = f"{current_path}[{idx}]"
        compare_elements(left, right, next_path, events)


def write_report(first: Path, second: Path, events: list[DiffEvent]) -> Path:
    repo_root = Path(__file__).resolve().parents[1]
    diff_dir = repo_root / "project" / "diffs"
    diff_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_path = diff_dir / f"{timestamp}-xml-diff.md"

    grouped: dict[str, list[DiffEvent]] = {"added": [], "removed": [], "changed": []}
    for event in events:
        grouped.setdefault(event.kind, []).append(event)

    lines: list[str] = [
        "# XML Diff Report",
        "",
        f"- Generated: {datetime.now().isoformat(timespec='seconds')}",
        f"- File A: `{first}`",
        f"- File B: `{second}`",
        "",
    ]

    for section in ("added", "removed", "changed"):
        entries = grouped.get(section, [])
        heading = section.capitalize()
        lines.append(f"## {heading}")
        if not entries:
            lines.append(f"- _No {section} elements detected._")
        else:
            for event in entries:
                lines.append(f"- `{event.path}` — {event.detail}")
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path


def main() -> int:
    args = parse_args()
    first_path = Path(args.first).expanduser().resolve()
    second_path = Path(args.second).expanduser().resolve()

    if not first_path.is_file():
        raise SystemExit(f"First file not found: {first_path}")
    if not second_path.is_file():
        raise SystemExit(f"Second file not found: {second_path}")

    root_a = load_root(first_path)
    root_b = load_root(second_path)

    events: list[DiffEvent] = []
    compare_elements(root_a, root_b, "", events)
    report_path = write_report(first_path, second_path, events)
    print(f"Diff report written to: {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

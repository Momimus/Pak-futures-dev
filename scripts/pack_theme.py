#!/usr/bin/env python3
"""
Rebuild a Blogger theme XML file from the modular unpacked directory.

Usage:
    python scripts/pack_theme.py path/to/unpacked path/to/output/theme.xml
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable
import xml.etree.ElementTree as ET
from xml.sax.saxutils import quoteattr

HTML_NS = "http://www.w3.org/1999/xhtml"
BLOGGER_NS = "http://www.google.com/2005/gml/b"
DATA_NS = "http://www.google.com/2005/gml/data"
EXPR_NS = "http://www.google.com/2005/gml/expr"
OPTIONAL_NAMESPACES = {
    "g": "http://schemas.google.com/g/2005",
}

STYLE_PLACEHOLDER_TOKEN = "__PCK_STYLES__"
PLACEHOLDER_PREFIX = "PCK_PLACEHOLDER "


def _register_namespaces() -> None:
    ET.register_namespace("", HTML_NS)
    ET.register_namespace("b", BLOGGER_NS)
    ET.register_namespace("data", DATA_NS)
    ET.register_namespace("expr", EXPR_NS)


def _qname(namespace: str, tag: str) -> str:
    return f"{{{namespace}}}{tag}"


def _decode_placeholder(text: str | None) -> dict | None:
    if not text:
        return None
    idx = text.find(PLACEHOLDER_PREFIX)
    if idx == -1:
        return None
    payload_hex = text[idx + len(PLACEHOLDER_PREFIX) :].strip()
    try:
        decoded = bytes.fromhex(payload_hex).decode("utf-8")
    except ValueError as exc:
        raise SystemExit(f"Invalid placeholder encoding detected: {text}") from exc
    return json.loads(decoded)


def _inject_optional_namespaces(xml_text: str) -> str:
    missing: list[tuple[str, str]] = []
    for prefix, uri in OPTIONAL_NAMESPACES.items():
        if f"xmlns:{prefix}=" in xml_text:
            continue
        if re.search(rf"</?{re.escape(prefix)}:", xml_text):
            missing.append((prefix, uri))
    if not missing:
        return xml_text

    match = re.search(r"<html\b[^>]*>", xml_text, flags=re.IGNORECASE)
    if not match:
        return xml_text

    tag = match.group(0)
    additions = "".join(f' xmlns:{prefix}="{uri}"' for prefix, uri in missing)
    replacement = tag[:-1] + additions + ">"
    return xml_text.replace(tag, replacement, 1)


def _parse_main_html(main_path: Path) -> ET.ElementTree:
    parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))
    xml_text = main_path.read_text(encoding="utf-8")
    xml_text = _inject_optional_namespaces(xml_text)
    try:
        root = ET.fromstring(xml_text, parser=parser)
    except ET.ParseError as exc:  # pragma: no cover - defensive guard
        raise SystemExit(f"Failed to parse '{main_path}': {exc}") from exc
    return ET.ElementTree(root)


def _iter_comment_nodes(root: ET.Element) -> Iterable[tuple[ET.Element, ET.Element, int]]:
    for parent in root.iter():
        children = list(parent)
        for idx, child in enumerate(children):
            if child.tag is ET.Comment:
                yield parent, child, idx


def _read_script_chunks(script_path: Path) -> dict[str, str]:
    if not script_path.exists():
        return {}

    start_re = re.compile(r"//\s*\[SCRIPT:(?P<id>[^\]]+)\]")
    end_re = re.compile(r"//\s*\[END SCRIPT\]")
    chunks: dict[str, str] = {}
    current_id: str | None = None
    buffer: list[str] = []

    with script_path.open(encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.rstrip("\r\n")
            start_match = start_re.match(line)
            if start_match:
                if current_id is not None:
                    raise SystemExit("Nested script markers detected in script.js.")
                current_id = start_match.group("id").strip()
                buffer = []
                continue

            if end_re.match(line):
                if current_id is None:
                    continue
                chunks[current_id] = "\n".join(buffer) + ("\n" if buffer else "")
                current_id = None
                buffer = []
                continue

            if current_id is not None:
                buffer.append(raw_line.rstrip("\r\n"))

    if current_id is not None:
        raise SystemExit("Missing // [END SCRIPT] marker in script.js.")

    return chunks


def _load_variables(path: Path) -> list[dict]:
    if not path.exists():
        raise SystemExit(f"Missing variables file: {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {path}: {exc}") from exc

    if not isinstance(data, list):
        raise SystemExit("Expected variables.json to contain a list of entries.")
    return data


def _format_attr_string(attrs: dict | None) -> str:
    if not attrs:
        return ""
    parts = []
    for key, value in attrs.items():
        if value is None:
            continue
        parts.append(f"{key}={quoteattr(str(value))}")
    return " ".join(parts)


def _build_variable_block(entries: list[dict]) -> str:
    if not entries:
        return ""

    lines: list[str] = ["/*", "<!-- Variable definitions -->"]
    current_group: dict | None = None

    for entry in entries:
        entry_type = entry.get("entry_type", "variable")
        if entry_type == "comment":
            text = entry.get("text", "").strip()
            if text:
                lines.append(f"<!-- {text} -->")
            continue

        if entry_type != "variable":
            continue

        group_attrs = entry.get("group")
        if group_attrs and not isinstance(group_attrs, dict):
            raise SystemExit("Invalid group entry detected in variables.json.")

        if not group_attrs and current_group:
            lines.append("</Group>")
            current_group = None

        if group_attrs:
            if current_group != group_attrs:
                if current_group:
                    lines.append("</Group>")
                lines.append(f"<Group {_format_attr_string(group_attrs)}>")
                current_group = dict(group_attrs)

        attr_items = {k: v for k, v in entry.items() if k not in {"entry_type", "group"}}
        if not attr_items:
            continue

        variable_line = f"<Variable {_format_attr_string(attr_items)}/>"
        if current_group:
            variable_line = "  " + variable_line
        lines.append(variable_line)

    if current_group:
        lines.append("</Group>")

    lines.append("*/")
    return "\n".join(lines).strip()


def _load_fragment_nodes(base_dir: Path, relative_path: str) -> list[ET.Element]:
    fragment_path = base_dir / relative_path
    if not fragment_path.exists():
        raise SystemExit(f"Missing fragment file referenced by placeholder: {fragment_path}")
    content = fragment_path.read_text(encoding="utf-8").strip()
    if not content:
        return []

    wrapper = (
        f"<codex-wrapper xmlns='{HTML_NS}' xmlns:b='{BLOGGER_NS}' "
        f"xmlns:data='{DATA_NS}' xmlns:expr='{EXPR_NS}'>"
        f"{content}"
        "</codex-wrapper>"
    )
    parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))
    root = ET.fromstring(wrapper, parser=parser)
    nodes: list[ET.Element] = []
    for child in list(root):
        root.remove(child)
        nodes.append(child)
    return nodes


def _read_text_fragment(base_dir: Path, relative_path: str) -> str:
    fragment_path = base_dir / relative_path
    if not fragment_path.exists():
        raise SystemExit(f"Missing text fragment referenced by placeholder: {fragment_path}")
    return fragment_path.read_text(encoding="utf-8")


def _apply_placeholders(
    tree: ET.ElementTree,
    script_map: dict[str, str],
    base_dir: Path,
) -> None:
    root = tree.getroot()
    script_tag = _qname(HTML_NS, "script")

    while True:
        replacements_made = False
        for parent, comment, index in list(_iter_comment_nodes(root)):
            payload = _decode_placeholder(comment.text)
            if not payload:
                continue
            kind = payload.get("kind")

            if kind == "script":
                script_id = payload.get("id")
                if script_id not in script_map:
                    raise SystemExit(f"Script placeholder '{script_id}' is missing from script.js.")
                attrs = payload.get("attrs") or {}
                script_elem = ET.Element(script_tag, attrs)
                script_code = script_map[script_id]
                script_elem.text = script_code if script_code else "\n"
                script_elem.tail = comment.tail
                parent.insert(index, script_elem)
                parent.remove(comment)
                replacements_made = True
                continue

            if kind == "inline-style":
                relative_file = payload.get("file")
                if not relative_file:
                    raise SystemExit("Inline style placeholder is missing the 'file' reference.")
                css_text = _read_text_fragment(base_dir, relative_file)
                attrs = payload.get("attrs") or {}
                style_elem = ET.Element(_qname(HTML_NS, "style"), attrs)
                style_elem.text = css_text if css_text else "\n"
                style_elem.tail = comment.tail
                parent.insert(index, style_elem)
                parent.remove(comment)
                replacements_made = True
                continue

            if kind in {"include", "section", "widget", "includable"}:
                relative_file = payload.get("file")
                if not relative_file:
                    raise SystemExit(f"Placeholder of kind '{kind}' is missing the 'file' reference.")
                nodes = _load_fragment_nodes(base_dir, relative_file)
                if not nodes:
                    parent.remove(comment)
                    replacements_made = True
                    continue
                for offset, node in enumerate(nodes):
                    if offset == len(nodes) - 1:
                        node.tail = comment.tail
                    parent.insert(index + offset, node)
                parent.remove(comment)
                replacements_made = True
                continue

        if not replacements_made:
            break


def _render_xml_with_styles(tree: ET.ElementTree, style_block: str) -> str:
    root = tree.getroot()
    skin_elem = root.find(f".//{_qname(BLOGGER_NS, 'skin')}")
    if skin_elem is None:
        raise SystemExit("Unable to find <b:skin> while packing theme.")

    block = style_block.strip("\n")
    replacement = f"<![CDATA[\n{block}\n]]>" if block else "<![CDATA[]]>"
    xml_str = ET.tostring(root, encoding="unicode")
    if STYLE_PLACEHOLDER_TOKEN not in xml_str:
        raise SystemExit("Main HTML file is missing the CSS placeholder token.")
    return xml_str.replace(STYLE_PLACEHOLDER_TOKEN, replacement, 1)


def pack_theme(unpack_dir: Path, output_xml: Path) -> None:
    main_path = unpack_dir / "main.html"
    styles_path = unpack_dir / "styles.css"
    variables_path = unpack_dir / "variables.json"
    script_path = unpack_dir / "script.js"

    for required in [main_path, styles_path, variables_path, script_path]:
        if not required.exists():
            raise SystemExit(f"Required file is missing: {required}")

    tree = _parse_main_html(main_path)
    _register_namespaces()

    script_map = _read_script_chunks(script_path)
    _apply_placeholders(tree, script_map, unpack_dir)

    variable_entries = _load_variables(variables_path)
    variable_block = _build_variable_block(variable_entries)
    css_text = styles_path.read_text(encoding="utf-8").strip()
    style_sections = [section for section in [variable_block, css_text] if section]
    style_block = "\n\n".join(style_sections)

    xml_body = _render_xml_with_styles(tree, style_block)
    header = "<?xml version='1.0' encoding='UTF-8'?>\n<!DOCTYPE html>\n"
    output_xml.parent.mkdir(parents=True, exist_ok=True)
    output_xml.write_text(header + xml_body + "\n", encoding="utf-8")
    print(f"Packed Blogger theme written to '{output_xml}'.")


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Pack Blogger theme parts into a single XML file.")
    parser.add_argument("unpack_dir", help="Directory that contains the unpacked files.")
    parser.add_argument("output_xml", help="Destination path for the rebuilt Blogger XML file.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv or sys.argv[1:])
    unpack_dir = Path(args.unpack_dir).expanduser().resolve()
    output_xml = Path(args.output_xml).expanduser().resolve()
    pack_theme(unpack_dir, output_xml)


if __name__ == "__main__":
    main()
